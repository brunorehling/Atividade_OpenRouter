import { useState } from 'react'
import './App.css'
import { useForm } from "react-hook-form";
import { RequestLlm, type LlmResponse } from './services/llm';
import { isAxiosError } from 'axios';
 
 
interface FormularioRequisitos {
  ideia: string;
}
 
function App() {
 
  const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm<FormularioRequisitos>();
  const [resultado, setResultado] = useState<LlmResponse | null>(null);
  const [erroApi, setErroApi] = useState<string | null>(null);
 
  async function onSubmit(data: FormularioRequisitos) {
    setErroApi(null);
    setResultado(null);
 
    try {
      const resposta = await RequestLlm({ prompt: data.ideia });
      setResultado(resposta);
    } catch (e) {
      if (isAxiosError(e) && e.response?.data?.erro) {
        setErroApi(e.response.data.erro);
      } else {
        setErroApi("Não foi possível conectar à API. Tente novamente.");
      }
    }
  }
 
  return (
    <main className='min-h-screen w-full bg-[#0a2647] flex flex-col items-center gap-14 px-6 py-16'>
 
      <section className='w-full max-w-2xl'>
        <h1 className='text-5xl text-[#eef3f8] font-bold leading-tight'>
          De ideia
        </h1>
        <h1 className='text-5xl text-[#5b9bd5] font-bold leading-tight'>
          a requisito.
        </h1>
        <p className='text-base mt-5 text-[#aac4dd] leading-relaxed'>
          Descreva uma funcionalidade em texto livre. O sistema devolve funcionalidades,
          atores, regras de negócio e riscos, como faria um analista de sistemas.
        </p>
      </section>
 
      <section className='w-full max-w-2xl border-2 border-[#5b9bd5] p-8 bg-[#0a2647]/40'>
        <form className='flex flex-col gap-4' onSubmit={handleSubmit(onSubmit)}>
          <span className='font-mono text-xs uppercase tracking-widest text-[#5b9bd5]'>
            entrada — rascunho
          </span>
 
          <textarea
            className='border-2 border-[#2c6090] focus:border-[#5b9bd5] outline-none h-36 w-full text-[#eef3f8] bg-[#172c3e] placeholder:text-[#5d7a98] font-mono text-sm p-4 leading-relaxed resize-none'
            {...register("ideia", {
              required: "Descreva a ideia antes de enviar",
              minLength: { value: 10, message: "Escreva pelo menos 10 caracteres" },
            })}
            placeholder="Ex: quero um alerta quando o MEI passar do limite de faturamento"
          />
          {errors.ideia && (
            <p className='text-red-400 text-sm font-mono'>{errors.ideia.message}</p>
          )}
 
          <button
            type="submit"
            disabled={isSubmitting}
            className='self-start mt-1 py-2.5 px-6 bg-[#5b9bd5] text-[#0a2647] font-mono text-sm font-bold uppercase tracking-wide hover:bg-[#eef3f8] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default'
          >
            {isSubmitting ? "Gerando..." : "Gerar especificação"}
          </button>
 
          {erroApi && (
            <p className='text-red-400 text-sm font-mono'>{erroApi}</p>
          )}
        </form>
      </section>
 
      <section className='w-full max-w-2xl'>
        <span className='font-mono text-xs uppercase tracking-widest text-[#5b9bd5]'>
          saída — especificação
        </span>
 
        <div className='mt-3 bg-[#f4f1ea] border-2 border-[#5b9bd5] shadow-[6px_6px_0_#1c3a5a] p-6 max-h-[45vh] overflow-y-auto'>
          {resultado ? (
            <pre className='text-[#14233a] whitespace-pre-wrap font-mono text-sm leading-relaxed'>
              {resultado.resposta}
            </pre>
          ) : (
            <pre className='text-[#9b9482] font-mono text-sm'>— aguardando entrada —</pre>
          )}
        </div>
      </section>
 
    </main>
  )
}
 
export default App