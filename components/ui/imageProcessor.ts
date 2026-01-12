export async function resizeImageFile(
  file: File,
  maxPixels = 1_000_000,
  quality = 1,
  outputType: "image/webp" | "image/jpeg" = "image/webp"
): Promise<Blob> {
  // Read EXIF orientation and optional image width/height
  const exif = await getExifOrientationAndSize(file);
  const imgBitmap = await createImageBitmap(file);

  // Decide if we must apply orientation ourselves. If EXIF provides original width/height
  // we can detect whether the browser already applied orientation by comparing sizes.
  let browserApplied = false;
  if (exif.exifWidth && exif.exifHeight) {
    // If orientation swaps dims (90/270), and bitmap dims are swapped vs exif, browser applied it.
    const needsSwap = [5, 6, 7, 8].includes(exif.orientation);
    if (needsSwap) {
      if (
        imgBitmap.width === exif.exifHeight &&
        imgBitmap.height === exif.exifWidth
      ) {
        browserApplied = true;
      }
    } else {
      if (
        imgBitmap.width === exif.exifWidth &&
        imgBitmap.height === exif.exifHeight
      ) {
        browserApplied = true;
      }
    }
  }

  const w = imgBitmap.width;
  const h = imgBitmap.height;
  let scale = 1;
  if (w * h > maxPixels) scale = Math.sqrt(maxPixels / (w * h));
  const nw = Math.max(1, Math.round(w * scale));
  const nh = Math.max(1, Math.round(h * scale));

  // If orientation requires swapping and browser hasn't applied it, swap canvas dims
  const orientationRequiresSwap = [5, 6, 7, 8].includes(exif.orientation);
  const canvasWidth = orientationRequiresSwap && !browserApplied ? nh : nw;
  const canvasHeight = orientationRequiresSwap && !browserApplied ? nw : nh;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d")!;

  if (!browserApplied && exif.orientation && exif.orientation !== 1) {
    applyOrientationToCanvas(ctx, exif.orientation, canvasWidth, canvasHeight);
  }

  ctx.drawImage(imgBitmap, 0, 0, nw, nh);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("toBlob returned null"));
      },
      outputType,
      quality
    );
  });
}

export async function getImageDimensionsFromBlob(
  blob: Blob
): Promise<{ width: number; height: number }> {
  const imgBitmap = await createImageBitmap(blob);
  return { width: imgBitmap.width, height: imgBitmap.height };
}

function applyOrientationToCanvas(
  ctx: CanvasRenderingContext2D,
  orientation: number,
  width: number,
  height: number
) {
  switch (orientation) {
    case 2: // flip horizontal
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      break;
    case 3: // rotate 180
      ctx.translate(width, height);
      ctx.rotate(Math.PI);
      break;
    case 4: // flip vertical
      ctx.translate(0, height);
      ctx.scale(1, -1);
      break;
    case 5: // transpose (flip horizontal + rotate 90 CW)
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 6: // rotate 90 CW
      ctx.translate(width, 0);
      ctx.rotate(0.5 * Math.PI);
      break;
    case 7: // transverse (flip horizontal + rotate 270 CW)
      ctx.rotate(-0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 8: // rotate 270 CW
      ctx.translate(0, height);
      ctx.rotate(-0.5 * Math.PI);
      break;
    default:
      break;
  }
}

async function getExifOrientationAndSize(
  file: File
): Promise<{ orientation: number; exifWidth?: number; exifHeight?: number }> {
  try {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);
    // Check JPEG SOI 0xFFD8
    if (view.getUint16(0) !== 0xffd8) return { orientation: 1 };
    let offset = 2;
    const length = view.byteLength;
    while (offset < length) {
      const marker = view.getUint16(offset);
      offset += 2;
      const size = view.getUint16(offset);
      if (marker === 0xffe1) {
        const exifOffset = offset + 2;
        // Check "Exif\0\0"
        if (
          view.getUint8(exifOffset) === 0x45 &&
          view.getUint8(exifOffset + 1) === 0x78 &&
          view.getUint8(exifOffset + 2) === 0x69 &&
          view.getUint8(exifOffset + 3) === 0x66
        ) {
          const little = view.getUint16(exifOffset + 6) === 0x4949;
          const tiffOffset = exifOffset + 6;
          const get16 = (off: number) =>
            little ? view.getUint16(off, true) : view.getUint16(off, false);
          const get32 = (off: number) =>
            little ? view.getUint32(off, true) : view.getUint32(off, false);
          const firstIFD = tiffOffset + get32(tiffOffset + 4);
          const entries = get16(firstIFD);
          let orientation = 1;
          let exifWidth: number | undefined;
          let exifHeight: number | undefined;
          for (let i = 0; i < entries; i++) {
            const entryOffset = firstIFD + 2 + i * 12;
            const tag = get16(entryOffset);
            if (tag === 0x0112) {
              orientation = get16(entryOffset + 8) || 1;
            }
            if (tag === 0x0100) {
              exifWidth = get32(entryOffset + 8);
            }
            if (tag === 0x0101) {
              exifHeight = get32(entryOffset + 8);
            }
          }
          return { orientation, exifWidth, exifHeight };
        }
        break;
      } else {
        offset += size;
      }
    }
  } catch (e) {
    // ignore parse errors
  }
  return { orientation: 1 };
}

