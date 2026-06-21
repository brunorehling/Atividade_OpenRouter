import { api } from "./api";

export interface LlmRequest {
    prompt: string;
}

export interface LlmResponse {
    modelo: string;
    resposta: string;
    uso: unknown | null;
}

export async function RequestLlm(data: LlmRequest): Promise<LlmResponse> {
    const response = await api.post<LlmResponse>('/api/llm', data);
    return response.data;
}