import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error('Error: GOOGLE_API_KEY is not set in environment variables');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    // Note: The SDK might not have a direct listModels method in all versions, 
    // but we can try to fetch from the raw endpoint or use the management API if available.
    // However, the error message specifically suggests ListModels.
    // Let's try the fetch approach to be sure we get the raw list.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.error) {
      console.error('API Error:', data.error);
      return;
    }

    console.log('Available Models:');
    data.models.forEach((m: any) => {
      console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(', ')})`);
    });
  } catch (error) {
    console.error('Failed to list models:', error);
  }
}

listModels();
