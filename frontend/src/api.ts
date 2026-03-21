const base = '/api';
const TOKEN_KEY = 'mvp_token';

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

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

export function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

function authHeaders(json = false): HeadersInit {
  const t = getStoredToken();
  const h: Record<string, string> = {};
  if (t) h.Authorization = `Bearer ${t}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

async function j<T>(r: Response): Promise<T> {
  if (r.status === 401) setToken(null);
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || r.statusText);
  }
  return r.json() as Promise<T>;
}

export async function login(username: string, password: string): Promise<User> {
  const r = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await j<{ access_token: string; user: User }>(r);
  setToken(data.access_token);
  return data.user;
}

export async function me(): Promise<User> {
  return j(await fetch(`${base}/users/me`, { headers: authHeaders() }));
}

export function logout(): void {
  setToken(null);
}

export async function listAccounts(): Promise<Account[]> {
  return j(await fetch(`${base}/accounts`, { headers: authHeaders() }));
}

export async function listPayments(): Promise<Payment[]> {
  return j(await fetch(`${base}/payments`, { headers: authHeaders() }));
}

export async function consolidate(accountIds: string[]): Promise<Payment> {
  return j(
    await fetch(`${base}/payments/consolidate`, {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ accountIds }),
    }),
  );
}

export async function simulatePay(paymentId: string): Promise<Payment> {
  return j(
    await fetch(
      `${base}/payments/${encodeURIComponent(paymentId)}/simulate-pay`,
      { method: 'POST', headers: authHeaders() },
    ),
  );
}

export async function mockMulti(
  count?: number,
  statuses?: ('paid' | 'pending')[],
): Promise<Payment[]> {
  return j(
    await fetch(`${base}/payments/mock-multi`, {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ count, statuses }),
    }),
  );
}
