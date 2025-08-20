const express = require('express');
const router = express.Router();
const { hashPassword, verifyPassword, generateToken } = require('../utils/auth');
const { getUsuarioByMatricula, addUsuario } = require('../data/database');

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { matricula, senha } = req.body;

    // Validações básicas
    if (!matricula || !senha) {
      return res.status(400).json({ 
        error: 'Matrícula e senha são obrigatórios' 
      });
    }

    // Buscar usuário pela matrícula
    const usuario = await getUsuarioByMatricula(matricula);
    
    if (!usuario) {
      return res.status(401).json({ 
        error: 'Matrícula ou senha inválidos' 
      });
    }

    if (!usuario.ativo) {
      return res.status(401).json({ 
        error: 'Usuário inativo' 
      });
    }

    // Verificar senha
    const senhaValida = await verifyPassword(senha, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ 
        error: 'Matrícula ou senha inválidos' 
      });
    }

    // Gerar token JWT
    const token = generateToken(usuario.matricula, usuario.isAdmin);

    // Retornar dados do usuário (sem a senha)
    const { senha: _, ...usuarioSemSenha } = usuario;
    
    res.json({
      message: 'Login realizado com sucesso',
      token,
      usuario: usuarioSemSenha
    });

  } catch (error) {
    console.error('Erro no login:', error);
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
