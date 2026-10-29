import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

type Bindings = {
  DB?: D1Database;
  PHOTOS_BUCKET?: R2Bucket;
  ADMIN_PIN?: string;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${mStr} ${ampm}`;
}

// Health Check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    edge: 'Cloudflare Pages Functions'
  });
});

// 1. Verificación de PIN Admin
app.post('/admin/verify-pin', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const pin = body.pin;
  const configuredPin = c.env.ADMIN_PIN || '1234';

  if (c.env.DB) {
    try {
      const res = await c.env.DB.prepare('SELECT admin_pin_hash FROM settings WHERE id = 1').first<{ admin_pin_hash: string }>();
      if (res?.admin_pin_hash) {
        return c.json({ valid: pin === res.admin_pin_hash });
      }
    } catch (e) {
      console.warn('D1 PIN query error:', e);
    }
  }

  return c.json({ valid: pin === configuredPin });
});

// 2. Configuración Global (Settings)
app.get('/settings', async (c) => {
  if (c.env.DB) {
    try {
      const row = await c.env.DB.prepare('SELECT * FROM settings WHERE id = 1').first();
      if (row) return c.json(row);
    } catch (e) {
      console.warn('D1 settings error:', e);
    }
  }

  return c.json({
    slot_duration_minutes: 120,
    max_daily_appointments: 4,
    default_start_time: '08:00',
    default_end_time: '17:00',
    admin_pin_hash: c.env.ADMIN_PIN || '1234'
  });
});

app.put('/settings', async (c) => {
  const body = await c.req.json();
  if (c.env.DB) {
    try {
      await c.env.DB.prepare(`
        UPDATE settings 
        SET slot_duration_minutes = ?, max_daily_appointments = ?, default_start_time = ?, default_end_time = ?
        WHERE id = 1
      `).bind(
        body.slot_duration_minutes || 120,
        body.max_daily_appointments || 4,
        body.default_start_time || '08:00',
        body.default_end_time || '17:00'
      ).run();
    } catch (e) {
      console.warn('D1 settings update error:', e);
    }
  }
  return c.json({ success: true, ...body });
});

// 3. Días de Trabajo y Disponibilidad
app.get('/work-days', async (c) => {
  if (c.env.DB) {
    try {
      const { results } = await c.env.DB.prepare('SELECT * FROM work_days').all();
      const map: Record<string, unknown> = {};
      results?.forEach((r: any) => {
        map[r.date] = {
          ...r,
          is_available: r.is_available === 1,
          blocked_slots: r.blocked_slots_json ? JSON.parse(r.blocked_slots_json) : []
        };
      });
      return c.json(map);
    } catch (e) {
      console.warn('D1 work-days error:', e);
    }
  }
  return c.json({});
});

app.post('/work-days', async (c) => {
  const body = await c.req.json();
  if (c.env.DB) {
    try {
      await c.env.DB.prepare(`
        INSERT INTO work_days (date, is_available, start_time, end_time, slot_duration_minutes, max_appointments, blocked_slots_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
          is_available = excluded.is_available,
          start_time = excluded.start_time,
          end_time = excluded.end_time,
          slot_duration_minutes = excluded.slot_duration_minutes,
          max_appointments = excluded.max_appointments,
          blocked_slots_json = excluded.blocked_slots_json
      `).bind(
        body.date,
        body.is_available ? 1 : 0,
        body.start_time || '08:00',
        body.end_time || '17:00',
        body.slot_duration_minutes || null,
        body.max_appointments || null,
        body.blocked_slots ? JSON.stringify(body.blocked_slots) : null
      ).run();
    } catch (e) {
      console.warn('D1 work-days save error:', e);
    }
  }
  return c.json({ success: true, workDay: body });
});

// 4. Consulta de Disponibilidad de Horarios
app.get('/availability', async (c) => {
  const date = c.req.query('date') || new Date().toISOString().split('T')[0];

  let durationMinutes = 120;
  let maxAppointments = 4;
  let startTime = '08:00';
  let endTime = '17:00';
  let isAvailable = true;
  let blockedSlots: string[] = [];
  const bookedStartTimes: string[] = [];

  if (c.env.DB) {
    try {
      const settings = await c.env.DB.prepare('SELECT * FROM settings WHERE id = 1').first<any>();
      if (settings) {
        durationMinutes = settings.slot_duration_minutes;
        maxAppointments = settings.max_daily_appointments;
        startTime = settings.default_start_time;
        endTime = settings.default_end_time;
      }

      const workDay = await c.env.DB.prepare('SELECT * FROM work_days WHERE date = ?').bind(date).first<any>();
      if (workDay) {
        isAvailable = workDay.is_available === 1;
        if (workDay.start_time) startTime = workDay.start_time;
        if (workDay.end_time) endTime = workDay.end_time;
        if (workDay.slot_duration_minutes) durationMinutes = workDay.slot_duration_minutes;
        if (workDay.max_appointments) maxAppointments = workDay.max_appointments;
        if (workDay.blocked_slots_json) blockedSlots = JSON.parse(workDay.blocked_slots_json);
      }

      const { results } = await c.env.DB.prepare(
        "SELECT start_time FROM appointments WHERE appointment_date = ? AND status != 'cancelled'"
      ).bind(date).all();

      results?.forEach((r: any) => bookedStartTimes.push(r.start_time));
    } catch (e) {
      console.warn('D1 availability check error:', e);
    }
  }

  if (!isAvailable) {
    return c.json({
      date,
      is_available: false,
      start_time: startTime,
      end_time: endTime,
      slots: [],
      total_booked: bookedStartTimes.length,
      max_allowed: 0,
      remaining_slots: 0
    });
  }

  const isDayFull = bookedStartTimes.length >= maxAppointments;
  const slots: Array<{ start_time: string; end_time: string; label: string; available: boolean; reason?: string }> = [];

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let currentMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;

  while (currentMin + durationMinutes <= endMin) {
    const sH = Math.floor(currentMin / 60);
    const sM = currentMin % 60;
    const startSlot = `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}`;

    const nextMin = currentMin + durationMinutes;
    const eH = Math.floor(nextMin / 60);
    const eM = nextMin % 60;
    const endSlot = `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`;

    const isBooked = bookedStartTimes.includes(startSlot);
    const isManuallyBlocked = blockedSlots.includes(startSlot);

    slots.push({
      start_time: startSlot,
      end_time: endSlot,
      label: `${formatTime12h(startSlot)} - ${formatTime12h(endSlot)}`,
      available: !isDayFull && !isBooked && !isManuallyBlocked,
      reason: isDayFull ? 'Cupo diario completo' : (isBooked ? 'Ocupado' : (isManuallyBlocked ? 'Bloqueado por admin' : undefined))
    });

    currentMin += durationMinutes;
  }

  const remaining = Math.max(0, maxAppointments - bookedStartTimes.length);

  return c.json({
    date,
    is_available: true,
    start_time: startTime,
    end_time: endTime,
    slots,
    total_booked: bookedStartTimes.length,
    max_allowed: maxAppointments,
    remaining_slots: remaining
  });
});

// 5. Citas (Appointments) con Purga Automática de Fotos 24h después de la Cita
app.get('/appointments', async (c) => {
  if (c.env.DB) {
    try {
      const { results } = await c.env.DB.prepare(
        'SELECT * FROM appointments ORDER BY appointment_date ASC, start_time ASC'
      ).all();

      const nowMillis = Date.now();
      const rows = results || [];

      // Detección y purga automática de fotos 24 horas después de la hora programada de la cita
      // El registro de la cita se mantiene de forma permanente para el control de métricas semanales/mensuales
      for (const r of rows as any[]) {
        if (r.photos_deleted === 0 && r.photo_keys_json && r.photo_keys_json !== '[]') {
          const appointmentUtcMillis = Date.parse(`${r.appointment_date}T${r.end_time || r.start_time || '17:00'}:00-06:00`);
          if (!isNaN(appointmentUtcMillis) && nowMillis >= appointmentUtcMillis + 24 * 60 * 60 * 1000) {
            if (c.env.PHOTOS_BUCKET) {
              try {
                const keys: string[] = JSON.parse(r.photo_keys_json);
                for (const k of keys) {
                  const cleanKey = k.replace('/api/photos/', '');
                  await c.env.PHOTOS_BUCKET.delete(cleanKey).catch(() => {});
                }
              } catch (err) {
                console.warn('Error deleting photo keys from R2:', err);
              }
            }

            await c.env.DB.prepare(
              "UPDATE appointments SET photos_deleted = 1, photo_keys_json = '[]', status = CASE WHEN status = 'pending' THEN 'completed' ELSE status END WHERE id = ?"
            ).bind(r.id).run().catch(() => {});

            r.photos_deleted = 1;
            r.photo_keys_json = '[]';
            if (r.status === 'pending') r.status = 'completed';
          }
        }
      }

      const list = rows.map((r: any) => ({
        ...r,
        amount_collected: Number(r.amount_collected || 0),
        payment_method: r.payment_method || 'sinpe',
        photo_keys: r.photo_keys_json ? JSON.parse(r.photo_keys_json) : []
      }));
      return c.json(list || []);
    } catch (e) {
      console.warn('D1 get appointments error:', e);
    }
  }
  return c.json([]);
});

app.post('/appointments', async (c) => {
  const body = await c.req.json();
  const id = 'app_' + crypto.randomUUID();
  const photoKeys: string[] = [];

  if (body.photos && Array.isArray(body.photos) && c.env.PHOTOS_BUCKET) {
    for (let i = 0; i < Math.min(body.photos.length, 3); i++) {
      const photo = body.photos[i];
      if (photo.dataUrl) {
        try {
          const base64Data = photo.dataUrl.split(',')[1];
          const binary = Uint8Array.from(atob(base64Data), (char) => char.charCodeAt(0));
          const key = `fuga_${id}_${i + 1}.webp`;
          await c.env.PHOTOS_BUCKET.put(key, binary, {
            httpMetadata: { contentType: 'image/webp' }
          });
          photoKeys.push(`/api/photos/${key}`);
        } catch (e) {
          console.warn('R2 photo upload error:', e);
          photoKeys.push(photo.dataUrl);
        }
      }
    }
  } else if (body.photos && Array.isArray(body.photos)) {
    body.photos.forEach((p: any) => photoKeys.push(p.dataUrl));
  }

  if (c.env.DB) {
    try {
      await c.env.DB.prepare(`
        INSERT INTO appointments (
          id, client_name, client_phone, client_address, latitude, longitude, service_type, problem_description,
          appointment_date, start_time, end_time, photo_keys_json, photos_deleted, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'pending')
      `).bind(
        id,
        body.client_name,
        body.client_phone,
        body.client_address,
        body.latitude || null,
        body.longitude || null,
        body.service_type,
        body.problem_description,
        body.appointment_date,
        body.start_time,
        body.end_time,
        JSON.stringify(photoKeys)
      ).run();
    } catch (e) {
      console.warn('D1 insert appointment error:', e);
    }
  }

  const created = {
    id,
    client_name: body.client_name,
    client_phone: body.client_phone,
    client_address: body.client_address,
    latitude: body.latitude || null,
    longitude: body.longitude || null,
    service_type: body.service_type,
    problem_description: body.problem_description,
    appointment_date: body.appointment_date,
    start_time: body.start_time,
    end_time: body.end_time,
    photo_keys: photoKeys,
    photos_deleted: 0,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  return c.json(created, 201);
});

// 6. Actualización de Estado (Purga fotos de R2 si se completa)
app.patch('/appointments/:id/status', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const status = body.status;

  if (c.env.DB) {
    try {
      if (status === 'completed' && c.env.PHOTOS_BUCKET) {
        const appRow = await c.env.DB.prepare('SELECT photo_keys_json FROM appointments WHERE id = ?').bind(id).first<any>();
        if (appRow?.photo_keys_json) {
          const keys: string[] = JSON.parse(appRow.photo_keys_json);
          for (const k of keys) {
            const cleanKey = k.replace('/api/photos/', '');
            await c.env.PHOTOS_BUCKET.delete(cleanKey).catch(() => {});
          }
        }

        await c.env.DB.prepare(
          "UPDATE appointments SET status = ?, photos_deleted = 1, photo_keys_json = '[]' WHERE id = ?"
        ).bind(status, id).run();
      } else {
        await c.env.DB.prepare('UPDATE appointments SET status = ? WHERE id = ?').bind(status, id).run();
      }

      const updated = await c.env.DB.prepare('SELECT * FROM appointments WHERE id = ?').bind(id).first<any>();
      if (updated) {
        return c.json({
          ...updated,
          photo_keys: updated.photo_keys_json ? JSON.parse(updated.photo_keys_json) : []
        });
      }
    } catch (e) {
      console.warn('D1 update status error:', e);
    }
  }

  return c.json({ id, status, success: true });
});

// 6.1 Actualización General de Cita (ej. Cambiar o Agregar Servicios)
app.patch('/appointments/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const serviceType = body.service_type;

  if (c.env.DB) {
    try {
      if (serviceType) {
        await c.env.DB.prepare('UPDATE appointments SET service_type = ? WHERE id = ?')
          .bind(serviceType, id).run();
      }
      if (body.status) {
        await c.env.DB.prepare('UPDATE appointments SET status = ? WHERE id = ?')
          .bind(body.status, id).run();
      }
      if (body.amount_collected !== undefined) {
        await c.env.DB.prepare('UPDATE appointments SET amount_collected = ? WHERE id = ?')
          .bind(Number(body.amount_collected || 0), id).run();
      }
      if (body.payment_method) {
        await c.env.DB.prepare('UPDATE appointments SET payment_method = ? WHERE id = ?')
          .bind(body.payment_method, id).run();
      }

      const updated = await c.env.DB.prepare('SELECT * FROM appointments WHERE id = ?').bind(id).first<any>();
      if (updated) {
        return c.json({
          ...updated,
          photo_keys: updated.photo_keys_json ? JSON.parse(updated.photo_keys_json) : []
        });
      }
    } catch (e) {
      console.warn('D1 update appointment error:', e);
    }
  }

  return c.json({ id, ...body, success: true });
});

// 6.2 Catálogo Dinámico de Servicios
app.get('/services', async (c) => {
  const defaults = [
    { id: 'srv_1', title: 'Limpieza de Tanques Sépticos', badge: 'Camión Cisterna', description: 'Vaciado profesional con camión de alto vacío y disposición autorizada.', price: 85000 },
    { id: 'srv_2', title: 'Destaqueo de Tuberías y Drenajes', badge: 'Sondas Rotativas', description: 'Desobstrucción inmediata sin romper pisos ni paredes.', price: 45000 },
    { id: 'srv_3', title: 'Limpieza de Trampas de Grasa', badge: 'Comercial & Sodas', description: 'Mantenimiento preventivo y correctivo con registro ambiental.', price: 50000 },
    { id: 'srv_4', title: 'Inspección de Tuberías con Cámara CCTV HD', badge: 'Diagnóstico HD', description: 'Inspección con cámara y video digital de tuberías ocultas.', price: 60000 },
    { id: 'srv_5', title: 'Mantenimiento de Cajas de Registro', badge: 'Estructural', description: 'Reparación y mantenimiento integral de cajas sanitarias.', price: 40000 }
  ];

  if (c.env.DB) {
    try {
      try {
        await c.env.DB.prepare('ALTER TABLE services ADD COLUMN price REAL').run();
      } catch {}

      const { results } = await c.env.DB.prepare('SELECT * FROM services ORDER BY created_at ASC').all();
      if (results && results.length > 0) {
        const withPrices = results.map((r: any) => {
          if (r.price === null || r.price === undefined || r.price === '') {
            const def = defaults.find(d => d.id === r.id || d.title.toLowerCase() === (r.title || '').toLowerCase());
            return { ...r, price: def ? def.price : 35000 };
          }
          return { ...r, price: Number(r.price) || 0 };
        });
        return c.json(withPrices);
      }
    } catch (e) {
      console.warn('D1 get services error:', e);
    }
  }

  return c.json(defaults);
});

app.post('/services', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const id = 'srv_' + crypto.randomUUID().substring(0, 8);
  const title = (body.title || '').trim();
  const badge = (body.badge || '').trim() || 'Servicio Extra';
  const description = (body.description || '').trim();
  const price = Number(body.price) || 35000;

  if (!title) {
    return c.json({ error: 'El título del servicio es requerido' }, 400);
  }

  const newService = { id, title, badge, description, price, created_at: new Date().toISOString() };

  if (c.env.DB) {
    try {
      try {
        await c.env.DB.prepare('ALTER TABLE services ADD COLUMN price REAL').run();
      } catch {}

      await c.env.DB.prepare(
        'INSERT INTO services (id, title, badge, description, price) VALUES (?, ?, ?, ?, ?)'
      ).bind(id, title, badge, description, price).run();
    } catch (e) {
      console.warn('D1 insert service error:', e);
    }
  }

  return c.json(newService, 201);
});

app.patch('/services/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));

  if (c.env.DB) {
    try {
      try {
        await c.env.DB.prepare('ALTER TABLE services ADD COLUMN price REAL').run();
      } catch {}

      const fields: string[] = [];
      const values: any[] = [];

      if (body.title !== undefined) {
        fields.push('title = ?');
        values.push(body.title.trim());
      }
      if (body.badge !== undefined) {
        fields.push('badge = ?');
        values.push(body.badge.trim());
      }
      if (body.description !== undefined) {
        fields.push('description = ?');
        values.push(body.description.trim());
      }
      if (body.price !== undefined) {
        fields.push('price = ?');
        values.push(Number(body.price) || 0);
      }

      if (fields.length > 0) {
        values.push(id);
        await c.env.DB.prepare(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
      }

      const updated = await c.env.DB.prepare('SELECT * FROM services WHERE id = ?').bind(id).first();
      if (updated) {
        return c.json(updated);
      }
    } catch (e) {
      console.warn('D1 update service error:', e);
    }
  }

  return c.json({ id, ...body });
});

app.delete('/services/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env.DB) {
    try {
      await c.env.DB.prepare('DELETE FROM services WHERE id = ?').bind(id).run();
    } catch (e) {
      console.warn('D1 delete service error:', e);
    }
  }
  return c.json({ success: true, id });
});

// 7. Servir Fotos desde R2
app.get('/photos/:key', async (c) => {
  const key = c.req.param('key');
  if (c.env.PHOTOS_BUCKET) {
    const object = await c.env.PHOTOS_BUCKET.get(key);
    if (object) {
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      return new Response(object.body, { headers });
    }
  }
  return c.text('Foto no encontrada o ya purgada', 404);
});

// 8. Auto-Limpieza / Purga de Fotos 24h (Conserva registros para KPIs)
app.post('/admin/cleanup', async (c) => {
  let deletedPhotos = 0;

  if (c.env.DB) {
    try {
      const { results } = await c.env.DB.prepare(`
        SELECT id, photo_keys_json, appointment_date, end_time, start_time, status 
        FROM appointments 
        WHERE photos_deleted = 0
      `).all();

      const nowMillis = Date.now();

      if (results && results.length > 0) {
        for (const row of results as any[]) {
          const appointmentUtcMillis = Date.parse(`${row.appointment_date}T${row.end_time || row.start_time || '17:00'}:00-06:00`);
          const isOlderThan24h = !isNaN(appointmentUtcMillis) && nowMillis >= appointmentUtcMillis + 24 * 60 * 60 * 1000;

          if (isOlderThan24h || row.status === 'completed') {
            if (row.photo_keys_json && c.env.PHOTOS_BUCKET) {
              try {
                const keys: string[] = JSON.parse(row.photo_keys_json);
                for (const k of keys) {
                  const cleanKey = k.replace('/api/photos/', '');
                  await c.env.PHOTOS_BUCKET.delete(cleanKey).catch(() => {});
                  deletedPhotos++;
                }
              } catch (e) {
                console.warn('Cleanup photo delete error:', e);
              }
            }
            await c.env.DB.prepare(
              "UPDATE appointments SET photos_deleted = 1, photo_keys_json = '[]', status = CASE WHEN status = 'pending' THEN 'completed' ELSE status END WHERE id = ?"
            ).bind(row.id).run().catch(() => {});
          }
        }
      }

      // No se eliminan los registros de citas de D1 para que el administrador
      // conserve siempre el control histórico de citas por semana y por mes.
    } catch (e) {
      console.warn('D1 cleanup error:', e);
    }
  }

  return c.json({ deletedPhotos, deletedOldAppointments: 0 });
});

// 9. Suscripciones Web Push
app.post('/push/subscribe', async (c) => {
  const body = await c.req.json();
  if (c.env.DB && body.endpoint) {
    try {
      await c.env.DB.prepare(`
        INSERT INTO push_subscriptions (endpoint, keys_json)
        VALUES (?, ?)
        ON CONFLICT(endpoint) DO UPDATE SET keys_json = excluded.keys_json
      `).bind(body.endpoint, JSON.stringify(body.keys || {})).run();
    } catch (e) {
      console.warn('D1 push subscribe error:', e);
    }
  }
  return c.json({ success: true });
});

// 10. Testimonios y Calificaciones de Clientes (Reviews)
app.get('/reviews', async (c) => {
  if (c.env.DB) {
    try {
      const { results } = await c.env.DB.prepare(
        'SELECT * FROM reviews WHERE is_published = 1 ORDER BY created_at DESC'
      ).all();
      return c.json(results || []);
    } catch (e) {
      console.warn('D1 get reviews error:', e);
    }
  }
  return c.json([]);
});

app.post('/reviews', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const clientName = (body.client_name || '').trim();
  const comment = (body.comment || '').trim();
  const rawRating = Number(body.rating || 5);
  const rating = Math.min(5, Math.max(1, isNaN(rawRating) ? 5 : Math.round(rawRating)));
  const serviceType = (body.service_type || 'Limpieza de Tanques Sépticos').trim();
  let appointmentId = body.appointment_id || null;
  const clientPhone = (body.client_phone || '').trim();

  if (!clientName || !comment) {
    return c.json({ error: 'El nombre y el comentario son requeridos.' }, 400);
  }

  if (!clientPhone) {
    return c.json({ error: 'El número de teléfono es obligatorio para verificar la autenticidad de la reseña.' }, 400);
  }

  // Normalizar los últimos 8 dígitos del número telefónico (estándar en Costa Rica)
  const phoneDigits = clientPhone.replace(/\D/g, '');
  const last8Digits = phoneDigits.length >= 8 ? phoneDigits.slice(-8) : phoneDigits;

  if (last8Digits.length < 8) {
    return c.json({ error: 'Por favor ingrese un número telefónico válido de al menos 8 dígitos.' }, 400);
  }

  let matchedAppointment: any = null;

  if (c.env.DB) {
    try {
      // Buscar en todas las citas agendadas si existe este número de teléfono o ID de cita
      const { results } = await c.env.DB.prepare(
        'SELECT id, client_name, client_phone, service_type FROM appointments'
      ).all();

      if (results && results.length > 0) {
        matchedAppointment = results.find((a: any) => {
          if (appointmentId && a.id === appointmentId) return true;
          const aDigits = (a.client_phone || '').replace(/\D/g, '');
          const aLast8 = aDigits.length >= 8 ? aDigits.slice(-8) : aDigits;
          return aLast8 === last8Digits;
        });
      }
    } catch (e) {
      console.warn('D1 appointment lookup error:', e);
    }
  }

  // VALIDACIÓN ESTRICTA: Si el teléfono no coincide con ninguna cita agendada, denegar acceso
  if (!matchedAppointment) {
    return c.json({
      error: 'Acceso denegado: Este número de teléfono no coincide con ningún cliente registrado en las citas de Destaqueos Mauricio Marín. Solo los clientes con trabajos agendados pueden publicar testimonios verificados.'
    }, 403);
  }

  // Vincular la cita real confirmada
  if (!appointmentId && matchedAppointment) {
    appointmentId = matchedAppointment.id;
  }

  const id = 'rev_' + crypto.randomUUID().substring(0, 10);
  const createdAt = new Date().toISOString();

  const newReview = {
    id,
    appointment_id: appointmentId,
    client_name: clientName,
    client_phone: clientPhone,
    rating,
    comment,
    service_type: serviceType,
    created_at: createdAt,
    is_verified: 1,
    is_published: 1
  };

  if (c.env.DB) {
    try {
      await c.env.DB.prepare(`
        INSERT INTO reviews (id, appointment_id, client_name, client_phone, rating, comment, service_type, created_at, is_verified, is_published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
      `).bind(id, appointmentId, clientName, clientPhone, rating, comment, serviceType, createdAt).run();
    } catch (e) {
      console.warn('D1 insert review error:', e);
    }
  }

  return c.json(newReview, 201);
});

app.delete('/reviews/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env.DB) {
    try {
      await c.env.DB.prepare('DELETE FROM reviews WHERE id = ?').bind(id).run();
    } catch (e) {
      console.warn('D1 delete review error:', e);
    }
  }
  return c.json({ success: true, id });
});

// ----------------------------------------------------
// RUTAS DE COTIZACIONES DINÁMICAS (QUOTES)
// ----------------------------------------------------
app.get('/quotes', async (c) => {
  if (c.env.DB) {
    try {
      const { results } = await c.env.DB.prepare(
        'SELECT * FROM quotes ORDER BY created_at DESC'
      ).all();
      return c.json(results || []);
    } catch (e) {
      console.warn('D1 get quotes error:', e);
    }
  }
  return c.json([]);
});

app.get('/quotes/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env.DB) {
    try {
      // Incrementar contador de vistas al abrir la cotización
      await c.env.DB.prepare('UPDATE quotes SET view_count = view_count + 1 WHERE id = ?').bind(id).run();
      const quote = await c.env.DB.prepare('SELECT * FROM quotes WHERE id = ?').bind(id).first();
      if (quote) {
        return c.json(quote);
      }
    } catch (e) {
      console.warn('D1 get quote by id error:', e);
    }
  }
  return c.json({ error: 'Cotización no encontrada' }, 404);
});

app.post('/quotes', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const id = body.id || 'cot_' + crypto.randomUUID().substring(0, 10);
  const quoteNumber = body.quote_number || body.quoteNumber || 'COT-2026';
  const date = body.date || new Date().toISOString().split('T')[0];
  const companyName = body.company_name || body.companyName || 'Destaqueos y Tanques Sépticos Mauricio Marín';
  const clientName = (body.client_name || body.clientName || '').trim();
  const clientLocation = (body.client_location || body.clientLocation || '').trim();
  const clientPhone = (body.client_phone || body.clientPhone || '').trim();
  const workReference = (body.work_reference || body.workReference || '').trim();
  const scopeItems = typeof body.scope_items === 'string' 
    ? body.scope_items 
    : JSON.stringify(body.scopeItems || body.scope_items || []);
  const laborCost = Number(body.labor_cost ?? body.laborCost ?? 0);
  const materialsCost = Number(body.materials_cost ?? body.materialsCost ?? 0);
  const materialsDetail = body.materials_detail || body.materialsDetail || '';
  const applyIva = (body.apply_iva || body.applyIVA) ? 1 : 0;
  const deliveryTime = body.delivery_time || body.deliveryTime || '1 día hábil';
  const totalAmount = Number(body.total_amount ?? body.totalAmount ?? (laborCost + materialsCost + (applyIva ? Math.round((laborCost + materialsCost) * 0.13) : 0)));
  const fileName = body.file_name || body.fileName || `Cotizacion-${quoteNumber}`;
  const responsibleName = body.responsible_name || body.responsibleName || 'Mauricio Marín';
  const responsiblePhone = body.responsible_phone || body.responsiblePhone || '6114-1421';
  const status = body.status || 'por_enviar';

  if (c.env.DB) {
    try {
      await c.env.DB.prepare(`
        INSERT INTO quotes (
          id, quote_number, date, company_name, client_name, client_location, client_phone,
          work_reference, scope_items, labor_cost, materials_cost, materials_detail,
          apply_iva, delivery_time, total_amount, file_name, responsible_name, responsible_phone, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          quote_number = excluded.quote_number,
          date = excluded.date,
          company_name = excluded.company_name,
          client_name = excluded.client_name,
          client_location = excluded.client_location,
          client_phone = excluded.client_phone,
          work_reference = excluded.work_reference,
          scope_items = excluded.scope_items,
          labor_cost = excluded.labor_cost,
          materials_cost = excluded.materials_cost,
          materials_detail = excluded.materials_detail,
          apply_iva = excluded.apply_iva,
          delivery_time = excluded.delivery_time,
          total_amount = excluded.total_amount,
          file_name = excluded.file_name,
          responsible_name = excluded.responsible_name,
          responsible_phone = excluded.responsible_phone,
          status = excluded.status,
          updated_at = CURRENT_TIMESTAMP
      `).bind(
        id, quoteNumber, date, companyName, clientName, clientLocation, clientPhone,
        workReference, scopeItems, laborCost, materialsCost, materialsDetail,
        applyIva, deliveryTime, totalAmount, fileName, responsibleName, responsiblePhone, status
      ).run();
    } catch (e) {
      console.warn('D1 insert/update quote error:', e);
    }
  }

  return c.json({
    id,
    quote_number: quoteNumber,
    client_name: clientName,
    total_amount: totalAmount,
    file_name: fileName,
    status,
    share_url: `/cotizacion/${id}`
  }, 201);
});

// Actualizar estado de la cotización (por_enviar / enviada)
app.patch('/quotes/:id/status', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const status = body.status || 'por_enviar';
  if (c.env.DB) {
    try {
      await c.env.DB.prepare('UPDATE quotes SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(status, id).run();
      return c.json({ success: true, id, status });
    } catch (e) {
      console.warn('D1 update quote status error:', e);
    }
  }
  return c.json({ success: true, id, status });
});

// Registrar evento de descarga por parte del cliente
app.post('/quotes/:id/downloaded', async (c) => {
  const id = c.req.param('id');
  const now = new Date().toISOString();
  if (c.env.DB) {
    try {
      await c.env.DB.prepare(`
        UPDATE quotes 
        SET is_downloaded = 1, downloaded_at = ?, status = 'enviada', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(now, id).run();
      return c.json({ success: true, downloaded_at: now });
    } catch (e) {
      console.warn('D1 mark quote downloaded error:', e);
    }
  }
  return c.json({ success: true, downloaded_at: now });
});

