import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = { type: "text"; text: string };
export type ImageContent = { type: "image_url"; image_url: { url: string; detail?: "auto" | "low" | "high" } };
export type FileContent = { type: "file_url"; file_url: { url: string; mime_type?: string } };
export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: { name: string; description?: string; parameters?: Record<string, unknown> };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = { type: "function"; function: { name: string } };
export type ToolChoice = ToolChoicePrimitive | ToolChoiceByName | ToolChoiceExplicit;

export type JsonSchema = { name: string; schema: Record<string, unknown>; strict?: boolean };
export type OutputSchema = JsonSchema;
export type ResponseFormat = { type: "text" } | { type: "json_object" } | { type: "json_schema"; json_schema: JsonSchema };

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: { role: Role; content: string | Array<TextContent | ImageContent | FileContent>; tool_calls?: ToolCall[] };
    finish_reason: string | null;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};

const ensureArray = (v: MessageContent | MessageContent[]): MessageContent[] => Array.isArray(v) ? v : [v];

const normalizeContentPart = (part: MessageContent): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") return { type: "text", text: part };
  return part;
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map(p => typeof p === "string" ? p : JSON.stringify(p)).join("\n");
    return { role, name, tool_call_id, content };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return { role, name, content: contentParts[0].text };
  }
  return { role, name, content: contentParts };
};

const normalizeToolChoice = (toolChoice: ToolChoice | undefined, tools: Tool[] | undefined) => {
  if (!toolChoice) return undefined;
  if (toolChoice === "none" || toolChoice === "auto") return toolChoice;
  if (toolChoice === "required") {
    if (!tools?.length) throw new Error("tool_choice 'required' but no tools");
    if (tools.length > 1) throw new Error("'required' needs single tool or explicit name");
    return { type: "function" as const, function: { name: tools[0].function.name } };
  }
  if ("name" in toolChoice) return { type: "function" as const, function: { name: toolChoice.name } };
  return toolChoice;
};

const normalizeResponseFormat = (p: { responseFormat?: ResponseFormat; response_format?: ResponseFormat; outputSchema?: OutputSchema; output_schema?: OutputSchema }) => {
  const explicit = p.responseFormat || p.response_format;
  if (explicit) return explicit;
  const schema = p.outputSchema || p.output_schema;
  if (!schema) return undefined;
  return { type: "json_schema" as const, json_schema: { name: schema.name, schema: schema.schema, ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}) } };
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const { messages, tools, toolChoice, tool_choice, outputSchema, output_schema, responseFormat, response_format } = params;

  const payload: Record<string, unknown> = {
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: messages.map(normalizeMessage),
    max_tokens: params.maxTokens || params.max_tokens || 4096,
  };

  if (tools?.length) payload.tools = tools;
  const tc = normalizeToolChoice(toolChoice || tool_choice, tools);
  if (tc) payload.tool_choice = tc;
  const rf = normalizeResponseFormat({ responseFormat, response_format, outputSchema, output_schema });
  if (rf) payload.response_format = rf;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`);
  }

  return (await response.json()) as InvokeResult;
}
