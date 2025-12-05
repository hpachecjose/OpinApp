// backend/src/testConnection.js
import { PrismaClient } from '@prisma/client';
import logger from './utils/logger.js';

const prisma = new PrismaClient();

async function testConnection() {
    console.log('🔍 Testando conexão com o banco de dados...\n');

    try {
        // Teste 1: Conexão básica
        console.log('1️⃣  Testando conexão básica...');
        await prisma.$connect();
        console.log('✅ Conexão com o banco estabelecida!\n');

        // Teste 2: Contar usuários
        console.log('2️⃣  Contando usuários na base...');
        const userCount = await prisma.users.count();
        console.log(`✅ Total de usuários: ${userCount}\n`);

        // Teste 3: Contar formulários
        console.log('3️⃣  Contando formulários...');
        const formsCount = await prisma.forms.count();
        console.log(`✅ Total de formulários: ${formsCount}\n`);

        // Teste 4: Contar feedbacks
        console.log('4️⃣  Contando feedbacks...');
        const feedbacksCount = await prisma.feedbacks.count();
        console.log(`✅ Total de feedbacks: ${feedbacksCount}\n`);

        // Teste 5: Verificar tabelas
        console.log('5️⃣  Verificando estrutura do banco...');
        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
        console.log('✅ Tabelas encontradas:');
        tables.forEach((table) => {
            console.log(`   - ${table.table_name}`);
        });

        console.log('\n🎉 Todos os testes passaram com sucesso!');
        console.log('\n📊 Resumo:');
        console.log(`   Usuários: ${userCount}`);
        console.log(`   Formulários: ${formsCount}`);
        console.log(`   Feedbacks: ${feedbacksCount}`);

    } catch (error) {
        console.error('\n❌ Erro ao conectar com o banco de dados:');
        console.error(error.message);

        if (error.code === 'P1001') {
            console.error('\n💡 Dica: Verifique se:');
            console.error('   1. PostgreSQL está rodando');
            console.error('   2. DATABASE_URL no .env está correto');
            console.error('   3. As credenciais estão corretas');
        } else if (error.code === 'P2021') {
            console.error('\n💡 Dica: A tabela não existe. Execute:');
            console.error('   npx prisma migrate dev');
        }

        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
