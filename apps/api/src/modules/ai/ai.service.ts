import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type AiProvider = "gemini" | "openai";

export interface AiCompletionRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  provider?: AiProvider;
}

export interface AiCompletionResponse {
  text: string;
  provider: AiProvider;
  model: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  async complete(req: AiCompletionRequest): Promise<AiCompletionResponse> {
    const provider = req.provider ?? this.config.get<AiProvider>("AI_DEFAULT_PROVIDER") ?? "gemini";
    return provider === "gemini" ? this.callGemini(req) : this.callOpenAi(req);
  }

  private async callOpenAi(req: AiCompletionRequest): Promise<AiCompletionResponse> {
    const apiKey = this.config.get<string>("OPENAI_API_KEY");
    if (!apiKey) {
      this.logger.error("OPENAI_API_KEY is missing from environment variables.");
      throw new HttpException("AI service is not configured.", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const messages = [
      ...(req.systemPrompt ? [{ role: "system", content: req.systemPrompt }] : []),
      { role: "user", content: req.prompt },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(this.config.get<string>("OPENAI_ORG_ID")
          ? { "OpenAI-Organization": this.config.get<string>("OPENAI_ORG_ID")! }
          : {}),
      },
      body: JSON.stringify({
        model: this.config.get<string>("OPENAI_MODEL") ?? "gpt-4o",
        messages,
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxTokens ?? 1000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`OpenAI error: ${err}`);
      throw new HttpException("AI service is temporarily unavailable. Please try again.", HttpStatus.BAD_GATEWAY);
    }

    const body = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    return {
      text: body.choices[0]?.message?.content ?? "",
      provider: "openai",
      model: this.config.get<string>("OPENAI_MODEL") ?? "gpt-4o",
      usage: {
        promptTokens: body.usage.prompt_tokens,
        completionTokens: body.usage.completion_tokens,
        totalTokens: body.usage.total_tokens,
      },
    };
  }

  private async callGemini(req: AiCompletionRequest): Promise<AiCompletionResponse> {
    const apiKey = this.config.get<string>("GEMINI_API_KEY");
    if (!apiKey) {
      this.logger.error("GEMINI_API_KEY is missing from environment variables.");
      throw new HttpException("AI service is not configured.", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = this.config.get<string>("GEMINI_MODEL") ?? "gemini-1.5-flash";
      
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: req.systemPrompt,
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: req.prompt }] }],
        generationConfig: {
          temperature: req.temperature ?? 0.7,
          maxOutputTokens: req.maxTokens ?? 1000,
        },
      });

      const response = await result.response;
      const text = response.text();

      return { text, provider: "gemini", model: modelName };
    } catch (error: any) {
      this.logger.error(`Gemini error: ${error?.message || error}`);
      if (error?.status === 403 || error?.message?.includes("API key")) {
         throw new HttpException("AI service is not configured.", HttpStatus.INTERNAL_SERVER_ERROR);
      }
      throw new HttpException("AI service is temporarily unavailable. Please try again.", HttpStatus.BAD_GATEWAY);
    }
  }
}
