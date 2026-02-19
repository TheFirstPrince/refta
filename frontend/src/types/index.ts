export type Role = 'admin' | 'manager' | 'assignee';
export type SlotStatus = 'planned' | 'done' | 'canceled';

export type User = { id: string; fullName: string; email: string; role: Role; active: boolean };
export type Company = { id: string; name: string };
export type Contact = { id: string; companyId: string; name: string; phone?: string; email?: string };

export type Tender = {
  id: string;
  tenderNo: string;
  companyId: string;
  contactId?: string;
  comment?: string;
  company?: Company;
  contact?: Contact;
  _count?: { slots: number };
};

export type Slot = {
  id: string;
  tenderId: string;
  assigneeId: string;
  startAt: string;
  endAt: string;
  durationMin: number;
  comment?: string;
  status: SlotStatus;
  tender: Tender & { company: Company; contact?: Contact };
  assignee: User;
};
