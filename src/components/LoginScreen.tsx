import { useState } from "react";

interface LoginScreenProps {
  onSignIn: (email: string) => void;
  sent: boolean;
  error: string | null;
  onTryAgain: () => void;
}

export function LoginScreen({ onSignIn, sent, error, onTryAgain }: LoginScreenProps) {
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) onSignIn(email.trim());
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-950 px-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="text-5xl">📬</div>
          <h1 className="text-xl font-bold text-zinc-100">Check your email!</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            We sent a magic link to <strong className="text-zinc-200">{email}</strong>.
            Click the link in the email to sign in — no password needed!
          </p>
          <button
            onClick={onTryAgain}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-950 px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-zinc-100">Nathan's IDE</h1>
          <p className="text-zinc-400 text-sm">Sign in to save your projects across devices</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            className="w-full bg-zinc-800 text-zinc-100 placeholder-zinc-500 px-4 py-3 rounded-lg border border-zinc-700 focus:outline-none focus:border-emerald-500 text-sm"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={!email.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
          >
            Send magic link ✉️
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600">
          We'll email you a link — no password needed
        </p>
      </div>
    </div>
  );
}
