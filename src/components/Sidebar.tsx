import { useEffect, useRef, useState } from "react";
import { Language, LANGUAGE_CONFIG, Project } from "../types";

const LANG_STYLE: Record<Language, { dot: string; border: string; text: string; header: string }> = {
  python: {
    dot:    "bg-sky-400",
    border: "border-sky-500",
    text:   "text-sky-400",
    header: "text-sky-300",
  },
  cpp: {
    dot:    "bg-violet-400",
    border: "border-violet-500",
    text:   "text-violet-400",
    header: "text-violet-300",
  },
  java: {
    dot:    "bg-amber-400",
    border: "border-amber-500",
    text:   "text-amber-400",
    header: "text-amber-300",
  },
  html: {
    dot:    "bg-rose-400",
    border: "border-rose-500",
    text:   "text-rose-400",
    header: "text-rose-300",
  },
};

const LANGUAGE_ORDER: Language[] = ["python", "cpp", "java", "html"];

interface SidebarProps {
  projects: Project[];
  currentId: string;
  onSwitch: (id: string) => void;
  onCreate: () => string;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({ projects, currentId, onSwitch, onCreate, onRename, onDelete }: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<Language, boolean>>({
    python: false,
    cpp: false,
    java: false,
    html: false,
  });

  function handleCreate() {
    const newId = onCreate();
    setConfirmDeleteId(null);
    setTimeout(() => {
      setEditValue("New Project");
      setEditingId(newId);
    }, 50);
  }

  function startEdit(project: Project) {
    setConfirmDeleteId(null);
    setEditValue(project.name);
    setEditingId(project.id);
  }

  function commitEdit() {
    if (editingId) {
      onRename(editingId, editValue);
      setEditingId(null);
    }
  }

  function toggleCollapse(lang: Language) {
    setCollapsed((c) => ({ ...c, [lang]: !c[lang] }));
  }

  const grouped = LANGUAGE_ORDER.map((lang) => ({
    lang,
    projects: projects.filter((p) => p.language === lang),
  })).filter((g) => g.projects.length > 0);

  return (
    <div className="hidden md:flex w-48 shrink-0 flex-col bg-zinc-900 border-r border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800">
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Projects</span>
        <button
          onClick={handleCreate}
          title="New project"
          className="w-5 h-5 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors text-base leading-none"
        >
          +
        </button>
      </div>

      {/* Grouped project list */}
      <div className="flex-1 overflow-y-auto py-1">
        {grouped.map(({ lang, projects: group }) => {
          const style = LANG_STYLE[lang];
          const isOpen = !collapsed[lang];
          return (
            <div key={lang}>
              {/* Language folder header */}
              <button
                onClick={() => toggleCollapse(lang)}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 hover:bg-zinc-800/60 transition-colors group"
              >
                <span className={`text-zinc-500 group-hover:text-zinc-300 transition-colors text-xs`}>
                  {isOpen ? "▾" : "▸"}
                </span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                <span className={`text-xs font-semibold tracking-wide ${style.header} flex-1 text-left`}>
                  {LANGUAGE_CONFIG[lang].label}
                </span>
                <span className="text-xs text-zinc-600">{group.length}</span>
              </button>

              {/* Projects under this language */}
              {isOpen && (
                <div className={`border-l-2 ml-3 ${style.border}`}>
                  {group.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isActive={project.id === currentId}
                      isEditing={editingId === project.id}
                      editValue={editValue}
                      isConfirmingDelete={confirmDeleteId === project.id}
                      canDelete={projects.length > 1}
                      onSelect={() => {
                        if (editingId !== project.id) {
                          setConfirmDeleteId(null);
                          onSwitch(project.id);
                        }
                      }}
                      onDoubleClick={() => startEdit(project)}
                      onEditChange={setEditValue}
                      onEditCommit={commitEdit}
                      onEditCancel={() => setEditingId(null)}
                      onRequestDelete={() => {
                        setConfirmDeleteId(project.id);
                        setEditingId(null);
                      }}
                      onConfirmDelete={() => {
                        onDelete(project.id);
                        setConfirmDeleteId(null);
                      }}
                      onCancelDelete={() => setConfirmDeleteId(null)}
                      activeStyle={style}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ProjectItemProps {
  project: Project;
  isActive: boolean;
  isEditing: boolean;
  editValue: string;
  isConfirmingDelete: boolean;
  canDelete: boolean;
  activeStyle: { dot: string; border: string; text: string; header: string };
  onSelect: () => void;
  onDoubleClick: () => void;
  onEditChange: (v: string) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

function ProjectItem({
  project,
  isActive,
  isEditing,
  editValue,
  isConfirmingDelete,
  canDelete,
  activeStyle,
  onSelect,
  onDoubleClick,
  onEditChange,
  onEditCommit,
  onEditCancel,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: ProjectItemProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  if (isConfirmingDelete) {
    return (
      <div className="px-3 py-2 bg-zinc-800">
        <p className="text-xs text-zinc-300 mb-1.5 truncate">Delete &ldquo;{project.name}&rdquo;?</p>
        <div className="flex gap-1.5">
          <button
            onClick={onConfirmDelete}
            className="flex-1 text-xs py-0.5 rounded bg-red-600 hover:bg-red-500 text-white transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onCancelDelete}
            className="flex-1 text-xs py-0.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className={[
        "group flex items-center gap-1.5 pl-3 pr-2 py-1.5 cursor-pointer transition-colors",
        isActive
          ? `bg-zinc-800 ${activeStyle.text}`
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
      ].join(" ")}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEditCommit();
            if (e.key === "Escape") onEditCancel();
          }}
          onBlur={onEditCommit}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 min-w-0 bg-zinc-700 text-zinc-100 text-xs px-1.5 py-0.5 rounded outline-none focus:ring-1 focus:ring-emerald-500"
        />
      ) : (
        <span className="flex-1 min-w-0 text-xs truncate" title={project.name}>
          {project.name}
        </span>
      )}

      {!isEditing && canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRequestDelete();
          }}
          title="Delete project"
          className="opacity-0 group-hover:opacity-100 shrink-0 w-4 h-4 flex items-center justify-center rounded text-zinc-500 hover:text-red-400 transition-all"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 3h9M4 3V2h3v1M2 3l.5 7h6L9 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
