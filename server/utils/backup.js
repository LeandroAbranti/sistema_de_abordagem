const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');

// Diretório de backups
const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Caminho do banco de dados
const dbPath = path.join(__dirname, '../data/abordagens.db');

// Função para criar backup
const createBackup = () => {
  try {
    if (!fs.existsSync(dbPath)) {
      logger.warn('Database file not found for backup', { dbPath });
      return false;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `database_backup_${timestamp}.sqlite`;
    const backupPath = path.join(backupDir, backupFileName);

    // Copiar arquivo do banco
    fs.copyFileSync(dbPath, backupPath);

    // Verificar se o backup foi criado com sucesso
    const stats = fs.statSync(backupPath);
    
    logger.info('Database backup created successfully', {
      backupPath,
      size: stats.size,
      timestamp
    });

    return backupPath;
  } catch (error) {
    logger.error('Failed to create database backup', {
      error: error.message,
      stack: error.stack,
      dbPath
    });
    return false;
  }
};

// Função para limpar backups antigos (manter apenas os últimos N)
const cleanOldBackups = (keepCount = 10) => {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('database_backup_') && file.endsWith('.sqlite'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        mtime: fs.statSync(path.join(backupDir, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime); // Mais recentes primeiro

    if (files.length > keepCount) {
      const filesToDelete = files.slice(keepCount);
      
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        logger.info('Old backup deleted', { fileName: file.name });
      });

      logger.info('Backup cleanup completed', {
        totalBackups: files.length,
        deletedBackups: filesToDelete.length,
        remainingBackups: keepCount
      });
    }
  } catch (error) {
    logger.error('Failed to clean old backups', {
      error: error.message,
      stack: error.stack
    });
  }
};

// Função para backup automático com limpeza
const performAutomaticBackup = () => {
  logger.info('Starting automatic backup process');
  
  const backupPath = createBackup();
  if (backupPath) {
    cleanOldBackups(10); // Manter apenas os últimos 10 backups
    return true;
  }
  
  return false;
};

// Função para restaurar backup
const restoreBackup = (backupFileName) => {
  try {
    const backupPath = path.join(backupDir, backupFileName);
    
    if (!fs.existsSync(backupPath)) {
      logger.error('Backup file not found', { backupPath });
      return false;
    }

    // Criar backup do banco atual antes de restaurar
    const currentBackup = createBackup();
    if (currentBackup) {
      logger.info('Current database backed up before restore', { currentBackup });
    }

    // Restaurar backup
    fs.copyFileSync(backupPath, dbPath);
    
    logger.security('Database restored from backup', {
      backupFileName,
      restoredAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    logger.error('Failed to restore backup', {
      error: error.message,
      stack: error.stack,
      backupFileName
    });
    return false;
  }
};

// Função para listar backups disponíveis
const listBackups = () => {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('database_backup_') && file.endsWith('.sqlite'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          created: stats.mtime,
          path: filePath
        };
      })
      .sort((a, b) => b.created - a.created);

    return files;
  } catch (error) {
    logger.error('Failed to list backups', {
      error: error.message,
      stack: error.stack
    });
    return [];
  }
};

// Configurar backup automático (executar a cada 6 horas)
const scheduleAutomaticBackup = () => {
  const backupInterval = 6 * 60 * 60 * 1000; // 6 horas em millisegundos
  
  // Fazer backup inicial
  setTimeout(() => {
    performAutomaticBackup();
  }, 60000); // Aguardar 1 minuto após inicialização
  
  // Agendar backups regulares
  setInterval(() => {
    performAutomaticBackup();
  }, backupInterval);
  
  logger.info('Automatic backup scheduled', {
    intervalHours: 6,
    nextBackup: new Date(Date.now() + 60000).toISOString()
  });
};

module.exports = {
  createBackup,
  cleanOldBackups,
  performAutomaticBackup,
  restoreBackup,
  listBackups,
  scheduleAutomaticBackup
};