export async function ensureMaxPixels(file: File, maxPixels = 1_000_000) {
  const imgBitmap = await createImageBitmap(file);
  const w = imgBitmap.width;
  const h = imgBitmap.height;
  if (w * h <= maxPixels) {
    return file; // already under limit
  }
  const blob = await resizeImageFile(file, maxPixels, 0.8, "image/webp");
  // Convert to File to preserve filename if needed
  const newFile = new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
    type: blob.type,
  });
  return newFile;
}

export async function resizeToBox(
  file: File | Blob,
  maxWidth: number,
  maxHeight: number,
  quality = 0.75,
  outputType: "image/webp" | "image/jpeg" = "image/webp"
): Promise<Blob> {
  const exif = await (file instanceof File
    ? getExifOrientationAndSize(file)
    : Promise.resolve({ orientation: 1 } as any));
  const imgBitmap = await createImageBitmap(file as Blob);

  let browserApplied = false;
  if ((exif as any).exifWidth && (exif as any).exifHeight) {
    const needsSwap = [5, 6, 7, 8].includes((exif as any).orientation);
    if (needsSwap) {
      if (
        imgBitmap.width === (exif as any).exifHeight &&
        imgBitmap.height === (exif as any).exifWidth
      ) {
        browserApplied = true;
      }
    } else {
      if (
        imgBitmap.width === (exif as any).exifWidth &&
        imgBitmap.height === (exif as any).exifHeight
      ) {
        browserApplied = true;
      }
    }
  }

  const w = imgBitmap.width;
  const h = imgBitmap.height;
  const scale = Math.min(maxWidth / w, maxHeight / h, 1);
  const nw = Math.max(1, Math.round(w * scale));
  const nh = Math.max(1, Math.round(h * scale));

  const orientationRequiresSwap = [5, 6, 7, 8].includes(
    (exif as any).orientation
  );
  const canvasWidth = orientationRequiresSwap && !browserApplied ? nh : nw;
  const canvasHeight = orientationRequiresSwap && !browserApplied ? nw : nh;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d")!;

  if (
    !browserApplied &&
    (exif as any).orientation &&
    (exif as any).orientation !== 1
  ) {
    applyOrientationToCanvas(
      ctx,
      (exif as any).orientation,
      canvasWidth,
      canvasHeight
    );
  }

  ctx.drawImage(imgBitmap, 0, 0, nw, nh);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("toBlob returned null"));
      },
      outputType,
      quality
    );
  });
}

export async function makeThreeVariants(file: File) {
  // full: max 1MP, quality 0.8
  const fullBlob = await resizeImageFile(file, 1_000_000, 0.8, "image/webp");
  // small: fit within 400x400, quality 0.8
  const smallBlob = await resizeToBox(file, 400, 400, 0.8, "image/webp");
  // preview: fit within 200x200, quality 0.6
  const previewBlob = await resizeToBox(file, 200, 200, 0.6, "image/webp");

  const baseName = file.name.replace(/\.[^.]+$/, "");
  const fullFile = new File([fullBlob], `${baseName}_full.webp`, {
    type: fullBlob.type,
  });
  const smallFile = new File([smallBlob], `${baseName}_small.webp`, {
    type: smallBlob.type,
  });
  const previewFile = new File([previewBlob], `${baseName}_preview.webp`, {
    type: previewBlob.type,
  });

  return { full: fullFile, small: smallFile, preview: previewFile };
}
