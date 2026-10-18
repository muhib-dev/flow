import { count } from 'drizzle-orm';

import { currentMonth } from '@/lib/format';

import type { Db } from './client';
import { budgets, categories } from './schema';

const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food', icon: 'fork.knife', color: '#F59E0B', limitCents: 400_00 },
  { id: 'transport', name: 'Transport', icon: 'car.fill', color: '#3B82F6', limitCents: 150_00 },
  { id: 'shopping', name: 'Shopping', icon: 'bag.fill', color: '#EC4899', limitCents: 250_00 },
  { id: 'bills', name: 'Bills', icon: 'doc.text.fill', color: '#8B5CF6', limitCents: 600_00 },
  { id: 'fun', name: 'Fun', icon: 'gamecontroller.fill', color: '#10B981', limitCents: 120_00 },
  {
    id: 'other',
    name: 'Other',
    icon: 'ellipsis.circle.fill',
    color: '#6B7280',
    limitCents: 100_00,
  },
] as const;

/** Inserts default categories and this month's budgets on first launch. */
export async function seedDefaults(db: Db) {
  const [{ value }] = await db.select({ value: count() }).from(categories);
  if (value > 0) return;

  const month = currentMonth();
  await db.transaction(async (tx) => {
    await tx
      .insert(categories)
      .values(
        DEFAULT_CATEGORIES.map(({ limitCents: _limit, ...c }, sortOrder) => ({ ...c, sortOrder })),
      );
    await tx.insert(budgets).values(
      DEFAULT_CATEGORIES.map((c) => ({
        id: `${c.id}-${month}`,
        categoryId: c.id,
        month,
        limitCents: c.limitCents,
      })),
    );
  });
}
