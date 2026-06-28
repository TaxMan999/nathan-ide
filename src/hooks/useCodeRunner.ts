import { useCallback, useState } from "react";
import { Language, LANGUAGE_CONFIG } from "../types";

type RunStatus = "idle" | "running" | "done" | "error";

interface RunState {
  status: RunStatus;
  stdout: string;
  stderr: string;
}

interface Judge0Response {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: { id: number; description: string };
}

const JUDGE0_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";
const TIMEOUT_MS = 15_000;

export function useCodeRunner() {
  const [state, setState] = useState<RunState>({
    status: "idle",
    stdout: "",
    stderr: "",
  });

  const run = useCallback(async (code: string, language: Language) => {
    if (language === "html") return;

    setState({ status: "running", stdout: "", stderr: "" });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(JUDGE0_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          source_code: code,
          language_id: LANGUAGE_CONFIG[language].languageId,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = (await res.json()) as Judge0Response;

      const stdout = data.stdout ?? "";
      const compileErr = data.compile_output ?? "";
      const runtimeErr = data.stderr ?? "";
      const stderr = [compileErr, runtimeErr].filter(Boolean).join("\n");

      // status id 3 = Accepted, anything else is an error
      const succeeded = data.status.id === 3;

      setState({
        status: succeeded ? "done" : "error",
        stdout,
        stderr: succeeded ? stderr : stderr || data.status.description,
      });
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "AbortError"
          ? "Timed out after 15 seconds."
          : err instanceof Error
          ? err.message
          : "Unknown error";

      setState({ status: "error", stdout: "", stderr: message });
    } finally {
      clearTimeout(timer);
    }
  }, []);

  const clear = useCallback(() => {
    setState({ status: "idle", stdout: "", stderr: "" });
  }, []);

  return { ...state, run, clear };
}
