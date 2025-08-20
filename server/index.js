const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const { initializeDatabase } = require('./data/database');
const { logger, requestLogger } = require('./utils/logger');
const { scheduleAutomaticBackup } = require('./utils/backup');
const { validateOnStartup, checkSecurityConfig } = require('./utils/productionValidator');

const authRoutes = require('./routes/auth');
const blitzRoutes = require('./routes/blitz');
const abordagemRoutes = require('./routes/abordagem');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para forçar HTTPS em produção
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Middleware de segurança com configurações aprimoradas
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting para prevenir ataques
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requests por IP
});
app.use(limiter);

// Middleware para CORS com configuração aprimorada
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://leandroabranti.github.io'])
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000', 'http://127.0.0.1:5000', 'https://leandroabranti.github.io'];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sem origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // Cache preflight por 24 horas
}));

// Middleware para logging de requests
app.use(requestLogger);

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/blitz', blitzRoutes);
app.use('/api/abordagem', abordagemRoutes);
app.use('/api/admin', adminRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sistema de Abordagens funcionando!' });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  // Log do erro
  logger.error('Server error', {
    error: err.message,
    stack: err.stack,
    ip,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent')
  });
  
  // Verificar se é erro de CORS
  if (err.message.includes('CORS')) {
    logger.corsViolation(req.get('Origin'), ip, {
      url: req.url,
      method: req.method
    });
  }
  
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Rota para arquivos não encontrados
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicializar banco de dados e depois iniciar servidor
const startServer = async () => {
  try {
    // Validar configurações de produção
    console.log('🔍 Validando configurações de segurança...');
    validateOnStartup();
    
    await initializeDatabase();
    
    // Inicializar sistema de backup automático
    scheduleAutomaticBackup();
    
    // Verificar configurações de segurança
    const securityCheck = checkSecurityConfig();
    
    app.listen(PORT, () => {
      console.log(`🚔 Servidor rodando na porta ${PORT}`);
      console.log(`🔐 Sistema de Abordagens de Trânsito ativo`);
      console.log(`📱 Acesse: http://localhost:${PORT}`);
      console.log(`💾 Sistema de backup automático ativado`);
      console.log(`🛡️  Nível de segurança: ${securityCheck.percentage}% (${securityCheck.score}/${securityCheck.total})`);
      
      if (process.env.NODE_ENV === 'production') {
        console.log('🔒 Modo de produção ativo - Todas as proteções habilitadas');
      } else {
        console.log('🔧 Modo de desenvolvimento - Logs detalhados habilitados');
      }
      
      logger.info('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        backupEnabled: true,
        securityScore: securityCheck.percentage
      });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    console.error('❌ Erro ao inicializar sistema:', error);
    process.exit(1);
  }
};

startServer();
