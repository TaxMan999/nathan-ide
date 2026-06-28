import { Language } from "../types";

type RunStatus = "idle" | "running" | "done" | "error";

interface OutputProps {
  language: Language;
  htmlSrc: string;
  status: RunStatus;
  stdout: string;
  stderr: string;
  onClear: () => void;
}

export function Output({ language, htmlSrc, status, stdout, stderr, onClear }: OutputProps) {
  if (language === "html") {
    return (
      <div className="h-full w-full bg-white">
        <iframe
          srcDoc={htmlSrc}
          sandbox="allow-scripts"
          className="h-full w-full border-0"
          title="HTML preview"
        />
      </div>
    );
  }

  const isEmpty = status === "idle" && !stdout && !stderr;

  return (
    <div className="h-full w-full flex flex-col bg-zinc-950">
      {/* Output toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">Output</span>
        {!isEmpty && (
          <button
            onClick={onClear}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 relative">
        {status === "running" && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 z-10">
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Running…
            </div>
          </div>
        )}

        {isEmpty ? (
          <p className="text-zinc-600 text-sm">
            Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 text-xs">▶ Run</kbd> or{" "}
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 text-xs">Ctrl+Enter</kbd> to run your code.
          </p>
        ) : (
          <>
            {stdout && (
              <pre className="text-zinc-100 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                {stdout}
              </pre>
            )}
            {stderr && (
              <pre className="text-red-400 text-sm font-mono whitespace-pre-wrap leading-relaxed mt-2">
                {stderr}
              </pre>
            )}
          </>
        )}
      </div>
    </div>
  );
}
