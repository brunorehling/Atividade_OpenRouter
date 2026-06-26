import { api } from "./api";

export interface LlmRequest {
  prompt: string;
}

export interface RequisitoGerado {
  id: number;
  ideiaOriginal: string;
  funcionalidades: string[];
  atores: string[];
  regrasDeNegocio: string[];
  riscos: string[];
  criadoEm: string;
  userId: number;
}

export interface LlmResponse {
  modelo: string;
  resposta: RequisitoGerado;
  uso: unknown | null;
}

export async function RequestLlm(data: LlmRequest): Promise<LlmResponse> {
  const response = await api.post<LlmResponse>("/api/requisitos", data);
  return response.data;
}