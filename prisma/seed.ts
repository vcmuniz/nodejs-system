import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.session.deleteMany();
  await prisma.businessProfile.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuários de teste
  const user1 = await prisma.user.create({
    data: {
      email: 'joao@example.com',
      name: 'João Silva',
      password: 'hash_da_senha', // Em produção seria hash
      cpf: '12345678900',
      phone: '11999999999',
      whatsapp: '11999999999',
      instagram: '@joaosilva',
      facebook: 'joao.silva',
      role: 'USER',
      provider: 'LOCAL',
      status: 'ACTIVE',
      isVerified: true,
      isActive: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'maria@example.com',
      name: 'Maria Santos',
      password: 'hash_da_senha',
      cpf: '98765432100',
      phone: '11988888888',
      whatsapp: '11988888888',
      instagram: '@mariasantos',
      facebook: 'maria.santos',
      role: 'SELLER',
      provider: 'LOCAL',
      status: 'ACTIVE',
      isVerified: true,
      isActive: true,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: 'hash_da_senha',
      cpf: '11111111111',
      phone: '11977777777',
      role: 'ADMIN',
      provider: 'LOCAL',
      status: 'ACTIVE',
      isVerified: true,
      isActive: true,
    },
  });

  // Criar business profiles
  const business1 = await prisma.businessProfile.create({
    data: {
      userId: user2.id,
      personType: 'PJ',
      status: 'VERIFIED',
      companyName: 'Tech Solutions Brasil',
      cnpj: '12345678000195',
      tradingName: 'Tech Solutions',
      description: 'Empresa especializada em soluções tecnológicas',
      categories: JSON.stringify(['Tecnologia', 'Software', 'Consultoria']),
      cep: '01310100',
      street: 'Avenida Paulista',
      number: '1000',
      complement: 'Sala 500',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      latitude: -23.5629,
      longitude: -46.6560,
      instagram: '@techsolutions',
      facebook: 'techsolutions.br',
      whatsapp: '11987654321',
      website: 'https://techsolutions.com.br',
    },
  });

  const business2 = await prisma.businessProfile.create({
    data: {
      userId: user2.id,
      personType: 'PJ',
      status: 'VERIFIED',
      companyName: 'Restaurante Gourmet',
      cnpj: '98765432000100',
      tradingName: 'Gourmet Café',
      description: 'Restaurante com culinária moderna e ambiente acolhedor',
      categories: JSON.stringify(['Alimentação', 'Restaurante', 'Café']),
      cep: '01310100',
      street: 'Rua Augusta',
      number: '2500',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      latitude: -23.5505,
      longitude: -46.6560,
      instagram: '@gourmetcafe',
      facebook: 'gourmetcafe.sp',
      whatsapp: '11986543210',
      website: 'https://gourmetcafe.com.br',
    },
  });

  // Criar sessões
  await prisma.session.create({
    data: {
      userId: user1.id,
      accessToken: 'access_token_user1_' + Date.now(),
      refreshToken: 'refresh_token_user1_' + Date.now(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await prisma.session.create({
    data: {
      userId: user2.id,
      accessToken: 'access_token_user2_' + Date.now(),
      refreshToken: 'refresh_token_user2_' + Date.now(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📋 Dados criados:');
  console.log('  - 3 usuários de teste');
  console.log('  - 2 perfis de negócio');
  console.log('  - 2 sessões ativas');
  console.log('\n👤 Usuários de teste:');
  console.log(`  Email: ${user1.email} | Papel: USER`);
  console.log(`  Email: ${user2.email} | Papel: SELLER`);
  console.log(`  Email: ${user3.email} | Papel: ADMIN`);
  console.log('\n📍 Negócios criados:');
  console.log(`  ${business1.tradingName} (${business1.cnpj})`);
  console.log(`  ${business2.tradingName} (${business2.cnpj})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
