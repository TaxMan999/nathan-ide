import { useEffect } from "react";
import { Language, LANGUAGE_CONFIG } from "../types";

interface TopBarProps {
  projectName: string;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onRun: () => void;
  isRunning: boolean;
  userEmail?: string;
  onSignOut?: () => void;
}

export function TopBar({
  projectName,
  language,
  onLanguageChange,
  onRun,
  isRunning,
  userEmail,
  onSignOut,
}: TopBarProps) {
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning && language !== "html") onRun();
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isRunning, language, onRun]);

  const canRun = language !== "html" && !isRunning;

  return (
    <div className="flex items-center gap-3 px-4 h-12 bg-zinc-900 border-b border-zinc-800 shrink-0">
      <span className="text-zinc-500 text-sm select-none hidden md:inline">Nathan's IDE</span>

      <span className="text-zinc-100 font-semibold text-sm truncate max-w-[180px]" title={projectName}>
        {projectName}
      </span>

      <div className="flex-1" />

      {/* Language selector */}
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value as Language)}
        className="bg-zinc-800 text-zinc-200 text-sm px-3 py-1.5 rounded border border-zinc-700 focus:outline-none focus:border-zinc-500 cursor-pointer"
      >
        {(Object.keys(LANGUAGE_CONFIG) as Language[]).map((lang) => (
          <option key={lang} value={lang}>
            {LANGUAGE_CONFIG[lang].label}
          </option>
        ))}
      </select>

      {/* Run button */}
      <button
        onClick={onRun}
        disabled={!canRun}
        title={language === "html" ? "HTML previews automatically" : "Run (Ctrl+Enter)"}
        className={[
          "flex items-center gap-2 px-4 py-1.5 rounded text-sm font-semibold transition-colors",
          canRun
            ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            : "bg-zinc-700 text-zinc-500 cursor-not-allowed",
        ].join(" ")}
      >
        {isRunning ? (
          <>
            <Spinner />
            Running…
          </>
        ) : (
          <>▶ Run</>
        )}
      </button>

      {/* User / sign out */}
      {userEmail && onSignOut && (
        <div className="flex items-center gap-2 pl-1 border-l border-zinc-700">
          <span
            className="hidden lg:block text-xs text-zinc-500 truncate max-w-[140px]"
            title={userEmail}
          >
            {userEmail}
          </span>
          <button
            onClick={onSignOut}
            title="Sign out"
            className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors px-2 py-1 rounded hover:bg-zinc-800"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-3.5 w-3.5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}
