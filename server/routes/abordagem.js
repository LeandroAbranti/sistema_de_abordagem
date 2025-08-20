const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../utils/auth');
const { 
  addAbordagem, 
  getAbordagensByBlitz, 
  getBlitzById,
  getAbordagemById,
  getAbordagensByMatricula 
} = require('../data/database');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Registrar nova abordagem
router.post('/', async (req, res) => {
  try {
    const {
      blitzId,
      placaVeiculo,
      cpfCondutor,
      cnhCondutor,
      testeEtilometro,
      veiculoRemovido,
      autuacao,
      artigosCodigo,
      observacoes
    } = req.body;

    // Validações básicas
    if (!blitzId || !placaVeiculo) {
      return res.status(400).json({ 
        error: 'ID da blitz e placa do veículo são obrigatórios' 
      });
    }

    // Validação de formato da placa (padrão brasileiro)
    const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
    const placaLimpa = placaVeiculo.replace(/[^A-Z0-9]/g, '').toUpperCase();
    if (!placaRegex.test(placaLimpa)) {
      return res.status(400).json({ 
        error: 'Formato de placa inválido' 
      });
    }

    // Validação de CPF (se fornecido)
    if (cpfCondutor && !/^\d{11}$/.test(cpfCondutor.replace(/[^0-9]/g, ''))) {
      return res.status(400).json({ 
        error: 'CPF deve conter 11 dígitos' 
      });
    }

    // Validação de CNH (se fornecida)
    if (cnhCondutor && !/^\d{11}$/.test(cnhCondutor.replace(/[^0-9]/g, ''))) {
      return res.status(400).json({ 
        error: 'CNH deve conter 11 dígitos' 
      });
    }

    // Sanitização de observações (limitar tamanho e remover caracteres perigosos)
    const observacoesSanitizadas = observacoes ? observacoes.substring(0, 500).replace(/<[^>]*>/g, '') : '';

    // Verificar se a blitz existe e está ativa
    const blitz = await getBlitzById(parseInt(blitzId));
    if (!blitz) {
      return res.status(404).json({ error: 'Blitz não encontrada' });
    }

    if (!blitz.ativa) {
      return res.status(400).json({ error: 'Não é possível registrar abordagens em blitz encerradas' });
    }

    // Verificar se o usuário pode participar desta blitz
    if (!blitz.matriculasParticipantes.includes(req.user.matricula)) {
      return res.status(403).json({ error: 'Acesso negado a esta blitz' });
    }

    // Criar abordagem
    const novaAbordagem = await addAbordagem({
      blitzId: parseInt(blitzId),
      matriculaAgente: req.user.matricula,
      placaVeiculo: placaLimpa,
      cpfCondutor: cpfCondutor ? cpfCondutor.replace(/[^0-9]/g, '') : null,
      cnhCondutor: cnhCondutor ? cnhCondutor.replace(/[^0-9]/g, '') : null,
      testeEtilometro: Boolean(testeEtilometro),
      veiculoRemovido: Boolean(veiculoRemovido),
      autuacao: Boolean(autuacao),
      artigosCodigo: Array.isArray(artigosCodigo) ? artigosCodigo.slice(0, 10) : [],
      observacoes: observacoesSanitizadas,
      dataAbordagem: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Abordagem registrada com sucesso',
      abordagem: novaAbordagem
    });

  } catch (error) {
    console.error('Erro ao registrar abordagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar abordagens de uma blitz específica
router.get('/blitz/:blitzId', async (req, res) => {
  try {
    const { blitzId } = req.params;
    
    // Verificar se a blitz existe
    const blitz = await getBlitzById(parseInt(blitzId));
    if (!blitz) {
      return res.status(404).json({ error: 'Blitz não encontrada' });
    }

    // Verificar se o usuário pode acessar esta blitz
    if (!blitz.matriculasParticipantes.includes(req.user.matricula)) {
      return res.status(403).json({ error: 'Acesso negado a esta blitz' });
    }

    // Buscar abordagens
    const abordagens = await getAbordagensByBlitz(parseInt(blitzId));

    res.json({
      blitz,
      abordagens,
      totalAbordagens: abordagens.length
    });

  } catch (error) {
    console.error('Erro ao listar abordagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar abordagem específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar abordagem diretamente
    const abordagemEncontrada = await getAbordagemById(parseInt(id));
    
    if (!abordagemEncontrada) {
      return res.status(404).json({ error: 'Abordagem não encontrada' });
    }

    // Buscar a blitz relacionada
    const blitzEncontrada = await getBlitzById(abordagemEncontrada.blitzId);
    
    if (!blitzEncontrada) {
      return res.status(404).json({ error: 'Blitz relacionada não encontrada' });
    }

    // Verificar se o usuário pode acessar esta abordagem
    if (!blitzEncontrada.matriculasParticipantes.includes(req.user.matricula)) {
      return res.status(403).json({ error: 'Acesso negado a esta abordagem' });
    }

    res.json({
      abordagem: abordagemEncontrada,
      blitz: blitzEncontrada
    });

  } catch (error) {
    console.error('Erro ao buscar abordagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar abordagens do usuário logado
router.get('/minhas/abordagens', async (req, res) => {
  try {
    // Buscar abordagens diretamente pela matrícula
    const minhasAbordagens = await getAbordagensByMatricula(req.user.matricula);

    res.json({
      abordagens: minhasAbordagens,
      total: minhasAbordagens.length
    });

  } catch (error) {
    console.error('Erro ao listar minhas abordagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
