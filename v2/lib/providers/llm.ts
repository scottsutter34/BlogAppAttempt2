export interface CompleteOptions {
  system?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMProvider {
  complete(prompt: string, options?: CompleteOptions): Promise<string>;
}

class OpenAIProvider implements LLMProvider {
  constructor(private apiKey: string, private model: string = process.env.LLM_OPENAI_MODEL || "gpt-4o-mini") {}
  async complete(prompt: string, options: CompleteOptions = {}): Promise<string> {
    const system = options.system || "You are a helpful, accurate writing model.";
    const model = options.model || this.model;
    const temperature = options.temperature ?? 0.3;
    const max_tokens = options.maxTokens ?? 2000;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model, temperature, max_tokens,
        messages: [{ role: "system", content: system }, { role: "user", content: prompt }]
      })
    });
    if (!res.ok) { throw new Error("OpenAI error: " + await res.text()); }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }
}

class AnthropicProvider implements LLMProvider {
  constructor(private apiKey: string, private model: string = process.env.LLM_ANTHROPIC_MODEL || "claude-3-5-sonnet-20240620") {}
  async complete(prompt: string, options: CompleteOptions = {}): Promise<string> {
    const system = options.system || "You are a helpful, accurate writing model.";
    const model = options.model || this.model;
    const temperature = options.temperature ?? 0.3;
    const max_tokens = options.maxTokens ?? 2000;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": this.apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens, temperature, system, messages: [{ role: "user", content: prompt }] })
    });
    if (!res.ok) { throw new Error("Anthropic error: " + await res.text()); }
    const data = await res.json();
    return data.content?.[0]?.text || "";
  }
}

class StubProvider implements LLMProvider {
  async complete(prompt: string): Promise<string> { return "{"stub":true}"; }
}

export function getProvider(): LLMProvider {
  const provider = (process.env.LLM_PROVIDER || "").toLowerCase();
  if (provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY not set");
    return new OpenAIProvider(key);
    }
  if (provider === "anthropic") {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY not set");
    return new AnthropicProvider(key);
  }
  return new StubProvider();
}
