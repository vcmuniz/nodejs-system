import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateBusinessProfileIds() {
  console.log('🔄 Iniciando população de businessProfileId...\n');

  try {
    // 1. Buscar todos os usuários e seus business_profiles
    const users = await prisma.users.findMany({
      include: {
        business_profiles: true
      }
    });

    console.log(`📊 Encontrados ${users.length} usuários\n`);

    for (const user of users) {
      if (user.business_profiles.length === 0) {
        console.log(`⚠️  Usuário ${user.email} não tem business_profile - pulando...`);
        continue;
      }

      const businessProfileId = user.business_profiles[0].id;
      console.log(`\n👤 Processando usuário: ${user.email}`);
      console.log(`🏢 Business Profile: ${businessProfileId}`);

      // 2. Atualizar categories
      const categoriesUpdated = await prisma.categories.updateMany({
        where: {
          userId: user.id,
          businessProfileId: null
        },
        data: {
          businessProfileId
        }
      });
      console.log(`   ✅ Categories: ${categoriesUpdated.count} atualizadas`);

      // 3. Atualizar contacts
      const contactsUpdated = await prisma.contacts.updateMany({
        where: {
          userId: user.id,
          businessProfileId: null
        },
        data: {
          businessProfileId
        }
      });
      console.log(`   ✅ Contacts: ${contactsUpdated.count} atualizados`);

      // 4. Atualizar lead_captures
      const leadCapturesUpdated = await prisma.lead_captures.updateMany({
        where: {
          userId: user.id,
          businessProfileId: null
        },
        data: {
          businessProfileId
        }
      });
      console.log(`   ✅ Lead Captures: ${leadCapturesUpdated.count} atualizadas`);

      // 5. Atualizar messaging_instances
      const messagingInstancesUpdated = await prisma.messaging_instances.updateMany({
        where: {
          userId: user.id,
          businessProfileId: null
        },
        data: {
          businessProfileId
        }
      });
      console.log(`   ✅ Messaging Instances: ${messagingInstancesUpdated.count} atualizadas`);

      // 6. Atualizar products
      const productsUpdated = await prisma.products.updateMany({
        where: {
          userId: user.id,
          businessProfileId: null
        },
        data: {
          businessProfileId
        }
      });
      console.log(`   ✅ Products: ${productsUpdated.count} atualizados`);

      // 7. Atualizar quotes
      const quotesUpdated = await prisma.quotes.updateMany({
        where: {
          userId: user.id,
          businessProfileId: null
        },
        data: {
          businessProfileId
        }
      });
      console.log(`   ✅ Quotes: ${quotesUpdated.count} atualizados`);

      // 8. Atualizar stock_entries
      const stockEntriesUpdated = await prisma.stock_entries.updateMany({
        where: {
          userId: user.id,
          businessProfileId: null
        },
        data: {
          businessProfileId
        }
      });
      console.log(`   ✅ Stock Entries: ${stockEntriesUpdated.count} atualizadas`);
    }

    console.log('\n✅ População concluída com sucesso!\n');

    // Verificar se ainda há registros sem businessProfileId
    const checks = await Promise.all([
      prisma.categories.count({ where: { businessProfileId: null } }),
      prisma.contacts.count({ where: { businessProfileId: null } }),
      prisma.lead_captures.count({ where: { businessProfileId: null } }),
      prisma.messaging_instances.count({ where: { businessProfileId: null } }),
      prisma.products.count({ where: { businessProfileId: null } }),
      prisma.quotes.count({ where: { businessProfileId: null } }),
      prisma.stock_entries.count({ where: { businessProfileId: null } })
    ]);

    console.log('📊 Verificação final:');
    console.log(`   Categories sem businessProfileId: ${checks[0]}`);
    console.log(`   Contacts sem businessProfileId: ${checks[1]}`);
    console.log(`   Lead Captures sem businessProfileId: ${checks[2]}`);
    console.log(`   Messaging Instances sem businessProfileId: ${checks[3]}`);
    console.log(`   Products sem businessProfileId: ${checks[4]}`);
    console.log(`   Quotes sem businessProfileId: ${checks[5]}`);
    console.log(`   Stock Entries sem businessProfileId: ${checks[6]}`);

    const total = checks.reduce((a, b) => a + b, 0);
    if (total === 0) {
      console.log('\n🎉 Todos os registros foram atualizados!');
    } else {
      console.log(`\n⚠️  Ainda existem ${total} registros sem businessProfileId`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

populateBusinessProfileIds()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
