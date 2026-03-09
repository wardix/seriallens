import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { appendFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const app = new Hono();
app.use('*', logger());

// Pastikan folder logs ada
const LOG_DIR = join(process.cwd(), 'logs');
const LOG_FILE = join(LOG_DIR, 'requests.log');

async function logRequest(filename: string, model: string, found: boolean, serial: string | null) {
  try {
    await mkdir(LOG_DIR, { recursive: true });
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] Model: ${model} | File: ${filename} | Found: ${found} | Serial: ${serial || 'N/A'}\n`;
    await appendFile(LOG_FILE, logEntry);
  } catch (err) {
    console.error('Failed to write log:', err);
  }
}

// Inisialisasi Gemini
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error('CRITICAL: GOOGLE_API_KEY is not set in environment variables');
}
const genAI = new GoogleGenerativeAI(apiKey || '');
const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
console.log(`Using model: ${modelName}`);
const model = genAI.getGenerativeModel({ model: modelName });

app.get('/', (c) => {
  return c.text('SerialLens API is running! 🔍');
});

app.post('/extract-serial', async (c) => {
  const body = await c.req.parseBody();
  const image = body['image'];

  if (!(image instanceof File)) {
    return c.json({ error: 'Please upload an image file under the field "image"' }, 400);
  }

  // Validasi tipe file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(image.type)) {
    return c.json({
      success: false,
      error: `Invalid file type: ${image.type}. Only JPEG, PNG, and WebP are allowed.`
    }, 400);
  }

  try {
    const arrayBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    const prompt = "Act as an OCR specialist. Find and return ONLY the serial number from this image. " +
                   "Look for labels like S/N, Serial No, or sequences of characters that look like a serial number. " +
                   "IMPORTANT: If no serial number is found, return exactly 'NOT_FOUND'. " +
                   "Return ONLY the serial number or 'NOT_FOUND', no explanations, no labels, no extra text.";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type,
        },
      },
    ]);

    const rawResult = result.response.text().trim();
    const serialNumber = rawResult === 'NOT_FOUND' ? null : rawResult;
    const isFound = serialNumber !== null;

    // Simpan log secara asinkron (tidak perlu menunggu log selesai)
    logRequest(image.name, modelName, isFound, serialNumber);

    return c.json({
      success: true,
      found: isFound,
      serial_number: serialNumber
    });
  } catch (error: any) {
    console.error('Error extracting serial:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to process image'
    }, 500);
  }
});

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
