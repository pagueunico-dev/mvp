import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Account, Payment, User } from './api';
import * as api from './api';
import './App.css';

function money(n: string): string {
  return Number(n).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (u: User) => {
    const [a, p] = await Promise.all([
      api.listAccounts(u.id),
      api.listPayments(u.id),
    ]);
    setAccounts(a);
    setPayments(p);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await api.getDemoUser();
        if (cancelled) return;
        setUser(u);
        await refresh(u);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const totalOpen = useMemo(
    () =>
      accounts.reduce((s, a) => s + parseFloat(a.amount), 0),
    [accounts],
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onConsolidate = async () => {
    if (!user || selected.size === 0) return;
    setErr(null);
    try {
      await api.consolidate(user.id, [...selected]);
      setSelected(new Set());
      await refresh(user);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const onSimulatePay = async (id: string) => {
    if (!user) return;
    setErr(null);
    try {
      await api.simulatePay(id, user.id);
      await refresh(user);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const onMockMulti = async () => {
    if (!user) return;
    setErr(null);
    try {
      await api.mockMulti(user.id, 3, ['pending', 'paid', 'pending']);
      await refresh(user);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  if (loading) return <p className="page">Carregando…</p>;
  if (!user) return <p className="page">Sem usuário demo.</p>;

  return (
    <div className="page">
      <header className="header">
        <h1>Pague Único</h1>
        <p className="muted">
          {user.name} · consolide contas em um boleto (mock)
        </p>
      </header>

      {err && <div className="banner err">{err}</div>}

      <section className="card">
        <h2>Resumo</h2>
        <p>
          Contas abertas: <strong>{accounts.length}</strong>
        </p>
        <p>
          Soma das contas: <strong>{money(totalOpen.toFixed(2))}</strong>
        </p>
        <p>
          Pagamentos registrados: <strong>{payments.length}</strong>
        </p>
      </section>

      <section className="card">
        <div className="row-between">
          <h2>Contas</h2>
          <button type="button" className="btn secondary" onClick={onMockMulti}>
            Gerar 3 pagamentos mock
          </button>
        </div>
        <p className="muted small">
          Selecione as contas e gere um boleto único consolidado.
        </p>
        <ul className="list">
          {accounts.map((a) => (
            <li key={a.id} className="list-item">
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={selected.has(a.id)}
                  onChange={() => toggle(a.id)}
                />
                <span>
                  <strong>{a.title}</strong>
                  <span className="muted"> · venc. {a.dueDate}</span>
                </span>
              </label>
              <span className="amount">{money(a.amount)}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn primary"
          disabled={selected.size === 0}
          onClick={onConsolidate}
        >
          Gerar boleto único ({selected.size} conta(s))
        </button>
      </section>

      <section className="card">
        <h2>Pagamentos</h2>
        {payments.length === 0 ? (
          <p className="muted">Nenhum pagamento ainda.</p>
        ) : (
          <ul className="list">
            {payments.map((p) => (
              <li key={p.id} className="pay-item">
                <div>
                  <strong>{money(p.totalAmount)}</strong>
                  <span className={`pill ${p.status}`}>{p.status}</span>
                </div>
                {p.mockBoletoLine && (
                  <code className="boleto">{p.mockBoletoLine}</code>
                )}
                {p.status === 'pending' && (
                  <button
                    type="button"
                    className="btn small"
                    onClick={() => onSimulatePay(p.id)}
                  >
                    Simular pagamento
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
