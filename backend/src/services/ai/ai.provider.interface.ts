export interface IAIProvider {
  generate(prompt: string, systemPrompt?: string): Promise<string>;
}
