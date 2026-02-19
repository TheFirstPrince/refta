import { PrismaClient, ProcurementStatus, UserRole, LineItemSource, PriceHistorySource } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { normalizeKey } from '../lib/normalize';

const prisma = new PrismaClient();

async function main() {
  await prisma.aiExtraction.deleteMany();
  await prisma.document.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.procurement.deleteMany();
  await prisma.productAlias.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  const [adminHash, buyerHash, logisticsHash] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('buyer123', 10),
    bcrypt.hash('logistics123', 10)
  ]);

  const admin = await prisma.user.create({ data: { fullName: 'Admin User', email: 'admin@example.com', passwordHash: adminHash, role: UserRole.admin } });
  const buyer = await prisma.user.create({ data: { fullName: 'Buyer One', email: 'buyer1@example.com', passwordHash: buyerHash, role: UserRole.buyer } });
  await prisma.user.create({ data: { fullName: 'Logistics One', email: 'logistics@example.com', passwordHash: logisticsHash, role: UserRole.logistics } });

  const s1 = await prisma.supplier.create({ data: { name: 'ООО АудиоПоставка', url: 'https://supplier-a.example.com' } });
  const s2 = await prisma.supplier.create({ data: { name: 'АО ПрофСнаб', url: 'https://supplier-b.example.com' } });

  const p1 = await prisma.product.create({ data: { name: 'Behringer X32', normalizedKey: normalizeKey('Behringer X32'), category: 'Mixer' } });
  const p2 = await prisma.product.create({ data: { name: 'Shure SM58', normalizedKey: normalizeKey('Shure SM58') } });
  const p3 = await prisma.product.create({ data: { name: 'Sennheiser EW 100', normalizedKey: normalizeKey('Sennheiser EW 100') } });

  await prisma.productAlias.createMany({ data: [
    { productId: p1.id, alias: 'x32', aliasNormalized: normalizeKey('x32') },
    { productId: p1.id, alias: 'behringer x-32', aliasNormalized: normalizeKey('behringer x-32') }
  ]});

  const procurement = await prisma.procurement.create({
    data: {
      title: 'Оснащение конференц-зала',
      nmck: 2500000,
      responsibleUserId: buyer.id,
      logisticsCost: 25000,
      otherServicesCost: 12000,
      deliveryLocation: 'Москва, ул. Пример, 1',
      status: ProcurementStatus.in_work
    }
  });

  await prisma.lineItem.createMany({ data: [
    { procurementId: procurement.id, productId: p1.id, nameSnapshot: p1.name, supplierId: s1.id, qty: 1, unitPrice: 420000, total: 420000, source: LineItemSource.history },
    { procurementId: procurement.id, productId: p2.id, nameSnapshot: p2.name, supplierId: s2.id, qty: 4, unitPrice: 13500, total: 54000, source: LineItemSource.manual }
  ]});

  await prisma.priceHistory.createMany({ data: [
    { productId: p1.id, supplierId: s1.id, unitPrice: 410000, source: PriceHistorySource.line_item, procurementId: procurement.id },
    { productId: p1.id, supplierId: s1.id, unitPrice: 420000, source: PriceHistorySource.line_item, procurementId: procurement.id },
    { productId: p1.id, supplierId: s2.id, unitPrice: 430000, source: PriceHistorySource.manual, procurementId: procurement.id },
    { productId: p2.id, supplierId: s2.id, unitPrice: 13500, source: PriceHistorySource.line_item, procurementId: procurement.id }
  ]});

  await prisma.document.create({ data: { procurementId: procurement.id, type: 'tz', filename: 'tz-sample.txt', mimeType: 'text/plain', storagePath: 'storage/tz-sample.txt' } });
  console.log('Seed completed', { admin: admin.email, buyer: buyer.email });
}

main().finally(() => prisma.$disconnect());
