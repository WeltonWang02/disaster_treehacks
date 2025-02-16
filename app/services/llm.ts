import { OpenAI } from 'openai';
import NodeCache from 'node-cache';
import { CACHE_TTL } from '../prompts';

const cache = new NodeCache();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class LLMService {
  private static instance: LLMService;
  
  private constructor() {}

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  async getResponse(prompt: string): Promise<string> {
    const cacheKey = this.generateCacheKey(prompt);
    const cachedResponse = cache.get<string>(cacheKey);

    if (cachedResponse) {
      return cachedResponse;
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || "No response generated";
    cache.set(cacheKey, response, CACHE_TTL);
    
    return response;
  }

  private generateCacheKey(prompt: string): string {
    return Buffer.from(prompt).toString('base64');
  }
} 