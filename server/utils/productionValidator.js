const { logger } = require('./logger');

// Configurações obrigatórias para produção
const REQUIRED_PRODUCTION_VARS = [
  'JWT_SECRET',
  'ADMIN_PASSWORD',
  'ALLOWED_ORIGINS'
];

// Configurações recomendadas para produção
const RECOMMENDED_PRODUCTION_VARS = [
  'SSL_KEY_PATH',
  'SSL_CERT_PATH',
  'EMAIL_HOST',
  'EMAIL_USER'
];

// Validar configurações de produção
const validateProductionConfig = () => {
  const errors = [];
  const warnings = [];
  
  // Verificar se está em produção
  if (process.env.NODE_ENV !== 'production') {
    return { valid: true, errors: [], warnings: ['Not in production mode'] };
  }
  
  // Verificar variáveis obrigatórias
  REQUIRED_PRODUCTION_VARS.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    } else if (varName === 'JWT_SECRET' && process.env[varName].length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long');
    } else if (varName === 'ADMIN_PASSWORD' && process.env[varName].length < 8) {
      errors.push('ADMIN_PASSWORD must be at least 8 characters long');
    }
  });
  
  // Verificar variáveis recomendadas
  RECOMMENDED_PRODUCTION_VARS.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(`Missing recommended environment variable: ${varName}`);
    }
  });
  
  // Verificar configurações de segurança específicas
  if (process.env.ALLOWED_ORIGINS) {
    const origins = process.env.ALLOWED_ORIGINS.split(',');
    origins.forEach(origin => {
      if (!origin.startsWith('https://')) {
        warnings.push(`Origin should use HTTPS in production: ${origin}`);
      }
    });
  }
  
  // Verificar se senhas padrão estão sendo usadas
  const defaultPasswords = ['admin123', 'password', '123456', 'TempAdmin123!'];
  if (defaultPasswords.includes(process.env.ADMIN_PASSWORD)) {
    errors.push('Default password detected. Change ADMIN_PASSWORD immediately!');
  }
  
  const defaultSecrets = ['sua_chave_secreta_muito_segura_aqui', 'secret', 'jwt_secret'];
  if (defaultSecrets.includes(process.env.JWT_SECRET)) {
    errors.push('Default JWT_SECRET detected. Change JWT_SECRET immediately!');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

// Middleware para validar configurações na inicialização
const validateOnStartup = () => {
  const validation = validateProductionConfig();
  
  if (process.env.NODE_ENV === 'production') {
    // Log de validação
    logger.security('Production configuration validation', {
      valid: validation.valid,
      errorCount: validation.errors.length,
      warningCount: validation.warnings.length
    });
    
    // Erros críticos - parar servidor
    if (!validation.valid) {
      validation.errors.forEach(error => {
        logger.error('Production configuration error', { error });
        console.error(`❌ PRODUCTION ERROR: ${error}`);
      });
      
      console.error('\n🚨 CRITICAL: Server cannot start with invalid production configuration!');
      console.error('Please fix the above errors and restart the server.\n');
      process.exit(1);
    }
    
    // Avisos - continuar mas alertar
    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => {
        logger.warn('Production configuration warning', { warning });
        console.warn(`⚠️  PRODUCTION WARNING: ${warning}`);
      });
    }
    
    console.log('✅ Production configuration validated successfully');
  }
  
  return validation;
};

// Verificar configurações de segurança em tempo de execução
const checkSecurityConfig = () => {
  const securityChecks = {
    httpsRedirect: process.env.NODE_ENV === 'production',
    corsConfigured: !!process.env.ALLOWED_ORIGINS,
    jwtSecretSecure: process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32,
    adminPasswordSecure: process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 8,
    rateLimitEnabled: true, // Sempre habilitado no código
    helmetEnabled: true, // Sempre habilitado no código
    loggingEnabled: true // Sempre habilitado no código
  };
  
  const securityScore = Object.values(securityChecks).filter(Boolean).length;
  const totalChecks = Object.keys(securityChecks).length;
  const securityPercentage = Math.round((securityScore / totalChecks) * 100);
  
  logger.security('Security configuration check', {
    securityScore,
    totalChecks,
    securityPercentage,
    checks: securityChecks
  });
  
  return {
    score: securityScore,
    total: totalChecks,
    percentage: securityPercentage,
    checks: securityChecks
  };
};

// Gerar relatório de configuração
const generateConfigReport = () => {
  const validation = validateProductionConfig();
  const security = checkSecurityConfig();
  
  const report = {
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    validation: {
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings
    },
    security: {
      score: security.score,
      percentage: security.percentage,
      checks: security.checks
    },
    recommendations: []
  };
  
  // Adicionar recomendações baseadas na análise
  if (security.percentage < 80) {
    report.recommendations.push('Improve security configuration to achieve at least 80% compliance');
  }
  
  if (!security.checks.corsConfigured) {
    report.recommendations.push('Configure ALLOWED_ORIGINS for production CORS policy');
  }
  
  if (!security.checks.jwtSecretSecure) {
    report.recommendations.push('Use a stronger JWT_SECRET (at least 32 characters)');
  }
  
  return report;
};

module.exports = {
  validateProductionConfig,
  validateOnStartup,
  checkSecurityConfig,
  generateConfigReport
};