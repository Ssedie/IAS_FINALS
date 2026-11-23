export function txLabel(tx) {
  if (tx.type === 'CASH_IN') return 'Cash in';
  if (tx.type === 'BILL_PAYMENT') return 'Bill payment';
  return tx.direction === 'in' ? 'Received' : 'Sent';
}