import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPNG(width, height, r, g, b) {
  // Table for CRC calculation
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function writeChunk(type, data) {
    const len = data.length;
    const chunk = Buffer.alloc(12 + len);
    chunk.writeUInt32BE(len, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);
    const typeAndData = Buffer.alloc(4 + len);
    typeAndData.write(type, 0, 4, 'ascii');
    data.copy(typeAndData, 4);
    const crc = crc32(typeAndData);
    chunk.writeUInt32BE(crc, 8 + len);
    return chunk;
  }

  // PNG header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 2; // Color type: Truecolor (RGB)
  ihdr[10] = 0; // Compression: Deflate
  ihdr[11] = 0; // Filter: 0
  ihdr[12] = 0; // Interlace: 0

  const ihdrChunk = writeChunk('IHDR', ihdr);

  // Raw image data with filter byte 0 at start of each scanline
  const scanlineLength = 1 + width * 3;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const offset = y * scanlineLength;
    rawData[offset] = 0; // Filter 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = offset + 1 + x * 3;
      // Draw background orange #FF6B00, center green #008751 stall shape
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < width * 0.38) {
        // Center green & white
        if (Math.abs(dy) < height * 0.15 && Math.abs(dx) < width * 0.28) {
          // White center badge
          rawData[pixelOffset] = 255;
          rawData[pixelOffset + 1] = 255;
          rawData[pixelOffset + 2] = 255;
        } else {
          // Green stall canopy
          rawData[pixelOffset] = 0;
          rawData[pixelOffset + 1] = 135;
          rawData[pixelOffset + 2] = 81;
        }
      } else {
        // Warm Orange background #FF6B00
        rawData[pixelOffset] = r;
        rawData[pixelOffset + 1] = g;
        rawData[pixelOffset + 2] = b;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = writeChunk('IDAT', compressed);
  const iendChunk = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPNG(192, 192, 255, 107, 0));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPNG(512, 512, 255, 107, 0));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, 255, 107, 0));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPNG(180, 180, 255, 107, 0));
fs.writeFileSync(path.join(outDir, 'favicon.ico'), createPNG(32, 32, 255, 107, 0));

console.log('PWA PNG icons generated successfully!');
