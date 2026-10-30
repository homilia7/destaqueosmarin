-- ===============================================================
-- Esquema Cloudflare D1 - Destaqueos y Tanques Sépticos Mauricio Marín
-- ===============================================================

-- 1. Tabla de Configuración Global
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  slot_duration_minutes INTEGER NOT NULL DEFAULT 120,
  max_daily_appointments INTEGER NOT NULL DEFAULT 4,
  default_start_time TEXT NOT NULL DEFAULT '07:00',
  default_end_time TEXT NOT NULL DEFAULT '17:00',
  admin_pin_hash TEXT NOT NULL DEFAULT '1234'
);

INSERT OR IGNORE INTO settings (id, slot_duration_minutes, max_daily_appointments, default_start_time, default_end_time, admin_pin_hash)
VALUES (1, 120, 4, '07:00', '17:00', '1234');

-- 2. Tabla de Días de Trabajo / Disponibilidad
CREATE TABLE IF NOT EXISTS work_days (
  date TEXT PRIMARY KEY,
  is_available INTEGER NOT NULL DEFAULT 1,
  start_time TEXT,
  end_time TEXT,
  slot_duration_minutes INTEGER,
  max_appointments INTEGER,
  blocked_slots_json TEXT
);

-- 3. Tabla de Citas y Despacho
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_address TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  service_type TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  appointment_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  photo_keys_json TEXT,
  photos_deleted INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  amount_collected REAL NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'pendiente',
  payment_breakdown_json TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);

-- 3.1 Gastos Operativos (Gasolina, Alimentación, etc.)
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  receipt_url TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date);

-- 4. Catálogo de Servicios
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  badge TEXT,
  description TEXT NOT NULL,
  price REAL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insertar servicios por defecto de Mauricio Marín
INSERT OR IGNORE INTO services (id, title, badge, description, price) VALUES
('tanque_septico', 'Limpieza de Tanques Sépticos', 'Camión Cisterna', 'Succión y descarga autorizada con camión de alto vacío para tanques residenciales y comerciales.', 85000),
('destaqueo', 'Destaqueo de Tuberías y Drenajes', 'Cero Roturas', 'Destape de inodoros, fregaderos, lavamanos y tuberías principales con sondas rotativas eléctricas.', 45000),
('trampa_grasa', 'Limpieza de Trampas de Grasa', 'Comercios y Restaurantes', 'Mantenimiento preventivo y correctivo con retiro de grasas para sodas y plantas de alimentos.', 50000),
('camara_cctv', 'Inspección de Tuberías con Cámara', 'Diagnóstico HD', 'Video-inspección de tuberías subterráneas para detectar fisuras, raíces y obstrucciones exactas.', 60000),
('cajas_registro', 'Mantenimiento de Cajas de Registro', 'Garantía 100%', 'Desazolve, limpieza profunda y sellado hermético de cajas de registro y salidas sanitarias.', 40000);

-- 5. Reseñas y Testimonios con Validación Anti-Fraude
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  appointment_id TEXT,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  service_type TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_verified INTEGER NOT NULL DEFAULT 1,
  is_published INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_reviews_phone ON reviews (client_phone);

-- 6. Cotizaciones Formales
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  appointment_id TEXT,
  quote_number TEXT NOT NULL,
  date TEXT NOT NULL,
  company_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_location TEXT,
  client_phone TEXT NOT NULL,
  work_reference TEXT,
  scope_items TEXT,
  labor_cost REAL DEFAULT 0,
  materials_cost REAL DEFAULT 0,
  materials_detail TEXT,
  apply_iva INTEGER DEFAULT 0,
  delivery_time TEXT,
  total_amount REAL DEFAULT 0,
  file_name TEXT,
  responsible_name TEXT,
  responsible_phone TEXT,
  status TEXT DEFAULT 'por_enviar',
  is_downloaded INTEGER DEFAULT 0,
  downloaded_at DATETIME,
  view_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Métricas y Eventos de Tráfico
CREATE TABLE IF NOT EXISTS traffic_events (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_traffic_created ON traffic_events (created_at);

-- 8. Suscripciones Web Push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT NOT NULL UNIQUE,
  keys_json TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

