import { api } from "./api";

export interface RegistrarRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface Usuario {
  id: number;
  email: string;
  nome: string;
  criadoEm?: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export async function registrar(data: RegistrarRequest): Promise<Usuario> {
  const response = await api.post<Usuario>("/api/auth/registrar", data);
  return response.data;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/api/auth/login", data);
  return response.data;
}