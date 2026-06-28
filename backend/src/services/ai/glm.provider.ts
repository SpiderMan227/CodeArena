import { IAIProvider } from './ai.provider.interface';
import axios from 'axios';

export class GlmProvider implements IAIProvider {
  private getApiKey(): string {
    return process.env.GLM_API_KEY || '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';
  }

  public async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const apiKey = this.getApiKey();
    const url = 'https://integrate.api.nvidia.com/v1/chat/completions';

    const messages: any[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const payload = {
      model: 'z-ai/glm-5.1',
      messages,
      temperature: 1,
      top_p: 1,
      max_tokens: 16384,
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      timeout: 30000,
    });

    const content = response.data?.choices?.[0]?.message?.content;
    if (content === undefined || content === null) {
      throw new Error('MALFORMED_RESPONSE');
    }

    return content;
  }
}
