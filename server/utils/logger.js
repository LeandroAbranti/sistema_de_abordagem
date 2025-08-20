const fs = require('fs');
const path = require('path');

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Função para formatar timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Função para escrever logs
const writeLog = (level, message, metadata = {}) => {
  const logEntry = {
    timestamp: getTimestamp(),
    level,
    message,
    ...metadata
  };

  const logString = JSON.stringify(logEntry) + '\n';
  
  // Log geral
  const generalLogFile = path.join(logsDir, 'app.log');
  fs.appendFileSync(generalLogFile, logString);
  
  // Log específico de segurança
  if (level === 'SECURITY' || level === 'ERROR') {
    const securityLogFile = path.join(logsDir, 'security.log');
    fs.appendFileSync(securityLogFile, logString);
  }
  
  // Console em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${level}] ${message}`, metadata);
  }
};

// Funções de logging específicas
const logger = {
  info: (message, metadata) => writeLog('INFO', message, metadata),
  warn: (message, metadata) => writeLog('WARN', message, metadata),
  error: (message, metadata) => writeLog('ERROR', message, metadata),
  security: (message, metadata) => writeLog('SECURITY', message, metadata),
  
  // Eventos específicos de segurança
  loginAttempt: (ip, matricula, success, metadata = {}) => {
    writeLog('SECURITY', `Login attempt: ${success ? 'SUCCESS' : 'FAILED'}`, {
      ip,
      matricula,
      success,
      event: 'login_attempt',
      ...metadata
    });
  },
  
  rateLimitExceeded: (ip, endpoint, metadata = {}) => {
    writeLog('SECURITY', 'Rate limit exceeded', {
      ip,
      endpoint,
      event: 'rate_limit_exceeded',
      ...metadata
    });
  },
  
  corsViolation: (origin, ip, metadata = {}) => {
    writeLog('SECURITY', 'CORS violation detected', {
      origin,
      ip,
      event: 'cors_violation',
      ...metadata
    });
  },
  
  suspiciousActivity: (ip, activity, metadata = {}) => {
    writeLog('SECURITY', `Suspicious activity: ${activity}`, {
      ip,
      activity,
      event: 'suspicious_activity',
      ...metadata
    });
  },
  
  adminAction: (adminId, action, target, metadata = {}) => {
    writeLog('SECURITY', `Admin action: ${action}`, {
      adminId,
      action,
      target,
      event: 'admin_action',
      ...metadata
    });
  }
};

// Middleware para logging de requests
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const ip = req.ip || req.connection.remoteAddress;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration,
      event: 'http_request'
    };
    
    if (res.statusCode >= 400) {
      logger.warn(`HTTP ${res.statusCode}: ${req.method} ${req.url}`, logData);
    } else {
      logger.info(`HTTP ${res.statusCode}: ${req.method} ${req.url}`, logData);
    }
  });
  
  next();
};

// Função para rotacionar logs (executar diariamente)
const rotateLogs = () => {
  const today = new Date().toISOString().split('T')[0];
  const logFiles = ['app.log', 'security.log'];
  
  logFiles.forEach(filename => {
    const currentFile = path.join(logsDir, filename);
    const rotatedFile = path.join(logsDir, `${filename}.${today}`);
    
    if (fs.existsSync(currentFile)) {
      fs.renameSync(currentFile, rotatedFile);
    }
  });
};

module.exports = {
  logger,
  requestLogger,
  rotateLogs
};