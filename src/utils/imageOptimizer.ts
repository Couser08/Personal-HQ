/**
 * Compresses an image file and converts it to WebP format client-side.
 * @param file The original image file selected by the user.
 * @param maxWidth The maximum width of the output image (default: 800px).
 * @param quality The quality of the WebP output (default: 0.8).
 * @returns A promise that resolves to a WebP Blob (or the original File if browser support is missing/fails).
 */
export function compressAndConvertToWebP(
  file: File,
  maxWidth = 800,
  quality = 0.8
): Promise<Blob | File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Maintain aspect ratio
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            'image/webp',
            quality
          );
        } catch (err) {
          console.warn('[ImageOptimizer] Failed client-side compression, falling back to original file:', err);
          resolve(file);
        }
      };
      img.onerror = () => {
        console.warn('[ImageOptimizer] Failed to load image, falling back to original file');
        resolve(file);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      console.warn('[ImageOptimizer] Failed to read file, falling back to original file');
      resolve(file);
    };
    reader.readAsDataURL(file);
  });
}
