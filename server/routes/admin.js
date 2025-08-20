const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, hashPassword } = require('../utils/auth');
const { logger } = require('../utils/logger');
const { createBackup, listBackups, restoreBackup } = require('../utils/backup');
const { generateConfigReport } = require('../utils/productionValidator');
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

// === ROTAS DE BACKUP ===

// Listar backups disponíveis
router.get('/backups', async (req, res) => {
  try {
    const backups = listBackups();
    
    logger.adminAction(req.user.matricula, 'list_backups', 'system', {
      ip: req.ip || req.connection.remoteAddress,
      backupCount: backups.length
    });
    
    res.json({
      message: 'Backups listados com sucesso',
      backups
    });
  } catch (error) {
    logger.error('Error listing backups', {
      error: error.message,
      adminId: req.user.matricula,
      ip: req.ip || req.connection.remoteAddress
    });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter relatório completo de configuração
router.get('/security/report', async (req, res) => {
  try {
    const report = generateConfigReport();
    
    logger.adminAction(req.user.matricula, 'view_security_report', 'system', {
      ip: req.ip || req.connection.remoteAddress,
      securityScore: report.security.percentage
    });
    
    res.json({
      message: 'Relatório de segurança gerado',
      report
    });
  } catch (error) {
    logger.error('Error generating security report', {
      error: error.message,
      adminId: req.user.matricula,
      ip: req.ip || req.connection.remoteAddress
    });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar backup manual
router.post('/backups', async (req, res) => {
  try {
    const backupPath = createBackup();
    
    if (backupPath) {
      logger.adminAction(req.user.matricula, 'create_backup', 'database', {
        ip: req.ip || req.connection.remoteAddress,
        backupPath
      });
      
      res.json({
        message: 'Backup criado com sucesso',
        backupPath
      });
    } else {
      res.status(500).json({ error: 'Falha ao criar backup' });
    }
  } catch (error) {
    logger.error('Error creating backup', {
      error: error.message,
      adminId: req.user.matricula,
      ip: req.ip || req.connection.remoteAddress
    });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Restaurar backup
router.post('/backups/:filename/restore', async (req, res) => {
  try {
    const { filename } = req.params;
    const success = restoreBackup(filename);
    
    if (success) {
      logger.adminAction(req.user.matricula, 'restore_backup', 'database', {
        ip: req.ip || req.connection.remoteAddress,
        backupFilename: filename,
        severity: 'critical'
      });
      
      res.json({
        message: 'Backup restaurado com sucesso',
        filename
      });
    } else {
      res.status(500).json({ error: 'Falha ao restaurar backup' });
    }
  } catch (error) {
    logger.error('Error restoring backup', {
      error: error.message,
      adminId: req.user.matricula,
      backupFilename: req.params.filename,
      ip: req.ip || req.connection.remoteAddress
    });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// === ROTAS DE LOGS DE SEGURANÇA ===

// Obter estatísticas de segurança
router.get('/security/stats', async (req, res) => {
  try {
    // Esta é uma implementação básica - em produção, você poderia
    // analisar os arquivos de log para gerar estatísticas reais
    const stats = {
      totalLoginAttempts: 0,
      failedLoginAttempts: 0,
      rateLimitViolations: 0,
      corsViolations: 0,
      lastUpdate: new Date().toISOString()
    };
    
    logger.adminAction(req.user.matricula, 'view_security_stats', 'system', {
      ip: req.ip || req.connection.remoteAddress
    });
    
    res.json({
      message: 'Estatísticas de segurança obtidas',
      stats
    });
  } catch (error) {
    logger.error('Error getting security stats', {
      error: error.message,
      adminId: req.user.matricula,
      ip: req.ip || req.connection.remoteAddress
    });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
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

    // Validação de matrícula (apenas números)
    if (!/^\d+$/.test(matricula)) {
      return res.status(400).json({ 
        error: 'Matrícula deve conter apenas números' 
      });
    }

    // Validação de senha forte
    if (senha.length < 8) {
      return res.status(400).json({ 
        error: 'Senha deve ter pelo menos 8 caracteres' 
      });
    }

    // Sanitização do nome (remover caracteres especiais perigosos)
    const nomeSanitizado = nome.trim().substring(0, 100).replace(/<[^>]*>/g, '');

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
      nome: nomeSanitizado,
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
