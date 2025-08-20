const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, hashPassword } = require('../utils/auth');
const { 
  getUsuarios, 
  addUsuario, 
  getUsuarioByMatricula,
  getBlitz, 
  addBlitz, 
  updateBlitz,
  getAbordagensByBlitz 
} = require('../data/database');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

// Listar todos os usuários
router.get('/usuarios', async (req, res) => {
  try {
    const usuarios = (await getUsuarios()).map(u => {
      const { senha, ...usuarioSemSenha } = u;
      return usuarioSemSenha;
    });
    
    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo usuário
router.post('/usuarios', async (req, res) => {
  try {
    const { matricula, senha, nome } = req.body;

    // Validações
    if (!matricula || !senha || !nome) {
      return res.status(400).json({ 
        error: 'Matrícula, senha e nome são obrigatórios' 
      });
    }

    // Verificar se matrícula já existe
    const usuarioExistente = await getUsuarioByMatricula(matricula);
    if (usuarioExistente) {
      return res.status(400).json({ 
        error: 'Matrícula já cadastrada' 
      });
    }

    // Hash da senha
    const senhaHash = await hashPassword(senha);

    // Criar usuário
    const novoUsuario = await addUsuario({
      matricula,
      senha: senhaHash,
      nome,
      isAdmin: false,
      ativo: true
    });

    const { senha: _, ...usuarioSemSenha } = novoUsuario;
    
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      usuario: usuarioSemSenha
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar todas as blitz
router.get('/blitz', async (req, res) => {
  try {
    const blitz = await getBlitz();
    res.json(blitz);
  } catch (error) {
    console.error('Erro ao listar blitz:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova blitz
router.post('/blitz', async (req, res) => {
  try {
    const { local, data, hora, matriculasParticipantes } = req.body;

    // Validações
    if (!local || !data || !hora || !matriculasParticipantes || !Array.isArray(matriculasParticipantes)) {
      return res.status(400).json({ 
        error: 'Local, data, hora e lista de matrículas participantes são obrigatórios' 
      });
    }

    // Verificar se as matrículas existem
    const usuarios = await getUsuarios();
    const matriculasValidas = matriculasParticipantes.every(matricula => 
      usuarios.some(u => u.matricula === matricula)
    );

    if (!matriculasValidas) {
      return res.status(400).json({ 
        error: 'Uma ou mais matrículas não existem no sistema' 
      });
    }

    // Criar blitz
    const novaBlitz = await addBlitz({
      local,
      data,
      hora,
      matriculasParticipantes,
      criadaPor: req.user.matricula
    });

    res.status(201).json({
      message: 'Blitz criada com sucesso',
      blitz: novaBlitz
    });

  } catch (error) {
    console.error('Erro ao criar blitz:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Encerrar blitz
router.put('/blitz/:id/encerrar', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar blitz
    const blitz = (await getBlitz()).find(b => b.id === parseInt(id));
    if (!blitz) {
      return res.status(404).json({ error: 'Blitz não encontrada' });
    }

    if (!blitz.ativa) {
      return res.status(400).json({ error: 'Blitz já foi encerrada' });
    }

    // Encerrar blitz
    const blitzEncerrada = await updateBlitz(parseInt(id), { 
      ativa: false, 
      dataEncerramento: new Date().toISOString(),
      encerradaPor: req.user.matricula
    });

    res.json({
      message: 'Blitz encerrada com sucesso',
      blitz: blitzEncerrada
    });

  } catch (error) {
    console.error('Erro ao encerrar blitz:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório de blitz encerrada
router.get('/blitz/:id/relatorio', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar blitz
    const blitz = (await getBlitz()).find(b => b.id === parseInt(id));
    if (!blitz) {
      return res.status(404).json({ error: 'Blitz não encontrada' });
    }

    // Buscar abordagens da blitz
    const abordagens = await getAbordagensByBlitz(parseInt(id));

    res.json({
      blitz,
      abordagens,
      totalAbordagens: abordagens.length
    });

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
