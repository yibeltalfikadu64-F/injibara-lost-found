
import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await onLogin(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to sign in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <style>{`
        * { box-sizing: border-box; }
        .login-input:focus {
          outline: 3px solid rgba(37,99,235,.12);
          border-color: #2563eb !important;
        }
        .login-button:hover:not(:disabled) {
          background: #1d4ed8 !important;
        }
        @media(max-width:700px) {
          .login-panel { grid-template-columns: 1fr !important; }
          .login-brand-panel { display: none !important; }
        }
      `}</style>

      <section className="login-panel" style={styles.panel}>
        <div className="login-brand-panel" style={styles.brandPanel}>
          <div style={styles.logo}>I</div>
          <p style={styles.eyebrow}>INJIBARA UNIVERSITY</p>
          <h1 style={styles.brandTitle}>Lost & Found</h1>
          <p style={styles.brandDescription}>
            A smarter way to report, discover, and recover belongings across
            the campus community.
          </p>
          <div style={styles.brandFooter}>
            Campus Lost & Found Administration
          </div>
        </div>

        <div style={styles.formPanel}>
          <div style={styles.formContent}>
            <div style={styles.mobileLogo}>I</div>
            <p style={styles.eyebrowLight}>ADMINISTRATION PORTAL</p>
            <h2 style={styles.title}>Welcome back</h2>
            <p style={styles.subtitle}>
              Sign in to manage campus lost and found activities.
            </p>

            {error && (
              <div role="alert" style={styles.error}>
                <span>⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={submit}>
              <label htmlFor="admin-email" style={styles.label}>Email address</label>
              <input
                id="admin-email"
                className="login-input"
                type="email"
                autoComplete="username"
                placeholder="admin@injibara.edu.et"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />

              <div style={styles.passwordHeading}>
                <label htmlFor="admin-password" style={styles.label}>
                  Password
                </label>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  id="admin-password"
                  className="login-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...styles.input, paddingRight: 75 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={styles.showPassword}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <button
                className="login-button"
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submit,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? 'Signing in...' : 'Sign in to dashboard'}
                {!loading && <span> →</span>}
              </button>
            </form>

            <p style={styles.securityNote}>
              🔒 Secure administrator access
            </p>
            <p style={styles.copyright}>
              © {new Date().getFullYear()} Injibara Campus Lost & Found
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: 24,
    background: '#f1f5f9',
    fontFamily: 'Inter, Arial, sans-serif',
  },
  panel: {
    width: '100%',
    maxWidth: 1000,
    minHeight: 620,
    display: 'grid',
    gridTemplateColumns: '0.9fr 1.1fr',
    background: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 25px 70px rgba(15,23,42,.12)',
  },
  brandPanel: {
    padding: 48,
    background: 'linear-gradient(145deg,#0f172a,#1e3a8a)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 16,
    background: '#2563eb',
    display: 'grid',
    placeItems: 'center',
    fontSize: 30,
    fontWeight: 900,
    marginBottom: 40,
  },
  eyebrow: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 2,
  },
  brandTitle: { fontSize: 42, lineHeight: 1.1, margin: '12px 0' },
  brandDescription: {
    color: '#cbd5e1',
    lineHeight: 1.8,
    fontSize: 14,
    maxWidth: 330,
  },
  brandFooter: {
    marginTop: 90,
    color: '#94a3b8',
    fontSize: 11,
  },
  formPanel: {
    display: 'grid',
    placeItems: 'center',
    padding: 35,
  },
  formContent: { width: '100%', maxWidth: 390 },
  mobileLogo: {
    display: 'none',
    width: 45,
    height: 45,
    background: '#2563eb',
    color: '#fff',
    borderRadius: 12,
    placeItems: 'center',
    fontSize: 23,
    fontWeight: 800,
    marginBottom: 24,
  },
  eyebrowLight: {
    color: '#2563eb',
    letterSpacing: 1.7,
    fontWeight: 800,
    fontSize: 10,
  },
  title: { fontSize: 30, color: '#0f172a', margin: '10px 0' },
  subtitle: { color: '#64748b', fontSize: 13, lineHeight: 1.6, marginBottom: 30 },
  label: {
    display: 'block',
    color: '#334155',
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
  },
  passwordHeading: { marginTop: 20 },
  input: {
    width: '100%',
    height: 47,
    padding: '0 13px',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    fontSize: 13,
    color: '#0f172a',
    background: '#fff',
  },
  showPassword: {
    position: 'absolute',
    right: 10,
    top: 12,
    border: 0,
    background: 'transparent',
    color: '#2563eb',
    fontWeight: 700,
    fontSize: 11,
    cursor: 'pointer',
  },
  submit: {
    width: '100%',
    height: 48,
    marginTop: 25,
    border: 0,
    borderRadius: 8,
    background: '#2563eb',
    color: '#fff',
    fontSize: 13,
    fontWeight: 800,
  },
  error: {
    padding: 12,
    borderRadius: 8,
    background: '#fef2f2',
    color: '#b91c1c',
    fontSize: 12,
    display: 'flex',
    gap: 9,
    marginBottom: 18,
  },
  securityNote: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 28,
  },
  copyright: {
    color: '#94a3b8',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 35,
  },
};
