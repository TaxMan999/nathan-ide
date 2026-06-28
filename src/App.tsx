import { useCallback, useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { TopBar } from "./components/TopBar";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { Output } from "./components/Output";
import { Language, LANGUAGE_CONFIG } from "./types";
import { useCodeRunner } from "./hooks/useCodeRunner";
import { useProjects } from "./hooks/useProjects";

const HTML_DEBOUNCE_MS = 300;

export default function App() {
  const {
    projects,
    currentProject,
    createProject,
    renameProject,
    deleteProject,
    switchProject,
    updateCurrentCode,
    updateCurrentLanguage,
  } = useProjects();

  const [htmlSrc, setHtmlSrc] = useState(currentProject.code);
  const htmlDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNarrow = useWindowWidth() < 768;

  const { status, stdout, stderr, run, clear } = useCodeRunner();

  // Sync htmlSrc when the active project changes (e.g. switching projects)
  useEffect(() => {
    if (currentProject.language === "html") {
      setHtmlSrc(currentProject.code);
    }
  }, [currentProject.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCodeChange = useCallback(
    (value: string) => {
      updateCurrentCode(value);
      if (currentProject.language === "html") {
        if (htmlDebounceRef.current) clearTimeout(htmlDebounceRef.current);
        htmlDebounceRef.current = setTimeout(() => setHtmlSrc(value), HTML_DEBOUNCE_MS);
      }
    },
    [currentProject.language, updateCurrentCode]
  );

  const handleLanguageChange = useCallback(
    (next: Language) => {
      const isTemplate =
        currentProject.code.trim() === LANGUAGE_CONFIG[currentProject.language].template.trim();
      if (!isTemplate) {
        const confirmed = window.confirm(
          `Switch to ${LANGUAGE_CONFIG[next].label}? Your current code will be replaced with a starter template.`
        );
        if (!confirmed) return;
      }
      updateCurrentLanguage(next);
      if (next === "html") setHtmlSrc(LANGUAGE_CONFIG["html"].template);
      clear();
    },
    [currentProject.code, currentProject.language, updateCurrentLanguage, clear]
  );

  const handleSwitchProject = useCallback(
    (id: string) => {
      switchProject(id);
      clear();
    },
    [switchProject, clear]
  );

  const handleRun = useCallback(() => {
    run(currentProject.code, currentProject.language);
  }, [currentProject.code, currentProject.language, run]);

  return (
    <div className="flex flex-col h-full">
      <TopBar
        projectName={currentProject.name}
        language={currentProject.language}
        onLanguageChange={handleLanguageChange}
        onRun={handleRun}
        isRunning={status === "running"}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          projects={projects}
          currentId={currentProject.id}
          onSwitch={handleSwitchProject}
          onCreate={createProject}
          onRename={renameProject}
          onDelete={deleteProject}
        />

        <PanelGroup
          direction={isNarrow ? "vertical" : "horizontal"}
          className="flex-1 overflow-hidden"
        >
          <Panel defaultSize={55} minSize={20}>
            <Editor
              code={currentProject.code}
              language={currentProject.language}
              onChange={handleCodeChange}
            />
          </Panel>

          <PanelResizeHandle
            className={[
              "bg-zinc-800 hover:bg-zinc-600 active:bg-emerald-600 transition-colors",
              isNarrow ? "h-1.5 w-full cursor-row-resize" : "w-1.5 h-full cursor-col-resize",
            ].join(" ")}
          />

          <Panel defaultSize={45} minSize={15}>
            <Output
              language={currentProject.language}
              htmlSrc={htmlSrc}
              status={status}
              stdout={stdout}
              stderr={stderr}
              onClear={clear}
            />
          </Panel>
        </PanelGroup>
      </div>
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
