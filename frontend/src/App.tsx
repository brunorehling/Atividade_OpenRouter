import { useState } from "react";
import { useForm } from "react-hook-form";
import { RequestLlm, type LlmResponse } from "./services/llm";
import { isAxiosError } from "axios";
import Maleta from "./components/Maleta";

interface FormularioRequisitos {
  ideia: string;
}

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormularioRequisitos>();

  const [resultado, setResultado] = useState<LlmResponse | null>(null);
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [recarregarMaleta, setRecarregarMaleta] = useState(0);

  async function onSubmit(dados: FormularioRequisitos) {
    setErroApi(null);
    setResultado(null);

    try {
      const resposta = await RequestLlm({ prompt: dados.ideia });
      setResultado(resposta);
      reset();
      setRecarregarMaleta((n) => n + 1);
    } catch (e) {
      if (isAxiosError(e) && e.response?.data?.erro) {
        setErroApi(e.response.data.erro);
      } else {
        setErroApi("Não foi possível conectar à API. Tente novamente.");
      }
    }
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center gap-12 px-6 py-14 bg-mesa-madeira overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_10%,_rgba(255,225,170,0.10),_transparent_70%)]" />

      <svg
        viewBox="0 0 220 28"
        className="hidden md:block absolute top-7 right-[6%] w-[200px] rotate-[4deg] drop-shadow-[2px_3px_3px_rgba(0,0,0,0.4)]"
        aria-hidden="true"
      >
        <rect x="0" y="0" width="220" height="28" rx="2" fill="#d9c9a3" stroke="#8a7450" strokeWidth="1" />
        {Array.from({ length: 21 }).map((_, i) => (
          <line key={i} x1={i * 11} y1="0" x2={i * 11} y2={i % 5 === 0 ? 14 : 8} stroke="#5c4a30" strokeWidth="1" />
        ))}
      </svg>

      <svg
        viewBox="0 0 140 16"
        className="hidden md:block absolute top-[90px] right-[8%] w-[130px] rotate-[8deg] drop-shadow-[2px_3px_3px_rgba(0,0,0,0.4)]"
        aria-hidden="true"
      >
        <rect x="0" y="4" width="110" height="8" fill="#e3b341" />
        <rect x="0" y="4" width="110" height="2.5" fill="#f4d27a" />
        <polygon points="110,2 130,8 110,14" fill="#caa15c" />
        <polygon points="130,5.5 140,8 130,10.5" fill="#3a2a1a" />
        <rect x="0" y="4" width="6" height="8" fill="#d6455a" />
      </svg>

      <section className="relative w-full max-w-2xl bg-papel-grade sombra-papel text-tinta px-8 py-9 -rotate-1">
        <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-azul-papel">
          ads · unisenac · folha de especificação
        </span>

        <h1 className="font-rascunho text-3xl md:text-4xl leading-tight my-2 text-tinta">
          De ideia
          <br />
          <span className="text-azul-papel-escuro">a requisito.</span>
        </h1>

        <p className="text-sm text-slate-600 max-w-md leading-relaxed mb-6">
          Escreva a ideia direto na folha. Cada especificação gerada é arquivada
          na maleta, ao lado.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2.5">
          <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-azul-papel">
            entrada — rascunho
          </span>

          <textarea
            className="w-full min-h-[110px] bg-white/50 border-[1.5px] border-dashed border-azul-papel-escuro
                       focus:border-solid focus:border-azul-papel outline-none
                       font-mono text-sm text-tinta placeholder:text-slate-400 p-3 leading-relaxed resize-y"
            placeholder="ex: quero um alerta quando o MEI passar do limite de faturamento anual"
            {...register("ideia", {
              required: "Descreva a ideia antes de enviar",
              minLength: { value: 10, message: "Escreva pelo menos 10 caracteres" },
            })}
          />
          {errors.ideia && (
            <p className="font-mono text-[12.5px] text-red-700">{errors.ideia.message}</p>
          )}

          <div className="flex items-center gap-3.5 mt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="font-mono text-[13px] tracking-wide uppercase font-bold text-papel-grade
                         bg-azul-papel-escuro hover:bg-azul-papel transition-colors
                         px-5 py-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-default"
              style={{ color: "#f4f1ea" }}
            >
              {isSubmitting ? "Gerando..." : "Gerar especificação"}
            </button>
            {erroApi && <p className="font-mono text-[12.5px] text-red-700">{erroApi}</p>}
          </div>
        </form>

        {resultado && (
          <div className="mt-6 pt-4 border-t-[1.5px] border-dashed border-sky-200 font-mono text-[13px] leading-relaxed">
            <p className="font-bold text-white uppercase text-[11px] tracking-[0.1em] text-azul-papel-escuro mt-3 mb-1">
              Funcionalidades
            </p>
            <ul className="ml-4 list-disc text-white">
              {resultado.resposta.funcionalidades.map((f, i) => <li key={i}>{f}</li>)}
            </ul>

            <p className="font-bold text-white uppercase text-[11px] tracking-[0.1em] text-azul-papel-escuro mt-3 mb-1">
              Atores
            </p>
            <ul className="ml-4 list-disc text-white">
              {resultado.resposta.atores.map((a, i) => <li key={i}>{a}</li>)}
            </ul>

            <p className="font-bold text-white uppercase text-[11px] tracking-[0.1em] text-azul-papel-escuro mt-3 mb-1">
              Regras de negócio
            </p>
            <ul className="ml-4 list-disc text-white">
              {resultado.resposta.regrasDeNegocio.map((r, i) => <li key={i}>{r}</li>)}
            </ul>

            <p className="font-bold text-white uppercase text-[11px] tracking-[0.1em] text-azul-papel-escuro mt-3 mb-1">
              Riscos
            </p>
            <ul className="ml-4 list-disc text-white">
              {resultado.resposta.riscos.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
      </section>

      <Maleta recarregar={recarregarMaleta} />
    </main>
  );
}

export default App;