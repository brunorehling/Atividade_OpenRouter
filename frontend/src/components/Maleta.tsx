import { useEffect, useState } from "react";
import { api } from "../services/api";

interface RequisitoSalvo {
  id: number;
  ideiaOriginal: string;
  funcionalidades: string[];
  atores: string[];
  regrasDeNegocio: string[];
  riscos: string[];
  criadoEm: string;
}

export default function Maleta({ recarregar }: { recarregar: number }) {
  const [aberta, setAberta] = useState(false);
  const [historico, setHistorico] = useState<RequisitoSalvo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [selecionado, setSelecionado] = useState<RequisitoSalvo | null>(null);

  async function carregarHistorico() {
    setCarregando(true);
    try {
      const resp = await api.get<RequisitoSalvo[]>("/api/requisitos");
      setHistorico(resp.data);
    } catch {
      setHistorico([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (aberta) carregarHistorico();
  }, [aberta, recarregar]);

  function alternar() {
    setSelecionado(null);
    setAberta((v) => !v);
  }

  return (
    <div className="relative flex flex-col items-center z-10">
      <button
        onClick={alternar}
        aria-label="Abrir maleta de documentos"
        className="bg-transparent border-none cursor-pointer flex flex-col items-center gap-2 group"
      >
        <svg
          viewBox="0 0 120 90"
          className={`w-[120px] sombra-maleta-svg transition-transform duration-300 ease-[cubic-bezier(.3,1.4,.4,1)]
                      ${aberta ? "-translate-y-1 scale-[1.03]" : ""}`}
        >
          <rect x="6" y="28" width="108" height="56" rx="6" fill="#4a2e1a" stroke="#2e1c0f" strokeWidth="2" />
          <rect x="6" y="28" width="108" height="10" fill="#5c3a21" />
          <path d="M44 28 V18 a6 6 0 0 1 6 -6 h20 a6 6 0 0 1 6 6 V28" fill="none" stroke="#2e1c0f" strokeWidth="4" />
          <rect
            x="50"
            y="46"
            width="20"
            height="14"
            rx="2"
            fill="#c9a227"
            stroke="#8a6c14"
            strokeWidth="1.5"
            style={{
              transformOrigin: "60px 53px",
              transform: aberta ? "rotate(35deg) translate(-2px, -3px)" : "none",
              transition: "transform 0.3s ease",
            }}
          />
          <circle cx="60" cy="53" r="2.4" fill="#5c3a21" />
        </svg>
        <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#d9c9a3]">
          {aberta ? "fechar maleta" : "abrir maleta"}
        </span>
      </button>

      {aberta && (
        <div className="animar-maleta-abrir mt-4 w-[min(90vw,420px)] max-h-[60vh] overflow-y-auto
                         bg-[#ece4d2] border border-[#8a7450] sombra-painel-maleta p-4">
          <div className="flex justify-between font-mono text-[10.5px] tracking-[0.08em] uppercase
                           text-[#6b5a3e] border-b border-dashed border-[#8a7450] pb-2 mb-2">
            <span>arquivo de especificações</span>
            <span>{historico.length} documento{historico.length !== 1 ? "s" : ""}</span>
          </div>

          {carregando && (
            <p className="font-mono text-[12.5px] text-[#6b5a3e] text-center py-4">
              abrindo pastas...
            </p>
          )}

          {!carregando && historico.length === 0 && (
            <p className="font-mono text-[12.5px] text-[#6b5a3e] text-center py-4">
              a maleta está vazia. gere uma especificação na folha ao lado.
            </p>
          )}

          {!carregando && !selecionado && historico.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelecionado(item)}
              className="w-full text-left bg-papel-grade border-l-4 border-[#c9a227] px-3 py-2.5 mb-1.5
                         flex flex-col gap-0.5 cursor-pointer hover:bg-white transition-colors"
            >
              <span className="font-mono text-[10.5px] text-[#8a7450]">
                {new Date(item.criadoEm).toLocaleDateString("pt-BR")}
              </span>
              <span className="text-[13px] text-tinta">{item.ideiaOriginal}</span>
            </button>
          ))}

          {selecionado && (
            <div className="font-mono text-[12.5px] text-tinta bg-papel-grade p-3.5">
              <button
                onClick={() => setSelecionado(null)}
                className="bg-transparent border-none text-azul-papel-escuro text-xs cursor-pointer mb-2.5 p-0"
              >
                ← voltar às pastas
              </button>

              <p className="font-bold uppercase text-[11px] tracking-[0.1em] text-azul-papel-escuro mt-2 mb-1">
                Funcionalidades
              </p>
              <ul className="ml-4 list-disc">{selecionado.funcionalidades.map((f, i) => <li key={i}>{f}</li>)}</ul>

              <p className="font-bold uppercase text-[11px] tracking-[0.1em] text-azul-papel-escuro mt-2 mb-1">
                Atores
              </p>
              <ul className="ml-4 list-disc">{selecionado.atores.map((a, i) => <li key={i}>{a}</li>)}</ul>

              <p className="font-bold uppercase text-[11px] tracking-[0.1em] text-azul-papel-escuro mt-2 mb-1">
                Regras de negócio
              </p>
              <ul className="ml-4 list-disc">{selecionado.regrasDeNegocio.map((r, i) => <li key={i}>{r}</li>)}</ul>

              <p className="font-bold uppercase text-[11px] tracking-[0.1em] text-azul-papel-escuro mt-2 mb-1">
                Riscos
              </p>
              <ul className="ml-4 list-disc">{selecionado.riscos.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}