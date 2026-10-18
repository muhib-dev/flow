import { MenuView } from '@expo/ui/community/menu';
import type { ReactNode } from 'react';

import { currentMonth, formatMonth, shiftMonth } from '@/lib/format';

const MONTHS_SHOWN = 6;

/** Native menu of the last six months around a custom trigger. */
export function MonthMenu({
  month,
  onChange,
  children,
}: {
  month: string;
  onChange: (month: string) => void;
  children: ReactNode;
}) {
  const latest = currentMonth();
  const months = Array.from({ length: MONTHS_SHOWN }, (_, i) => shiftMonth(latest, -i));
  return (
    <MenuView
      title="Show month"
      actions={months.map((m) => ({
        id: m,
        title: formatMonth(m),
        state: m === month ? 'on' : 'off',
      }))}
      onPressAction={({ nativeEvent }) => onChange(nativeEvent.event)}
    >
      {children}
    </MenuView>
  );
}
