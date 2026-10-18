export type TransactionDto = {
  id: string;
  amountCents: number;
  categoryId: string;
  note: string;
  occurredAt: number;
  updatedAt: number;
  deletedAt: number | null;
};
