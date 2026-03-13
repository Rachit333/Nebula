"use client";
import Editor, { loader } from "@monaco-editor/react";
import { useProjectStore } from "@/hooks/useProjectStore";
import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";

const EXT_TO_LANGUAGE: Record<string, string> = {
  js:       "javascript",
  jsx:      "javascript",
  ts:       "typescript",
  tsx:      "typescript",
  css:      "css",
  html:     "html",
  json:     "json",
  md:       "markdown",
  markdown: "markdown",
};

function getLanguageFromPath(path?: string): string {
  const ext = path?.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_LANGUAGE[ext] ?? "javascript";
}

const JSX_EXTS = new Set(["js", "jsx", "ts", "tsx"]);

function fixJsxComments(src: string): string {
  return src.replace(
    /^\s*\/\/\s*(<[^>]+>\s*|<[^>]+\/>\s*)$/gm,
    (_, g1) => `{/* ${g1.trim()} */}`
  );
}

// ─── Register custom themes once ─────────────────────────────────────────────

loader.init().then((monaco) => {
  // Dark theme — matches Nebula palette
  monaco.editor.defineTheme("nebula-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "",                    foreground: "c8cdd6",  background: "080a0e" },
      { token: "comment",             foreground: "3d4450",  fontStyle: "italic" },
      { token: "keyword",             foreground: "c8f04b" },
      { token: "keyword.operator",    foreground: "c8f04b" },
      { token: "number",              foreground: "f0a060" },
      { token: "string",              foreground: "86c98e" },
      { token: "string.escape",       foreground: "c8f04b" },
      { token: "type",                foreground: "7eb8d4" },
      { token: "type.identifier",     foreground: "7eb8d4" },
      { token: "variable",            foreground: "c8cdd6" },
      { token: "variable.predefined", foreground: "c8f04b" },
      { token: "identifier",          foreground: "c8cdd6" },
      { token: "delimiter",           foreground: "4a5260" },
      { token: "delimiter.bracket",   foreground: "6b7688" },
      { token: "tag",                 foreground: "c8f04b" },
      { token: "tag.id",              foreground: "c8f04b" },
      { token: "tag.attribute",       foreground: "7eb8d4" },
      { token: "attribute.name",      foreground: "7eb8d4" },
      { token: "attribute.value",     foreground: "86c98e" },
      { token: "metatag",             foreground: "f0a060" },
      { token: "regexp",              foreground: "f0a060" },
      { token: "constructor",         foreground: "c8f04b", fontStyle: "bold" },
      { token: "function",            foreground: "b8d4f0" },
    ],
    colors: {
      // editor chrome
      "editor.background":              "#080a0e",
      "editor.foreground":              "#c8cdd6",
      "editor.lineHighlightBackground": "#0f1117",
      "editor.lineHighlightBorder":     "#00000000",
      "editor.selectionBackground":     "#c8f04b22",
      "editor.inactiveSelectionBackground": "#c8f04b11",
      "editor.wordHighlightBackground": "#c8f04b18",
      "editor.findMatchBackground":     "#c8f04b33",
      "editor.findMatchHighlightBackground": "#c8f04b1a",

      // gutter
      "editorGutter.background":        "#080a0e",
      "editorLineNumber.foreground":    "#2e3440",
      "editorLineNumber.activeForeground": "#c8f04b",

      // cursor
      "editorCursor.foreground":        "#c8f04b",

      // indent guides
      "editorIndentGuide.background":   "#ffffff0a",
      "editorIndentGuide.activeBackground": "#c8f04b33",

      // scrollbar
      "scrollbarSlider.background":     "#ffffff0a",
      "scrollbarSlider.hoverBackground":"#ffffff14",
      "scrollbarSlider.activeBackground":"#c8f04b33",

      // minimap
      "minimap.background":             "#080a0e",
      "minimapSlider.background":       "#ffffff08",

      // brackets
      "editorBracketMatch.background":  "#c8f04b18",
      "editorBracketMatch.border":      "#c8f04b55",

      // suggestions / autocomplete
      "editorSuggestWidget.background": "#0f1117",
      "editorSuggestWidget.border":     "#ffffff12",
      "editorSuggestWidget.foreground": "#c8cdd6",
      "editorSuggestWidget.selectedBackground": "#c8f04b18",
      "editorSuggestWidget.highlightForeground": "#c8f04b",

      // hover widget
      "editorHoverWidget.background":   "#0f1117",
      "editorHoverWidget.border":       "#ffffff12",

      // peek view
      "peekView.border":                "#c8f04b44",
      "peekViewEditor.background":      "#0f1117",
      "peekViewResult.background":      "#080a0e",
      "peekViewTitle.background":       "#0f1117",
      "peekViewTitleLabel.foreground":  "#c8f04b",

      // error / warning squiggles kept default

      // panel / sidebar match
      "sideBar.background":             "#080a0e",
      "panel.background":               "#080a0e",
    },
  });

  // Light theme — soft warm paper
  monaco.editor.defineTheme("nebula-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "",                 foreground: "2d3142" },
      { token: "comment",         foreground: "a0a8c0", fontStyle: "italic" },
      { token: "keyword",         foreground: "5a7a1e", fontStyle: "bold" },
      { token: "number",          foreground: "c06a20" },
      { token: "string",          foreground: "2e7d32" },
      { token: "type",            foreground: "1a5f7a" },
      { token: "type.identifier", foreground: "1a5f7a" },
      { token: "tag",             foreground: "5a7a1e" },
      { token: "tag.attribute",   foreground: "1a5f7a" },
      { token: "attribute.value", foreground: "2e7d32" },
      { token: "function",        foreground: "1a4f8a" },
      { token: "delimiter",       foreground: "8890a8" },
    ],
    colors: {
      "editor.background":              "#f8f9f2",
      "editor.foreground":              "#2d3142",
      "editor.lineHighlightBackground": "#f0f2e8",
      "editor.lineHighlightBorder":     "#00000000",
      "editor.selectionBackground":     "#c8f04b44",
      "editor.findMatchBackground":     "#c8f04b55",
      "editorGutter.background":        "#f8f9f2",
      "editorLineNumber.foreground":    "#c0c8d0",
      "editorLineNumber.activeForeground": "#6a8a1e",
      "editorCursor.foreground":        "#6a8a1e",
      "editorIndentGuide.background":   "#00000010",
      "editorIndentGuide.activeBackground": "#c8f04b66",
      "scrollbarSlider.background":     "#00000010",
      "scrollbarSlider.hoverBackground":"#00000018",
      "editorBracketMatch.background":  "#c8f04b33",
      "editorBracketMatch.border":      "#c8f04b88",
      "editorSuggestWidget.background": "#ffffff",
      "editorSuggestWidget.border":     "#00000015",
      "editorSuggestWidget.selectedBackground": "#c8f04b22",
      "editorSuggestWidget.highlightForeground": "#5a7a1e",
      "editorHoverWidget.background":   "#ffffff",
      "editorHoverWidget.border":       "#00000015",
      "minimap.background":             "#f8f9f2",
    },
  });
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function CodeEditor({ selectedPath }: { selectedPath?: string }) {
  const files     = useProjectStore((s) => s.files);
  const unsaved   = useProjectStore((s) => s.unsaved);
  const setFile   = useProjectStore((s) => s.setFile);
  const { theme } = useTheme();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const code =
    selectedPath
      ? (unsaved?.[selectedPath] ?? files[selectedPath] ?? "")
      : (files[Object.keys(files)[0]] ?? "");

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [selectedPath]);

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (!selectedPath) return;
      const next = value ?? "";
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const ext = selectedPath.split(".").pop()?.toLowerCase() ?? "";
        const content = JSX_EXTS.has(ext) ? fixJsxComments(next) : next;
        setFile(selectedPath, content);
      }, 250);
    },
    [selectedPath, setFile]
  );

  return (
    <Editor
      key={selectedPath ?? "global-editor"}
      height="100%"
      language={getLanguageFromPath(selectedPath)}
      theme={theme === "dark" ? "nebula-dark" : "nebula-light"}
      value={code}
      onChange={handleChange}
      options={{
        fontFamily: "'DM Mono', 'Fira Code', monospace",
        fontSize: 13,
        lineHeight: 22,
        fontLigatures: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        smoothScrolling: true,
        scrollBeyondLastLine: false,
        minimap: { enabled: true, scale: 1, renderCharacters: false },
        renderLineHighlight: "all",
        bracketPairColorization: { enabled: true },
        padding: { top: 16, bottom: 16 },
        overviewRulerBorder: false,
        hideCursorInOverviewRuler: true,
        renderWhitespace: "none",
        guides: { indentation: true, bracketPairs: true },
        scrollbar: {
          verticalScrollbarSize: 6,
          horizontalScrollbarSize: 6,
          useShadows: false,
        },
      }}
    />
  );
}