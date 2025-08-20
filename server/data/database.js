// Banco de dados SQLite persistente
const database = require('./sqlite');
const { runMigrations } = require('./migrations');

// Função para inicializar o banco de dados
const initializeDatabase = async () => {
  try {
    // Executar migrações (criar tabelas e admin)
    const success = await runMigrations();
    if (success) {
      console.log('✅ Banco de dados inicializado com sucesso');
      console.log('🔐 Administrador padrão criado (Matrícula: 257)');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    return false;
  }
};

// Funções de acesso ao banco - Usuários
const getUsuarios = async () => {
  try {
    return await database.all('SELECT * FROM usuarios ORDER BY id');
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
};

const addUsuario = async (usuario) => {
  try {
    const result = await database.run(
      `INSERT INTO usuarios (matricula, senha, nome, isAdmin, ativo) 
       VALUES (?, ?, ?, ?, ?)`,
      [usuario.matricula, usuario.senha, usuario.nome, usuario.isAdmin ? 1 : 0, usuario.ativo ? 1 : 0]
    );
    
    // Buscar o usuário criado
    return await database.get('SELECT * FROM usuarios WHERE id = ?', [result.id]);
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    return null;
  }
};

const getUsuarioByMatricula = async (matricula) => {
  try {
    return await database.get('SELECT * FROM usuarios WHERE matricula = ?', [matricula]);
  } catch (error) {
    console.error('Erro ao buscar usuário por matrícula:', error);
    return null;
  }
};

// Funções de acesso ao banco - Blitz
const getBlitz = async () => {
  try {
    return await database.all('SELECT * FROM blitz ORDER BY dataCriacao DESC');
  } catch (error) {
    console.error('Erro ao buscar blitz:', error);
    return [];
  }
};

const addBlitz = async (blitz) => {
  try {
    const result = await database.run(
      `INSERT INTO blitz (nome, local, dataInicio, dataFim, responsavel, observacoes, ativa) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [blitz.nome, blitz.local, blitz.dataInicio, blitz.dataFim, blitz.responsavel, blitz.observacoes, 1]
    );
    
    // Buscar a blitz criada
    return await database.get('SELECT * FROM blitz WHERE id = ?', [result.id]);
  } catch (error) {
    console.error('Erro ao adicionar blitz:', error);
    return null;
  }
};

const getBlitzById = async (id) => {
  try {
    return await database.get('SELECT * FROM blitz WHERE id = ?', [id]);
  } catch (error) {
    console.error('Erro ao buscar blitz por ID:', error);
    return null;
  }
};

const updateBlitz = async (id, updates) => {
  try {
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    
    await database.run(
      `UPDATE blitz SET ${setClause} WHERE id = ?`,
      values
    );
    
    // Retornar a blitz atualizada
    return await database.get('SELECT * FROM blitz WHERE id = ?', [id]);
  } catch (error) {
    console.error('Erro ao atualizar blitz:', error);
    return null;
  }
};

// Funções de acesso ao banco - Abordagens
const getAbordagens = async () => {
  try {
    return await database.all('SELECT * FROM abordagens ORDER BY dataCriacao DESC');
  } catch (error) {
    console.error('Erro ao buscar abordagens:', error);
    return [];
  }
};

const addAbordagem = async (abordagem) => {
  try {
    const result = await database.run(
      `INSERT INTO abordagens (blitzId, tipoAbordagem, placaVeiculo, modeloVeiculo, corVeiculo, 
                              nomeCondutor, cpfCondutor, cnhCondutor, infracoes, observacoes, 
                              valorMulta, status, agente) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        abordagem.blitzId, abordagem.tipoAbordagem, abordagem.placaVeiculo, 
        abordagem.modeloVeiculo, abordagem.corVeiculo, abordagem.nomeCondutor,
        abordagem.cpfCondutor, abordagem.cnhCondutor, abordagem.infracoes,
        abordagem.observacoes, abordagem.valorMulta || 0, abordagem.status || 'pendente',
        abordagem.agente
      ]
    );
    
    // Buscar a abordagem criada
    return await database.get('SELECT * FROM abordagens WHERE id = ?', [result.id]);
  } catch (error) {
    console.error('Erro ao adicionar abordagem:', error);
    return null;
  }
};

const getAbordagensByBlitz = async (blitzId) => {
  try {
    return await database.all('SELECT * FROM abordagens WHERE blitzId = ? ORDER BY dataCriacao DESC', [blitzId]);
  } catch (error) {
    console.error('Erro ao buscar abordagens por blitz:', error);
    return [];
  }
};

module.exports = {
  initializeDatabase,
  getUsuarios,
  getBlitz,
  getAbordagens,
  addUsuario,
  addBlitz,
  addAbordagem,
  updateBlitz,
  getUsuarioByMatricula,
  getBlitzById,
  getAbordagensByBlitz
};
