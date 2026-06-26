import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { registrar, type RegistrarRequest } from "./services/auth";

export default function Cadastro() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrarRequest>();

  const [erroApi, setErroApi] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(dados: RegistrarRequest) {
    setErroApi(null);

    try {
      await registrar(dados);
      navigate("/login");
    } catch (e) {
      if (isAxiosError(e) && e.response?.data?.erro) {
        setErroApi(e.response.data.erro);
      } else {
        setErroApi("Não foi possível criar a conta. Tente novamente.");
      }
    }
  }

  return (
    <main className="min-h-screen w-full bg-[#0a2647] flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm border-2 border-[#5b9bd5] p-8 flex flex-col gap-4 bg-[#0a2647]/40"
      >
        <h1 className="text-2xl font-bold text-[#eef3f8] font-mono">Criar conta</h1>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs uppercase tracking-widest text-[#5b9bd5]">
            nome
          </label>
          <input
            type="text"
            className="border-2 border-[#2c6090] focus:border-[#5b9bd5] outline-none bg-[#172c3e] text-[#eef3f8] font-mono text-sm p-3"
            {...register("nome", { required: "Informe seu nome" })}
          />
          {errors.nome && <p className="text-red-400 text-sm font-mono">{errors.nome.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs uppercase tracking-widest text-[#5b9bd5]">
            email
          </label>
          <input
            type="email"
            className="border-2 border-[#2c6090] focus:border-[#5b9bd5] outline-none bg-[#172c3e] text-[#eef3f8] font-mono text-sm p-3"
            {...register("email", { required: "Informe seu email" })}
          />
          {errors.email && <p className="text-red-400 text-sm font-mono">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs uppercase tracking-widest text-[#5b9bd5]">
            senha
          </label>
          <input
            type="password"
            className="border-2 border-[#2c6090] focus:border-[#5b9bd5] outline-none bg-[#172c3e] text-[#eef3f8] font-mono text-sm p-3"
            {...register("senha", {
              required: "Informe uma senha",
              minLength: { value: 6, message: "Mínimo de 6 caracteres" },
            })}
          />
          {errors.senha && <p className="text-red-400 text-sm font-mono">{errors.senha.message}</p>}
        </div>

        {erroApi && <p className="text-red-400 text-sm font-mono">{erroApi}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 py-2.5 bg-[#5b9bd5] text-[#0a2647] font-mono text-sm font-bold uppercase tracking-wide hover:bg-[#eef3f8] transition-colors disabled:opacity-40"
        >
          {isSubmitting ? "Criando..." : "Criar conta"}
        </button>

        <p className="text-center text-sm text-[#aac4dd] font-mono">
          Já tem conta?{" "}
          <Link to="/login" className="text-[#5b9bd5] underline">
            Entrar
          </Link>
        </p>
      </form>
    </main>
  );
}