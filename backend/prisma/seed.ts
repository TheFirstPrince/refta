import { PrismaClient, Role, SlotStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function makeUtc(date: string, time: string): Date {
  return new Date(`${date}T${time}:00+03:00`);
}

async function main() {
  await prisma.slot.deleteMany();
  await prisma.tender.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({ data: { fullName: 'Администратор', email: 'admin@refta.local', passwordHash: hash, role: Role.admin } });
  const manager = await prisma.user.create({ data: { fullName: 'Менеджер', email: 'manager@refta.local', passwordHash: hash, role: Role.manager } });
  const assignees = await Promise.all([
    prisma.user.create({ data: { fullName: 'Алексей Орлов', email: 'assignee1@refta.local', passwordHash: hash, role: Role.assignee } }),
    prisma.user.create({ data: { fullName: 'Ольга Миронова', email: 'assignee2@refta.local', passwordHash: hash, role: Role.assignee } }),
    prisma.user.create({ data: { fullName: 'Роман Фадеев', email: 'assignee3@refta.local', passwordHash: hash, role: Role.assignee } }),
    prisma.user.create({ data: { fullName: 'Наталья Соколова', email: 'assignee4@refta.local', passwordHash: hash, role: Role.assignee } })
  ]);

  const companyA = await prisma.company.create({ data: { name: 'ООО ТехСтрой' } });
  const companyB = await prisma.company.create({ data: { name: 'АО ПромИнжиниринг' } });

  const contactA = await prisma.contact.create({ data: { companyId: companyA.id, name: 'Иван Петров', email: 'petrov@tech.local', phone: '+79001112233' } });
  const contactB = await prisma.contact.create({ data: { companyId: companyB.id, name: 'Мария Сергеева', email: 'sergeeva@prom.local' } });

  const tender1 = await prisma.tender.create({ data: { tenderNo: 'TND-2026-014', companyId: companyA.id, contactId: contactA.id, comment: 'Поставка оборудования' } });
  const tender2 = await prisma.tender.create({ data: { tenderNo: 'TND-2026-021', companyId: companyB.id, contactId: contactB.id, comment: 'Строительно-монтажные работы' } });
  const tender3 = await prisma.tender.create({ data: { tenderNo: 'TND-2026-042', companyId: companyA.id, comment: 'Сервисный контракт' } });

  await prisma.slot.createMany({
    data: [
      {
        tenderId: tender1.id,
        assigneeId: assignees[0].id,
        startAt: makeUtc('2026-02-20', '10:00'),
        endAt: makeUtc('2026-02-20', '10:45'),
        durationMin: 45,
        status: SlotStatus.planned,
        createdById: manager.id,
        comment: 'Первичный разбор'
      },
      {
        tenderId: tender2.id,
        assigneeId: assignees[1].id,
        startAt: makeUtc('2026-02-20', '11:00'),
        endAt: makeUtc('2026-02-20', '12:00'),
        durationMin: 60,
        status: SlotStatus.planned,
        createdById: admin.id
      },
      {
        tenderId: tender3.id,
        assigneeId: assignees[0].id,
        startAt: makeUtc('2026-02-21', '09:30'),
        endAt: makeUtc('2026-02-21', '10:00'),
        durationMin: 30,
        status: SlotStatus.done,
        createdById: manager.id
      }
    ]
  });
}

main().finally(async () => prisma.$disconnect());
