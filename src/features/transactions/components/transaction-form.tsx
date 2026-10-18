import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button, ErrorState, LoadingState, Text, TextField } from '@/design-system';
import { parseAmountToCents } from '@/lib/format';

import type { TransactionInput } from '../api/transactions-repo';
import { useCategories } from '../hooks/use-transactions';
import { CategoryChips } from './category-chips';

type TransactionFormProps = {
  initial?: Partial<Omit<TransactionInput, 'id'>>;
  submitLabel: string;
  onSubmit: (values: Omit<TransactionInput, 'id' | 'occurredAt'>) => void;
};

export function TransactionForm({ initial, submitLabel, onSubmit }: TransactionFormProps) {
  const categories = useCategories();
  const [amount, setAmount] = useState(
    initial?.amountCents ? (initial.amountCents / 100).toFixed(2) : '',
  );
  const [categoryId, setCategoryId] = useState<string | null>(initial?.categoryId ?? null);
  const [note, setNote] = useState(initial?.note ?? '');
  const [submitted, setSubmitted] = useState(false);

  if (categories.isPending) return <LoadingState />;
  if (categories.isError) {
    return (
      <ErrorState message={categories.error.message} onRetry={() => void categories.refetch()} />
    );
  }

  const amountCents = parseAmountToCents(amount);
  const selectedCategory = categoryId ?? categories.data[0]?.id ?? null;

  const submit = () => {
    setSubmitted(true);
    if (amountCents === null || selectedCategory === null) return;
    onSubmit({ amountCents, categoryId: selectedCategory, note: note.trim() });
  };

  return (
    <View style={styles.form}>
      <TextField
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0.00"
        autoFocus
        error={submitted && amountCents === null ? 'Enter an amount greater than zero' : null}
      />
      <View style={styles.field}>
        <Text variant="label">Category</Text>
        <CategoryChips
          categories={categories.data}
          selectedId={selectedCategory}
          onSelect={setCategoryId}
        />
      </View>
      <TextField
        label="Note"
        value={note}
        onChangeText={setNote}
        placeholder="Coffee with Sam"
        maxLength={120}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <Button label={submitLabel} onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  form: { gap: theme.space.xl, paddingTop: theme.space.lg },
  field: { gap: theme.space.sm },
}));
