import { IAIProvider } from './ai.provider.interface';
import axios from 'axios';

export class GeminiProvider implements IAIProvider {
  private getApiKey(): string | null {
    return process.env.GEMINI_API_KEY || null;
  }

  public async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY_MISSING');
    }

    // Call standard Gemini 1.5 Flash endpoint (stable production model with higher rate limits)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload: any = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };

    // Embed system instruction if provided
    if (systemPrompt) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt }]
      };
    }

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000, // Cancel requests taking longer than 15 seconds
    });

    // Validate response structure
    const candidates = response.data?.candidates;
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      throw new Error('MALFORMED_RESPONSE');
    }

    const text = candidates[0]?.content?.parts?.[0]?.text;
    if (text === undefined || text === null) {
      throw new Error('MALFORMED_RESPONSE');
    }

    return text;
  }
}
