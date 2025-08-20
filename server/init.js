const { initializeDatabase } = require('./data/database');

console.log('🚔 Inicializando Sistema de Abordagens de Trânsito...');
console.log('==================================================');

async function init() {
  try {
    console.log('📊 Inicializando banco de dados...');
    await initializeDatabase();
    
    console.log('✅ Sistema inicializado com sucesso!');
    console.log('');
    console.log('🔐 Usuário Administrador criado:');
    console.log('   Matrícula: 257');
    console.log('   Senha: 699235Le!');
    console.log('');
    console.log('⚠️  IMPORTANTE: Em produção, altere esta senha imediatamente!');
    console.log('');
    console.log('🚀 Execute "npm run dev" para iniciar o sistema');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema:', error);
    process.exit(1);
  }
}

init();
