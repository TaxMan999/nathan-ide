import { useCallback, useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { TopBar } from "./components/TopBar";
import { Editor } from "./components/Editor";
import { Output } from "./components/Output";
import { Language, LANGUAGE_CONFIG } from "./types";
import { useCodeRunner } from "./hooks/useCodeRunner";

const HTML_DEBOUNCE_MS = 300;

export default function App() {
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(LANGUAGE_CONFIG["python"].template);
  const [htmlSrc, setHtmlSrc] = useState(LANGUAGE_CONFIG["html"].template);
  const htmlDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNarrow = useWindowWidth() < 768;

  const { status, stdout, stderr, run, clear } = useCodeRunner();

  const handleCodeChange = useCallback(
    (value: string) => {
      setCode(value);
      if (language === "html") {
        if (htmlDebounceRef.current) clearTimeout(htmlDebounceRef.current);
        htmlDebounceRef.current = setTimeout(() => setHtmlSrc(value), HTML_DEBOUNCE_MS);
      }
    },
    [language]
  );

  const handleLanguageChange = useCallback(
    (next: Language) => {
      const template = LANGUAGE_CONFIG[next].template;
      if (code.trim() !== "" && code.trim() !== LANGUAGE_CONFIG[language].template.trim()) {
        const confirmed = window.confirm(
          `Switch to ${LANGUAGE_CONFIG[next].label}? Your current code will be replaced with a starter template.`
        );
        if (!confirmed) return;
      }
      setLanguage(next);
      setCode(template);
      if (next === "html") setHtmlSrc(template);
      clear();
    },
    [code, language, clear]
  );

  const handleRun = useCallback(() => {
    run(code, language);
  }, [code, language, run]);

  return (
    <div className="flex flex-col h-full">
      <TopBar
        language={language}
        onLanguageChange={handleLanguageChange}
        onRun={handleRun}
        isRunning={status === "running"}
      />

      <PanelGroup
        direction={isNarrow ? "vertical" : "horizontal"}
        className="flex-1 overflow-hidden"
      >
        <Panel defaultSize={55} minSize={20}>
          <Editor code={code} language={language} onChange={handleCodeChange} />
        </Panel>

        <PanelResizeHandle className={[
          "bg-zinc-800 hover:bg-zinc-600 active:bg-emerald-600 transition-colors",
          isNarrow ? "h-1.5 w-full cursor-row-resize" : "w-1.5 h-full cursor-col-resize",
        ].join(" ")} />

        <Panel defaultSize={45} minSize={15}>
          <Output
            language={language}
            htmlSrc={htmlSrc}
            status={status}
            stdout={stdout}
            stderr={stderr}
            onClear={clear}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}
