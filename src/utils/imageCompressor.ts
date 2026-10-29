/**
 * Compresión de imágenes en el cliente mediante Canvas API a formato WebP.
 * Garantiza carga ultra-rápida y ahorro de almacenamiento en Cloudflare R2.
 */
export interface CompressedImage {
  name: string;
  blob: Blob;
  dataUrl: string;
  originalSizeKB: number;
  compressedSizeKB: number;
}

export async function compressImageToWebP(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Mantener relación de aspecto proporcional
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el contexto 2D del Canvas.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Fallo al generar Blob WebP.'));
              return;
            }

            const compressedDataUrl = canvas.toDataURL('image/webp', quality);
            const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".webp";

            resolve({
              name: cleanName,
              blob,
              dataUrl: compressedDataUrl,
              originalSizeKB: Math.round(file.size / 1024),
              compressedSizeKB: Math.round(blob.size / 1024)
            });
          },
          'image/webp',
          quality
        );
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}
