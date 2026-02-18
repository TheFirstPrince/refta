import { addDays, format } from 'date-fns';
import { create } from 'zustand';
import type { SlotStatus } from '../types';

type View = 'day' | 'week';

type FilterState = {
  view: View;
  from: string;
  to: string;
  assigneeId?: string;
  companyId?: string;
  status?: SlotStatus;
  q?: string;
  set: (patch: Partial<FilterState>) => void;
};

const today = format(new Date(), 'yyyy-MM-dd');

export const useFilterStore = create<FilterState>((set) => ({
  view: 'day',
  from: today,
  to: today,
  set: (patch) =>
    set((state) => {
      const next = { ...state, ...patch };
      if (patch.view === 'day') next.to = next.from;
      if (patch.view === 'week') next.to = format(addDays(new Date(next.from), 6), 'yyyy-MM-dd');
      return next;
    })
}));
