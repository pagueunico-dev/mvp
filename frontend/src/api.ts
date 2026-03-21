const base = '/api';

export type User = { id: string; email: string; name: string };

export type Account = {
  id: string;
  title: string;
  amount: string;
  dueDate: string;
};

export type Payment = {
  id: string;
  totalAmount: string;
  status: string;
  mockBoletoLine: string | null;
  accountIds: string[];
};

async function j<T>(r: Response): Promise<T> {
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || r.statusText);
  }
  return r.json() as Promise<T>;
}

export async function getDemoUser(): Promise<User> {
  return j(await fetch(`${base}/users/demo`));
}

export async function listAccounts(userId: string): Promise<Account[]> {
  return j(
    await fetch(`${base}/accounts?userId=${encodeURIComponent(userId)}`),
  );
}

export async function listPayments(userId: string): Promise<Payment[]> {
  return j(
    await fetch(`${base}/payments?userId=${encodeURIComponent(userId)}`),
  );
}

export async function consolidate(
  userId: string,
  accountIds: string[],
): Promise<Payment> {
  return j(
    await fetch(`${base}/payments/consolidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, accountIds }),
    }),
  );
}

export async function simulatePay(
  paymentId: string,
  userId: string,
): Promise<Payment> {
  return j(
    await fetch(
      `${base}/payments/${encodeURIComponent(paymentId)}/simulate-pay?userId=${encodeURIComponent(userId)}`,
      { method: 'POST' },
    ),
  );
}

export async function mockMulti(
  userId: string,
  count?: number,
  statuses?: ('paid' | 'pending')[],
): Promise<Payment[]> {
  return j(
    await fetch(`${base}/payments/mock-multi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, count, statuses }),
    }),
  );
}
