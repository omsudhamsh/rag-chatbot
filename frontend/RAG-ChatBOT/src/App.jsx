import { useEffect, useMemo, useState } from "react";
import Chat from "./Components/Chat.jsx";
import UploadPDF from "./Components/UploadPDF.jsx";

function App() {
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem("themeMode") || "system");
  const [systemTheme, setSystemTheme] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  const resolvedTheme = useMemo(() => {
    if (themeMode === "system") return systemTheme;
    return themeMode;
  }, [themeMode, systemTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (event) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  useEffect(() => {
    localStorage.setItem("themeMode", themeMode);
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const shellClass =
    resolvedTheme === "light"
      ? "rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-xl backdrop-blur-xl"
      : "rounded-2xl border border-white/15 bg-slate-900/50 p-6 shadow-2xl backdrop-blur-xl";

  const titleClass =
    resolvedTheme === "light"
      ? "text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
      : "text-3xl font-semibold tracking-tight text-white sm:text-4xl";

  const subtitleClass =
    resolvedTheme === "light" ? "mt-2 text-sm text-slate-600" : "mt-2 text-sm text-slate-300";

  const selectClass =
    resolvedTheme === "light"
      ? "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-400"
      : "rounded-lg border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 shadow-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-400";

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className={shellClass}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className={titleClass}>RAG Knowledge Chatbot</h1>
              <p className={subtitleClass}>
                Upload your PDF and ask grounded questions with smooth real-time responses.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className={resolvedTheme === "light" ? "text-sm font-medium text-slate-700" : "text-sm font-medium text-slate-300"} htmlFor="themeMode">
                Theme
              </label>
              <select
                id="themeMode"
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value)}
                className={selectClass}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System Default</option>
              </select>
            </div>
          </div>
        </div>

        <UploadPDF theme={resolvedTheme} />
        <Chat theme={resolvedTheme} />
      </div>
    </div>
  );
}

export default App;