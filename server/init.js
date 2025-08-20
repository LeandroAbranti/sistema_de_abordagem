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
  console.log('   Senha: [Definida via variável ADMIN_PASSWORD ou padrão temporário]');
  console.log('');
  console.log('⚠️  IMPORTANTE: Configure ADMIN_PASSWORD no .env e altere em produção!');
    console.log('');
    console.log('🚀 Execute "npm run dev" para iniciar o sistema');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema:', error);
    process.exit(1);
  }
}

init();
