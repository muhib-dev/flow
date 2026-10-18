import { randomUUID } from 'expo-crypto';
import { router } from 'expo-router';

import { Screen } from '@/design-system';

import { useSaveTransaction } from '../hooks/use-transaction-mutations';
import { TransactionForm } from './transaction-form';

export function AddTransactionScreen() {
  const save = useSaveTransaction();

  return (
    <Screen scroll>
      <TransactionForm
        submitLabel="Add expense"
        onSubmit={(values) => {
          // The client-generated id makes server writes idempotent across retries.
          save.mutate({ ...values, id: randomUUID(), occurredAt: Date.now() });
          router.back();
        }}
      />
    </Screen>
  );
}
