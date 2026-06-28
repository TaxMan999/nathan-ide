import { useCallback, useState } from "react";
import { Language, LANGUAGE_CONFIG, Project } from "../types";

const STORAGE_KEY = "nathan-ide";

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

function load(): StorageShape {
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

function save(projects: Project[], lastOpenId: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, lastOpenId }));
}

export function useProjects() {
  const [{ projects, currentId }, setState] = useState<{
    projects: Project[];
    currentId: string;
  }>(() => {
    const { projects, lastOpenId } = load();
    return { projects, currentId: lastOpenId };
  });

  const currentProject =
    projects.find((p) => p.id === currentId) ?? projects[0];

  function update(next: Project[], nextId: string = currentId) {
    setState({ projects: next, currentId: nextId });
    save(next, nextId);
  }

  const createProject = useCallback((): string => {
    const p = makeProject("New Project");
    const next = [...projects, p];
    update(next, p.id);
    return p.id;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, currentId]);

  const renameProject = useCallback((id: string, name: string) => {
    const next = projects.map((p) =>
      p.id === id ? { ...p, name: name.trim() || p.name, updatedAt: Date.now() } : p
    );
    update(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, currentId]);

  const deleteProject = useCallback((id: string) => {
    if (projects.length === 1) return;
    const next = projects.filter((p) => p.id !== id);
    const nextId = id === currentId ? next[next.length - 1].id : currentId;
    update(next, nextId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, currentId]);

  const switchProject = useCallback((id: string) => {
    setState((s) => ({ ...s, currentId: id }));
    save(projects, id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const updateCurrentCode = useCallback((code: string) => {
    const next = projects.map((p) =>
      p.id === currentId ? { ...p, code, updatedAt: Date.now() } : p
    );
    update(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, currentId]);

  const updateCurrentLanguage = useCallback((language: Language) => {
    const next = projects.map((p) =>
      p.id === currentId
        ? { ...p, language, code: LANGUAGE_CONFIG[language].template, updatedAt: Date.now() }
        : p
    );
    update(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, currentId]);

  return {
    projects,
    currentProject,
    createProject,
    renameProject,
    deleteProject,
    switchProject,
    updateCurrentCode,
    updateCurrentLanguage,
  };
}
