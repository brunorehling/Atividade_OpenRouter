import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "./db.js";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha sao obrigatorios." });
    }

    const usuario = await prisma.user.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ erro: "Email ou senha invalidos." });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Email ou senha invalidos." });
    }

    const token = jwt.sign(
      { userId: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      usuario: { id: usuario.id, email: usuario.email, nome: usuario.nome }
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro interno no servidor.", detalhe: error.message });
  }
});

router.post("/registrar", async (req, res) => {
  try {
    const { email, senha, nome } = req.body;

    if (!email || !senha || !nome) {
      return res.status(400).json({ erro: "Nome, email e senha sao obrigatorios." });
    }

    if (senha.length < 6) {
      return res.status(400).json({ erro: "A senha precisa ter pelo menos 6 caracteres." });
    }

    const usuarioExistente = await prisma.user.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({ erro: "Ja existe um usuario com esse email." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await prisma.user.create({
      data: { email, senha: senhaHash, nome }
    });

    res.status(201).json({
      id: novoUsuario.id,
      email: novoUsuario.email,
      nome: novoUsuario.nome,
      criadoEm: novoUsuario.criadoEm
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro interno no servidor.", detalhe: error.message });
  }
});

export default router;