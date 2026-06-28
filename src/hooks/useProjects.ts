import { useCallback, useEffect, useRef, useState } from "react";
import { Language, LANGUAGE_CONFIG, Project } from "../types";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "nathan-ide";
const LAST_OPEN_KEY = (uid: string) => `nathan-ide-last-${uid}`;

interface StorageShape {
  projects: Project[];
  lastOpenId: string;
}

function makeProject(name: string, language: Language = "python"): Project {
  return {
    id: crypto.randomUUID(),
    name,
    language,
    code: LANGUAGE_CONFIG[language].template,
    updatedAt: Date.now(),
  };
}

function loadLocal(): StorageShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StorageShape;
      if (Array.isArray(parsed.projects) && parsed.projects.length) return parsed;
    }
  } catch {}
  const first = makeProject("My First Project");
  return { projects: [first], lastOpenId: first.id };
}

function saveLocal(projects: Project[], lastOpenId: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, lastOpenId }));
}

interface DbRow {
  id: string;
  user_id: string;
  name: string;
  language: string;
  code: string;
  updated_at: number;
}

function rowToProject(row: DbRow): Project {
  return { id: row.id, name: row.name, language: row.language as Language, code: row.code, updatedAt: row.updated_at };
}

function projectToRow(p: Project, userId: string): DbRow {
  return { id: p.id, user_id: userId, name: p.name, language: p.language, code: p.code, updated_at: p.updatedAt };
}

export function useProjects(userId?: string) {
  const [{ projects, currentId }, setState] = useState<{ projects: Project[]; currentId: string }>(() => {
    if (userId) return { projects: [], currentId: "" };
    const { projects, lastOpenId } = loadLocal();
    return { projects, currentId: lastOpenId };
  });

  const [syncState, setSyncState] = useState<"loading" | "ready">(userId ? "loading" : "ready");
  const codeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error || !data) {
        // fall back to localStorage on error
        const local = loadLocal();
        setState({ projects: local.projects, currentId: local.lastOpenId });
      } else if (data.length === 0) {
        // first login — migrate localStorage projects
        const local = loadLocal();
        const rows = local.projects.map((p) => projectToRow(p, userId));
        await supabase.from("projects").insert(rows);
        localStorage.setItem(LAST_OPEN_KEY(userId), local.lastOpenId);
        setState({ projects: local.projects, currentId: local.lastOpenId });
      } else {
        const loaded = (data as DbRow[]).map(rowToProject);
        const saved = localStorage.getItem(LAST_OPEN_KEY(userId));
        const validId = loaded.find((p) => p.id === saved) ? saved! : loaded[0].id;
        setState({ projects: loaded, currentId: validId });
      }

      setSyncState("ready");
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const currentProject = projects.find((p) => p.id === currentId) ?? projects[0];

  function update(next: Project[], nextId: string = currentId) {
    setState({ projects: next, currentId: nextId });
    if (!userId) {
      saveLocal(next, nextId);
    } else {
      localStorage.setItem(LAST_OPEN_KEY(userId), nextId);
    }
  }

  function upsert(project: Project) {
    if (!userId) return;
    supabase.from("projects").upsert(projectToRow(project, userId));
  }

  function upsertDebounced(project: Project) {
    if (!userId) return;
    if (codeDebounceRef.current) clearTimeout(codeDebounceRef.current);
    codeDebounceRef.current = setTimeout(() => upsert(project), 1500);
  }

  const createProject = useCallback((): string => {
    const p = makeProject("New Project");
    const next = [...projects, p];
    update(next, p.id);
    upsert(p);
    return p.id;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, currentId, userId]);

  const renameProject = useCallback((id: string, name: string) => {
    const next = projects.map((p) =>
      p.id === id ? { ...p, name: name.trim() || p.name, updatedAt: Date.now() } : p
    );
    update(next);
    const changed = next.find((p) => p.id === id);
    if (changed) upsert(changed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, currentId, userId]);

  const deleteProject = useCallback((id: string) => {
    if (projects.length === 1) return;
    const next = projects.filter((p) => p.id !== id);
    const nextId = id === currentId ? next[next.length - 1].id : currentId;
    update(next, nextId);
    if (userId) supabase.from("projects").delete().eq("id", id).eq("user_id", userId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, currentId, userId]);

  const switchProject = useCallback((id: string) => {
    setState((s) => ({ ...s, currentId: id }));
    if (!userId) saveLocal(projects, id);
    else localStorage.setItem(LAST_OPEN_KEY(userId), id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, userId]);

  const updateCurrentCode = useCallback((code: string) => {
    const next = projects.map((p) =>
      p.id === currentId ? { ...p, code, updatedAt: Date.now() } : p
    );
    update(next);
    const changed = next.find((p) => p.id === currentId);
    if (changed) upsertDebounced(changed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, currentId, userId]);

  const updateCurrentLanguage = useCallback((language: Language) => {
    const next = projects.map((p) =>
      p.id === currentId
        ? { ...p, language, code: LANGUAGE_CONFIG[language].template, updatedAt: Date.now() }
        : p
    );
    update(next);
    const changed = next.find((p) => p.id === currentId);
    if (changed) upsert(changed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, currentId, userId]);

  return {
    projects,
    currentProject,
    syncState,
    createProject,
    renameProject,
    deleteProject,
    switchProject,
    updateCurrentCode,
    updateCurrentLanguage,
  };
}
