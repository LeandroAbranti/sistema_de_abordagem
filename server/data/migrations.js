const database = require('./sqlite');
const bcrypt = require('bcryptjs');

// Script de migração para criar as tabelas
const createTables = async () => {
  try {
    // Conectar ao banco
    await database.connect();

    // Criar tabela de usuários
    await database.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        matricula TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        nome TEXT NOT NULL,
        isAdmin BOOLEAN DEFAULT 0,
        ativo BOOLEAN DEFAULT 1,
        dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de blitz
    await database.run(`
      CREATE TABLE IF NOT EXISTS blitz (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        local TEXT NOT NULL,
        dataInicio DATETIME NOT NULL,
        dataFim DATETIME,
        responsavel TEXT NOT NULL,
        observacoes TEXT,
        ativa BOOLEAN DEFAULT 1,
        dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de abordagens
    await database.run(`
      CREATE TABLE IF NOT EXISTS abordagens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        blitzId INTEGER NOT NULL,
        tipoAbordagem TEXT NOT NULL,
        placaVeiculo TEXT,
        modeloVeiculo TEXT,
        corVeiculo TEXT,
        nomeCondutor TEXT,
        cpfCondutor TEXT,
        cnhCondutor TEXT,
        infracoes TEXT,
        observacoes TEXT,
        valorMulta DECIMAL(10,2) DEFAULT 0,
        status TEXT DEFAULT 'pendente',
        agente TEXT NOT NULL,
        dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (blitzId) REFERENCES blitz (id)
      )
    `);

    console.log('✅ Tabelas criadas com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    return false;
  }
};

// Criar usuário administrador padrão
const createAdminUser = async () => {
  try {
    // Verificar se já existe um admin
    const existingAdmin = await database.get(
      'SELECT * FROM usuarios WHERE matricula = ?',
      ['257']
    );

    if (existingAdmin) {
      console.log('🔐 Administrador já existe');
      return true;
    }

    // Criar hash da senha (usar variável de ambiente ou padrão temporário)
  const adminPassword = process.env.ADMIN_PASSWORD || 'TempAdmin123!';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Inserir administrador
    await database.run(
      `INSERT INTO usuarios (matricula, senha, nome, isAdmin, ativo) 
       VALUES (?, ?, ?, ?, ?)`,
      ['257', hashedPassword, 'Administrador', 1, 1]
    );

    console.log('🔐 Administrador padrão criado (Matrícula: 257)');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error);
    return false;
  }
};

// Executar migrações
const runMigrations = async () => {
  try {
    console.log('🚀 Executando migrações do banco de dados...');
    
    const tablesCreated = await createTables();
    if (!tablesCreated) {
      throw new Error('Falha ao criar tabelas');
    }

    const adminCreated = await createAdminUser();
    if (!adminCreated) {
      throw new Error('Falha ao criar administrador');
    }

    console.log('✅ Migrações executadas com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro nas migrações:', error);
    return false;
  }
};

module.exports = {
  createTables,
  createAdminUser,
  runMigrations
};