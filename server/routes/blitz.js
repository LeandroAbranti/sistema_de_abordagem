const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../utils/auth');
const { getBlitz, getBlitzById } = require('../data/database');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Listar blitz ativas (que o usuário pode participar)
router.get('/ativas', async (req, res) => {
  try {
    const blitzAtivas = (await getBlitz()).filter(blitz => 
      blitz.ativa && 
      blitz.matriculasParticipantes.includes(req.user.matricula)
    );

    res.json(blitzAtivas);
  } catch (error) {
    console.error('Erro ao listar blitz ativas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar todas as blitz (apenas para visualização)
router.get('/', async (req, res) => {
  try {
    const blitz = await getBlitz();
    res.json(blitz);
  } catch (error) {
    console.error('Erro ao listar blitz:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar blitz específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const blitz = await getBlitzById(parseInt(id));

    if (!blitz) {
      return res.status(404).json({ error: 'Blitz não encontrada' });
    }

    // Verificar se o usuário pode acessar esta blitz
    if (!blitz.matriculasParticipantes.includes(req.user.matricula)) {
      return res.status(403).json({ error: 'Acesso negado a esta blitz' });
    }

    res.json(blitz);
  } catch (error) {
    console.error('Erro ao buscar blitz:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar se usuário pode participar de uma blitz
router.get('/:id/verificar-participacao', async (req, res) => {
  try {
    const { id } = req.params;
    const blitz = await getBlitzById(parseInt(id));

    if (!blitz) {
      return res.status(404).json({ error: 'Blitz não encontrada' });
    }

    const podeParticipar = blitz.ativa && 
                          blitz.matriculasParticipantes.includes(req.user.matricula);

    res.json({
      podeParticipar,
      blitz: podeParticipar ? blitz : null
    });

  } catch (error) {
    console.error('Erro ao verificar participação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