app.delete('/quotes/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env.DB) {
    try {
      await c.env.DB.prepare('DELETE FROM quotes WHERE id = ?').bind(id).run();
    } catch (e) {
      console.warn('D1 delete quote error:', e);
    }
  }
  return c.json({ success: true, id });
});

// 12. RASTREADOR DE TRÁFICO Y EMBUDO DE CONVERSIÓN (FB, IG, WA, DIRECT)
app.post('/traffic/event', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  let source = String(body.source || 'direct').toLowerCase().trim();
  if (source.includes('face') || source === 'facebook') source = 'fb';
  if (source.includes('insta') || source === 'instagram') source = 'ig';
  if (source.includes('what') || source === 'whatsapp') source = 'wa';
  if (source.includes('goog') || source.includes('ad') || source === 'gads' || source === 'cpc') source = 'google';
  if (!['fb', 'ig', 'wa', 'google', 'direct'].includes(source)) {
    source = 'direct';
  }

  const eventType = body.event_type || 'visit'; // 'visit' | 'agenda_click' | 'booking'
  const path = body.path || '/';
  const id = `trf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (c.env.DB) {
    try {
      await c.env.DB.prepare(`
        INSERT INTO traffic_events (id, source, event_type, path)
        VALUES (?, ?, ?, ?)
      `).bind(id, source, eventType, path).run();
    } catch (e) {
      console.warn('D1 traffic event insert error:', e);
    }
  }

  return c.json({ success: true, id, source, eventType }, 201);
});

app.get('/traffic/stats', async (c) => {
  const period = c.req.query('period') || 'month'; // 'week' | 'biweek' | 'month' | 'all'
  let dateFilter = "";
  if (period === 'week') {
    dateFilter = "WHERE created_at >= datetime('now', '-7 days')";
  } else if (period === 'biweek') {
    dateFilter = "WHERE created_at >= datetime('now', '-15 days')";
  } else if (period === 'month') {
    dateFilter = "WHERE created_at >= datetime('now', '-30 days')";
  }

  let rows: any[] = [];
  let recentEvents: any[] = [];

  if (c.env.DB) {
    try {
      const statsQuery = `
        SELECT 
          source,
          SUM(CASE WHEN event_type = 'visit' THEN 1 ELSE 0 END) as visits,
          SUM(CASE WHEN event_type = 'agenda_click' THEN 1 ELSE 0 END) as clicks,
          SUM(CASE WHEN event_type = 'booking' THEN 1 ELSE 0 END) as bookings
        FROM traffic_events
        ${dateFilter}
        GROUP BY source
      `;
      const { results } = await c.env.DB.prepare(statsQuery).all();
      rows = results || [];

      const recentQuery = `
        SELECT id, source, event_type, path, created_at 
        FROM traffic_events 
        ORDER BY created_at DESC 
        LIMIT 20
      `;
      const recentRes = await c.env.DB.prepare(recentQuery).all();
      recentEvents = recentRes.results || [];
    } catch (e) {
      console.warn('D1 traffic stats error:', e);
    }
  }

  const sources = ['fb', 'ig', 'wa', 'google', 'direct'];
  const bySource: Record<string, { visits: number; clicks: number; bookings: number; clickRate: number; conversionRate: number }> = {};
  
  let totalVisits = 0;
  let totalClicks = 0;
  let totalBookings = 0;

  sources.forEach((s) => {
    const found = rows.find((r) => r.source === s) || { visits: 0, clicks: 0, bookings: 0 };
    const visits = Number(found.visits) || 0;
    const clicks = Number(found.clicks) || 0;
    const bookings = Number(found.bookings) || 0;
    const clickRate = visits > 0 ? Number(((clicks / visits) * 100).toFixed(1)) : 0;
    const conversionRate = visits > 0 ? Number(((bookings / visits) * 100).toFixed(1)) : 0;

    bySource[s] = { visits, clicks, bookings, clickRate, conversionRate };
    totalVisits += visits;
    totalClicks += clicks;
    totalBookings += bookings;
  });

  const overallClickRate = totalVisits > 0 ? Number(((totalClicks / totalVisits) * 100).toFixed(1)) : 0;
  const overallConversionRate = totalVisits > 0 ? Number(((totalBookings / totalVisits) * 100).toFixed(1)) : 0;

  return c.json({
    period,
    bySource,
    totals: {
      visits: totalVisits,
      clicks: totalClicks,
      bookings: totalBookings,
      clickRate: overallClickRate,
      conversionRate: overallConversionRate
    },
    recentEvents
  });
});

export const onRequest = handle(app);
