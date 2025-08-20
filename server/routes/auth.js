const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { hashPassword, verifyPassword, generateToken } = require('../utils/auth');
const { getUsuarioByMatricula, addUsuario } = require('../data/database');
const { logger } = require('../utils/logger');

// Rate limiter específico para login (mais restritivo)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    logger.rateLimitExceeded(ip, '/api/auth/login', {
      userAgent: req.get('User-Agent'),
      matricula: req.body.matricula
    });
    
    res.status(429).json({
      error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
    });
  }
});

// Rota de login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { matricula, senha } = req.body;

    // Validações básicas
    if (!matricula || !senha) {
      return res.status(400).json({ 
        error: 'Matrícula e senha são obrigatórios' 
      });
    }

    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Buscar usuário pela matrícula
    const usuario = await getUsuarioByMatricula(matricula);
    
    if (!usuario) {
      logger.loginAttempt(ip, matricula, false, {
        reason: 'user_not_found',
        userAgent
      });
      return res.status(401).json({ 
        error: 'Matrícula ou senha inválidos' 
      });
    }

    if (!usuario.ativo) {
      logger.loginAttempt(ip, matricula, false, {
        reason: 'user_inactive',
        userAgent
      });
      return res.status(401).json({ 
        error: 'Usuário inativo' 
      });
    }

    // Verificar senha
    const senhaValida = await verifyPassword(senha, usuario.senha);
    
    if (!senhaValida) {
      logger.loginAttempt(ip, matricula, false, {
        reason: 'invalid_password',
        userAgent
      });
      return res.status(401).json({ 
        error: 'Matrícula ou senha inválidos' 
      });
    }

    // Gerar token JWT
    const token = generateToken(usuario.matricula, usuario.isAdmin);

    // Log de login bem-sucedido
    logger.loginAttempt(ip, matricula, true, {
      isAdmin: usuario.isAdmin,
      userAgent
    });

    // Retornar dados do usuário (sem a senha)
    const { senha: _, ...usuarioSemSenha } = usuario;
    
    res.json({
      message: 'Login realizado com sucesso',
      token,
      usuario: usuarioSemSenha
    });

  } catch (error) {
    const ip = req.ip || req.connection.remoteAddress;
    logger.error('Login error', {
      error: error.message,
      stack: error.stack,
      ip,
      matricula: req.body.matricula,
      userAgent: req.get('User-Agent')
    });
    
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

// Rota para verificar token
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Token não fornecido' 
      });
    }

    const { verifyToken } = require('../utils/auth');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Token inválido' 
      });
    }

    res.json({ 
      valid: true, 
      user: decoded 
    });

  } catch (error) {
    console.error('Erro na verificação do token:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

// Rota para logout (opcional - o token expira automaticamente)
router.post('/logout', (req, res) => {
  res.json({ 
    message: 'Logout realizado com sucesso' 
  });
});

module.exports = router;
