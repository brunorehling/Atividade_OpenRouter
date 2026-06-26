import express from "express";
import cors from "cors";
import "dotenv/config";
import { prisma } from "./db.js";
import authRoutes from "./auth.js"; 
import { autenticar } from "./middleware.js";
const app = express();
const PORT = 3000;
const API_KEY = process.env.OPENROUTER_API_KEY;
const ID_USUARIO_TESTE = Number(process.env.ID_USUARIO_TESTE);
const MODEL = "openai/gpt-oss-120b:free";


if (!API_KEY) {
 console.error("Erro: configure OPENROUTER_API_KEY no arquivo .env.");
 process.exit(1);
}
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/api/auth", authRoutes);

app.get("/api/status", (req, res) => {
 res.json({ status: "API local funcionando", model: MODEL });
});

app.post("/api/requisitos", autenticar, async (req, res) => {
 try {
 const { prompt } = req.body;
 if (!prompt || prompt.trim().length === 0) {
 return res.status(400).json({ erro: "O campo prompt e obrigatorio." });
 }
 if (prompt.length > 2000) {
 return res.status(400).json({ erro: "Limite: 2000 caracteres." });
 }
 const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
    headers: {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:3000",
    "X-OpenRouter-Title": "Projeto FIA ADS"
    },
 body: JSON.stringify({
 model: MODEL,
 messages: [
  {
    role: "system",
    content: `Voce e um analista de sistemas. Transforme a ideia do usuario em uma especificacao.
              Responda APENAS com um JSON valido, sem texto antes ou depois, sem markdown, no formato exato:
              
              {
                "funcionalidades": ["string", "string"],
                "atores": ["string", "string"],
                "regrasDeNegocio": ["string", "string"],
                "riscos": ["string", "string"]
              }
              
              Nao adicione comentarios. Nao use blocos de codigo. Apenas o objeto JSON puro.`
    },
  {
  role: "user",
  content: prompt
  }
 ],
 temperature: 0.7,
 max_completion_tokens: 700
 })
 });
 if (!response.ok) {
 const detalhe = await response.text();
 return res.status(502).json({
 erro: "Erro ao consultar o OpenRouter.",
 status: response.status,
 detalhe
 });
 }
 const data = await response.json();
 const text = data.choices?.[0]?.message?.content;

 if (!text) {                                      
 return res.status(502).json({ erro: "Resposta vazia ou inesperada." });
 }

 const textoLimpo = text.replace(/```json|```/g, "").trim();

 let especificacao;          
 try {
   especificacao = JSON.parse(textoLimpo);
 } catch (e) {
   return res.status(502).json({ erro: "A IA nao retornou um JSON valido.", brutoRecebido: text });
 }

 const salvo = await prisma.requisito.create({
    data: {
      ideiaOriginal: prompt,
      funcionalidades: especificacao.funcionalidades,
      atores: especificacao.atores,
      regrasDeNegocio: especificacao.regrasDeNegocio,
      riscos: especificacao.riscos,
      userId: req.userId
    }
  });

 res.json({ modelo: MODEL, resposta: salvo, uso: data.usage ?? null });
 } catch (error) {
 res.status(500).json({ erro: "Erro interno no servidor.", detalhe: error.message });
 }
});

app.get("/api/requisitos", autenticar, async (req, res) => {
   try {
    const requisitos = await prisma.requisito.findMany({
      where: { userId: req.userId },
      orderBy: { criadoEm: "desc" }
    });

    res.json(requisitos);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar historico.", detalhe: error.message });
  }
})

app.listen(PORT, () => {
 console.log(`Servidor rodando em http://localhost:${PORT}`);
});