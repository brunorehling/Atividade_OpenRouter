import express from "express";
import cors from "cors";
import "dotenv/config";
const app = express();
const PORT = 3000;
const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "openai/gpt-oss-120b:free";
if (!API_KEY) {
 console.error("Erro: configure OPENROUTER_API_KEY no arquivo .env.");
 process.exit(1);
}

const textoLimpo = text
  .replace(/\*\*/g, "")        // negrito **texto**
  .replace(/\*/g, "")          // itálico *texto*
  .replace(/^#{1,6}\s*/gm, "") // headers # ## ###
  .replace(/^-{3,}$/gm, "")    // linhas ---
  .replace(/^[-*]\s+/gm, "• ") // listas - item ou * item → bullet normal
  .trim();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/api/status", (req, res) => {
 res.json({ status: "API local funcionando", model: MODEL });
});

app.post("/api/llm", async (req, res) => {
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
  content: "Voce e um analista de sistemas. O usuario vai descrever uma ideia de funcionalidade de forma livre e informal. Sua tarefa e transformar essa ideia em uma especificacao estruturada. Responda SEMPRE no seguinte formato, nesta ordem: 1. Funcionalidades (lista do que precisa ser construido), 2. Atores envolvidos (quem usa ou interage com a funcionalidade), 3. Regras de negocio (condicoes, limites e excecoes), 4. Riscos (o que pode dar errado ou merece atencao). Seja objetivo e direto. Nao invente requisitos que o usuario nao mencionou e que nao sejam uma consequencia razoavel do que foi descrito. Escreva em texto corrido normal, sem usar **, --, #, ou qualquer simbolo de formatacao markdown em hipótese alguma."
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
 res.json({ modelo: MODEL, resposta: textoLimpo, uso: data.usage ?? null });
 } catch (error) {
 res.status(500).json({ erro: "Erro interno no servidor.", detalhe: error.message });
 }
});

app.listen(PORT, () => {
 console.log(`Servidor rodando em http://localhost:${PORT}`);
});