export type Language = "python" | "cpp" | "java" | "html";

export interface Project {
  id: string;
  name: string;
  language: Language;
  code: string;
  updatedAt: number;
}

export interface LanguageConfig {
  label: string;
  monacoLanguage: string;
  /** Judge0 CE language ID — https://ce.judge0.com/languages */
  languageId: number;
  template: string;
}

export const LANGUAGE_CONFIG: Record<Language, LanguageConfig> = {
  python: {
    label: "Python",
    monacoLanguage: "python",
    languageId: 100, // Python 3.12.5
    template: `print("Hello, World!")
`,
  },
  cpp: {
    label: "C++",
    monacoLanguage: "cpp",
    languageId: 105, // C++ GCC 14.1.0
    template: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
`,
  },
  java: {
    label: "Java",
    monacoLanguage: "java",
    languageId: 91, // Java JDK 17.0.6
    template: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`,
  },
  html: {
    label: "HTML",
    monacoLanguage: "html",
    languageId: 0, // not used — HTML renders in iframe
    template: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; padding: 20px; }
      h1 { color: #4f46e5; }
    </style>
  </head>
  <body>
    <h1>Hello, World!</h1>
    <p>Edit this HTML to see live changes!</p>
  </body>
</html>
`,
  },
};
