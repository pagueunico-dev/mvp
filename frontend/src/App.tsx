import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import type { Account, Payment, User } from './api';
import * as api from './api';
import './App.css';

function money(n: string): string {
  return Number(n).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function LoginScreen({
  onLoggedIn,
  banner,
}: {
  onLoggedIn: (u: User) => void;
  banner?: string | null;
}) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const u = await api.login(username.trim(), password);
      onLoggedIn(u);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page login-wrap">
      <div className="card login-card">
        <h1 className="login-title">Pague Unico</h1>
        <p className="muted small">
          Entre com usuario e senha. Padrao no primeiro acesso: admin / admin
        </p>
        {banner && <div className="banner err">{banner}</div>}
        {err && <div className="banner err">{err}</div>}
        <form onSubmit={onSubmit} className="login-form">
          <label className="field">
            <span>Usuario</span>
            <input
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" className="btn primary wide" disabled={busy}>
            {busy ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [a, p] = await Promise.all([
      api.listAccounts(),
      api.listPayments(),
    ]);
    setAccounts(a);
    setPayments(p);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const totalOpen = useMemo(
    () => accounts.reduce((s, a) => s + parseFloat(a.amount), 0),
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
    if (selected.size === 0) return;
    setErr(null);
    try {
      await api.consolidate([...selected]);
      setSelected(new Set());
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const onSimulatePay = async (id: string) => {
    setErr(null);
    try {
      await api.simulatePay(id);
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const onMockMulti = async () => {
    setErr(null);
    try {
      await api.mockMulti(3, ['pending', 'paid', 'pending']);
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="page">
      <header className="header row-between">
        <div>
          <h1>Pague Unico</h1>
          <p className="muted">
            {user.name} ({user.role}) · boleto unico mock
          </p>
        </div>
        <button type="button" className="btn secondary" onClick={onLogout}>
          Sair
        </button>
      </header>

      {err && <div className="banner err">{err}</div>}

      <section className="card">
        <h2>Resumo</h2>
        <p>
          Contas: <strong>{accounts.length}</strong>
        </p>
        <p>
          Soma: <strong>{money(totalOpen.toFixed(2))}</strong>
        </p>
        <p>
          Pagamentos: <strong>{payments.length}</strong>
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
          Selecione contas e gere um boleto unico consolidado.
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
          Gerar boleto unico ({selected.size} conta(s))
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

export default function App() {
  const [boot, setBoot] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [bootErr, setBootErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!api.getStoredToken()) {
        if (!cancelled) setBoot(false);
        return;
      }
      try {
        const u = await api.me();
        if (!cancelled) setUser(u);
      } catch {
        if (!cancelled) {
          api.logout();
          setBootErr(
            'Sessao invalida ou API indisponivel. Entre novamente.',
          );
        }
      } finally {
        if (!cancelled) setBoot(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onLogout = () => {
    api.logout();
    setUser(null);
    setBootErr(null);
  };

  if (boot) return <p className="page">Carregando...</p>;

  if (!user) {
    return (
      <LoginScreen
        banner={bootErr}
        onLoggedIn={(u) => {
          setUser(u);
          setBootErr(null);
        }}
      />
    );
  }

  return <Dashboard user={user} onLogout={onLogout} />;
}
