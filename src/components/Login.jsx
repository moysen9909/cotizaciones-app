import { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';

const CREDENTIALS = {
  mitch2026: 'user',
  manager2024: 'manager',
};

export default function Login({ onLogin, t }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const role = CREDENTIALS[password];
    if (role) {
      onLogin(role);
    } else {
      setError(t.invalidPassword);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-noir to-navy flex items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-mist/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-navy/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-mist/3 rounded-full blur-3xl" />
      </div>

      <div className="relative bg-noir/60 backdrop-blur-2xl rounded-3xl p-10 w-full max-w-sm shadow-2xl shadow-black/30 border border-ivory/8">
        <div className="flex flex-col items-center mb-10">
          <img src="/logo.png" alt="Multibolsas" className="h-18 mb-6 object-contain drop-shadow-lg" />
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-mist/30 to-transparent mb-4" />
          <p className="text-mist/60 text-sm font-light tracking-wide">{t.login}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-[10px] text-mist/40 uppercase tracking-[0.2em] font-medium mb-2 ml-1">
              {t.password}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mist/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 bg-navy/40 border border-ivory/10 rounded-xl text-ivory placeholder-mist/30 focus:outline-none focus:ring-2 focus:ring-mist/20 focus:border-ivory/20 transition-all"
                autoFocus
              />
            </div>
          </div>
          {error && (
            <div className="mb-5 px-4 py-2.5 bg-red-500/10 border border-red-400/20 rounded-xl">
              <p className="text-red-400 text-sm text-center font-medium">{error}</p>
            </div>
          )}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-mist/20 to-mist/10 hover:from-mist/30 hover:to-mist/20 text-ivory rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all border border-mist/20 hover:border-mist/30 shadow-lg shadow-black/10 hover:shadow-xl"
          >
            <LogIn className="w-4 h-4" />
            {t.enter}
          </button>
        </form>
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] text-mist/25 uppercase tracking-[0.2em]">
            <div className="w-6 h-px bg-mist/10" />
            Multibolsas Plásticas
            <div className="w-6 h-px bg-mist/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
