import MonacoEditor from "@monaco-editor/react";
import { Language, LANGUAGE_CONFIG } from "../types";

interface EditorProps {
  code: string;
  language: Language;
  onChange: (value: string) => void;
}

export function Editor({ code, language, onChange }: EditorProps) {
  return (
    <div className="h-full w-full relative">
      <MonacoEditor
        height="100%"
        language={LANGUAGE_CONFIG[language].monacoLanguage}
        value={code}
        theme="vs-dark"
        onChange={(val) => onChange(val ?? "")}
        loading={<EditorSkeleton />}
        options={{
          fontSize: 15,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbersMinChars: 3,
          padding: { top: 12 },
          renderLineHighlight: "gutter",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          fontLigatures: true,
          tabSize: 4,
        }}
      />
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
      <span className="text-zinc-500 text-sm animate-pulse">Loading editor…</span>
    </div>
  );
}
