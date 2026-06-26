import axios from 'axios';

export class AIService {
  private static getApiKey(): string | null {
    return process.env.GEMINI_API_KEY || null;
  }

  /**
   * Prompts the Google Gemini API to generate content text.
   */
  public static async generateContent(prompt: string): Promise<string> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return `[AI Assistant]: GEMINI_API_KEY is not configured in your backend .env file.
      Please add your Google Gemini API Key to enable AI-powered hints, compilation reviews, and wrong-answer analysis.
      
      (You can get a free key from Google AI Studio at: https://aistudio.google.com/)`;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      
      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Invalid response structure from Gemini API');
      }

      return text;
    } catch (err: any) {
      console.error('[AI Service Error]:', err.response?.data || err.message);
      return `[AI Assistant Error]: Failed to contact the Gemini tutor service. details: ${err.message}`;
    }
  }
}
