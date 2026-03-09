import { Hono } from 'hono';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = new Hono();

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

  try {
    const arrayBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    const prompt = "Please find and return only the serial number from this image. If there are multiple numbers, provide the one that most likely looks like a serial number (often labeled S/N or Serial No). Just return the number itself, no extra text.";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type,
        },
      },
    ]);

    const serialNumber = result.response.text().trim();

    return c.json({
      success: true,
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
