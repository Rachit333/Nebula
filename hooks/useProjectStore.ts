import { create } from "zustand";
import { getIdToken, getAuthInstance } from "@/lib/firebaseClient";

type FileMap = Record<string, string>;

interface FileState {
  files: FileMap;
  currentProjectId?: string;
  setFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  renameFolder: (oldPath: string, newPath: string) => void;
  unsaved: FileMap;
  setUnsaved: (path: string, content: string) => void;
  commitUnsaved: (path: string, pushToRedis?: boolean) => void;
  discardUnsaved: (path: string) => void;
  saveProject: (projectId: string) => void;
  pushProject: (projectId?: string, owner?: string) => void;
  loadProject: (projectId: string) => boolean;
  listProjects: () => string[];
}

export const useProjectStore = create<FileState>((set) => {
  const tag = "useProjectStore";

  const d = (..._args: any[]) => {
    console.log(tag, ..._args);
  };
  const i = (..._args: any[]) => {
    console.log(tag, ..._args);
  };
  const e = (..._args: any[]) => {
    console.error(tag, ..._args);
  };

  const safeSetLocal = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      d("localStorage.setItem OK", key, value?.slice?.(0, 120));
      console.log(tag, "safeSetLocal set", key, value?.slice?.(0, 120));
    } catch (err) {
      e("localStorage.setItem ERROR", key, String(err));
      console.log(tag, "safeSetLocal error", key, String(err));
    }
  };

  const pushToServer = async (payload: any) => {
    try {
      d("attempting to get ID token for push");
      console.log(tag, "pushToServer start", payload?.projectId);
      const token = await getIdToken();
      if (!token) {
        i("no ID token available; skipping authenticated push", payload.projectId);
        console.log(tag, "pushToServer skipped no token", payload?.projectId);
        return;
      }
      d("ID token available (not logged to avoid leaking)");
      console.log(tag, "pushToServer has token", payload?.projectId);
      const resp = await fetch("/api/upstash/push", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...payload, savedAt: new Date().toISOString() }),
      });
      const text = await resp.text();
      if (!resp.ok) {
        e("push failed", { status: resp.status, statusText: resp.statusText, body: text, payload });
        console.log(tag, "pushToServer failed", { status: resp.status, statusText: resp.statusText, body: text });
      } else {
        i("push succeeded", { status: resp.status, body: text, projectId: payload.projectId });
        console.log(tag, "pushToServer succeeded", payload?.projectId, text?.slice?.(0, 200));
      }
    } catch (err) {
      e("pushToServer ERROR", String(err));
      console.log(tag, "pushToServer error", String(err));
    }
  };

  return ({
    files: {
      "/src/App.js": `export default function App() {
  return <h1>Hello Nebula 👋</h1>;
}`,
      "/src/index.js": `import ReactDOM from "react-dom/client";
import App from "./App";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);`,
      "/src/index.css": `body { font-family: Arial, Helvetica, sans-serif; }`,
      "/public/index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>nebula App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
      "/package.json": `{
  "name": "my-app",
  "private": true,
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}`,
    },
    unsaved: {},
    currentProjectId: undefined,
    setFile: (path: string, content: string) =>
      set((s) => {
        let p = (path || "").trim();
        if (!p.startsWith("/")) p = "/" + p;
        p = p.replace(/\/+/g, "/");
        if (p === "/" || p.length < 2) {
          e("setFile invalid path", path);
          console.log(tag, "setFile invalid path", path);
          return s;
        }

        const nextFiles = { ...s.files, [p]: content };
        console.log(tag, "setFile", p, content?.slice?.(0, 120));
        try {
          const key = `nebula:file:${encodeURIComponent(p)}`;
          safeSetLocal(key, content);
        } catch (err) {
          e("setFile localStorage error", p, String(err));
          console.log(tag, "setFile localStorage error", p, String(err));
        }
        try {
          // Autosave is always-on: if we have a currentProjectId, push changes to server in background
          const projectId = s.currentProjectId;
          if (projectId) {
            const payload = { files: { ...nextFiles }, projectId };
            d("autosave (always-on) queued push", projectId);
            console.log(tag, "setFile autosave queue", projectId);
            void pushToServer(payload);
          }
        } catch (err) {
          e("setFile push error", String(err));
          console.log(tag, "setFile push error", String(err));
        }
        return { files: nextFiles };
      }),
    deleteFile: (path: string) =>
      set((s) => {
        const copy = { ...s.files };
        delete copy[path];
        d("deleteFile", path);
        console.log(tag, "deleteFile", path);
        return { files: copy };
      }),
    renameFile: (oldPath: string, newPath: string) =>
      set((s) => {
        const copy = { ...s.files };
        copy[newPath] = copy[oldPath] ?? "";
        delete copy[oldPath];
        d("renameFile", oldPath, newPath);
        return { files: copy };
      }),
    renameFolder: (oldPath: string, newPath: string) =>
      set((s) => {
        const copy = { ...s.files };
        // Normalize paths (no trailing slash on folder path)
        const oldPrefix = oldPath.replace(/\/+$/g, "");
        const newPrefix = newPath.replace(/\/+$/g, "");

        Object.keys(s.files).forEach((p) => {
          if (p === oldPrefix || p.startsWith(oldPrefix + "/")) {
            const remainder = p === oldPrefix ? "" : p.substring(oldPrefix.length + 1);
            const newKey = remainder ? `${newPrefix}/${remainder}` : newPrefix;
            copy[newKey] = copy[p];
            delete copy[p];
          }
        });

        d("renameFolder", oldPath, newPath);
        return { files: copy };
      }),
    setUnsaved: (path: string, content: string) =>
      set((s) => {
        const next = { ...(s.unsaved || {}), [path]: content };
        try {
          const key = `nebula:file:${encodeURIComponent(path)}`;
          safeSetLocal(key, content);
        } catch (err) {
          e("setUnsaved localStorage error", path, String(err));
          console.log(tag, "setUnsaved local error", path, String(err));
        }
        d("setUnsaved", path);
        console.log(tag, "setUnsaved", path);
        return { unsaved: next };
      }),
    commitUnsaved: (path: string, pushToRedis?: boolean) =>
      set((s) => {
        const copyFiles = { ...s.files };
        const copyUnsaved = { ...(s.unsaved || {}) };
        if (copyUnsaved[path] !== undefined) {
          let toWrite = copyUnsaved[path];
          console.log(tag, "commitUnsaved start", path, toWrite?.slice?.(0, 120));
          const ext = path.split(".").pop()?.toLowerCase();
          if (ext === "js" || ext === "jsx" || ext === "ts" || ext === "tsx") {
            toWrite = toWrite.replace(/^\s*\/\/\s*(<[^>]+>\s*|<[^>]+\/>\s*)$/gm, (m: string, g1: string) => {
              return `{/* ${g1.trim()} */}`;
            });
          }
          copyFiles[path] = toWrite;
          try {
            const key = `nebula:file:${encodeURIComponent(path)}`;
            safeSetLocal(key, toWrite);
          } catch (err) {
            e("commitUnsaved localStorage error", path, String(err));
            console.log(tag, "commitUnsaved local error", path, String(err));
          }
          delete copyUnsaved[path];
          try {
            // Autosave always-on: push if we have a currentProjectId or explicit push requested
            if (s.currentProjectId || pushToRedis) {
              const projectId = s.currentProjectId;
              const fullProject = { ...copyFiles };
              fullProject[path] = toWrite;
              d("commitUnsaved will push", { projectId, path });
              console.log(tag, "commitUnsaved will push", projectId, path);
              void pushToServer({ files: fullProject, projectId });
            }
          } catch (err) {
            e("commitUnsaved push error", String(err));
            console.log(tag, "commitUnsaved push error", String(err));
          }
          console.log(tag, "commitUnsaved done", path);
          return { files: copyFiles, unsaved: copyUnsaved };
        }
        return s;
      }),
    discardUnsaved: (path: string) =>
      set((s) => {
        const copyUnsaved = { ...(s.unsaved || {}) };
        if (copyUnsaved[path] !== undefined) {
          delete copyUnsaved[path];
          d("discardUnsaved", path);
          console.log(tag, "discardUnsaved", path);
          return { unsaved: copyUnsaved };
        }
        return s;
      }),
    saveProject: (projectId: string) =>
      set((s) => {
        try {
          if (!projectId) throw new Error("projectId required");
          const key = `nebula:project:${projectId}`;
          const payload = { files: s.files, unsaved: s.unsaved, savedAt: new Date().toISOString() };
          safeSetLocal(key, JSON.stringify(payload));
          s.currentProjectId = projectId;
          i("saveProject ok", projectId);
          console.log(tag, "saveProject", projectId, payload.savedAt);
        } catch (err) {
          e("saveProject error", String(err));
          console.log(tag, "saveProject error", String(err));
        }
        return s;
      }),
    pushProject: (projectId?: string, owner?: string) =>
      set((s) => {
        try {
          const pid = projectId || s.currentProjectId;
          const finalOwner = owner || 'rick morty';
          Object.entries(s.files).forEach(([p, content]) => {
            try {
              const key = `nebula:file:${encodeURIComponent(p)}`;
              safeSetLocal(key, content);
              console.log(tag, "pushProject persisted file", p);
            } catch (err) {
              e("pushProject local persist error", p, String(err));
              console.log(tag, "pushProject local persist error", p, String(err));
            }
          });
          d("pushProject preparing payload", { pid });
          console.log(tag, "pushProject preparing payload", pid);
          void pushToServer({ files: s.files, projectId: pid });
        } catch (err) {
          e("pushProject error", String(err));
          console.log(tag, "pushProject error", String(err));
        }
        return s;
      }),
    loadProject: (projectId: string) =>
      set((s) => {
        try {
          if (!projectId) return s;
          console.log(tag, "loadProject start", projectId);
          const localKey = `nebula:project:${projectId}`;
          const rawLocal = localStorage.getItem(localKey);
          let localParsed: any = null;
          
          // Try to get from project snapshot first
          if (rawLocal) {
            try {
              localParsed = JSON.parse(rawLocal);
              console.log(tag, "✅ loadProject found local snapshot", projectId, Object.keys(localParsed.files || {}).length);
            } catch (parseErr) {
              console.log(tag, "❌ loadProject local parse error", projectId, String(parseErr));
            }
          }
          
          // If no snapshot, try to reconstruct from individual files
          if (!localParsed) {
            try {
              const reconstructed: Record<string, string> = {};
              for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i) as string;
                if (!k) continue;
                if (k.startsWith("nebula:file:")) {
                  try {
                    const p = decodeURIComponent(k.replace("nebula:file:", ""));
                    const v = localStorage.getItem(k);
                    if (v !== null) reconstructed[p] = v;
                  } catch (e) {
                    console.log(tag, "loadProject reconstruct item error", k, String(e));
                  }
                }
              }
              if (Object.keys(reconstructed).length > 0) {
                localParsed = { files: reconstructed, unsaved: {} };
                try {
                  safeSetLocal(localKey, JSON.stringify(localParsed));
                  console.log(tag, "✅ loadProject reconstructed and saved snapshot", projectId, Object.keys(reconstructed).length);
                } catch (saveErr) {
                  console.log(tag, "⚠️  loadProject reconstruct save error", String(saveErr));
                }
              } else {
                console.log(tag, "⚠️  loadProject found no local files to reconstruct", projectId);
              }
            } catch (err) {
              console.log(tag, "❌ loadProject reconstruct failed", String(err));
            }
          }

          // Load from localStorage immediately
          if (localParsed) {
            const files = localParsed.files ?? s.files;
            const unsaved = localParsed.unsaved ?? {};
            console.log(tag, "✅ loadProject returning local snapshot", projectId, Object.keys(files || {}).length, "files");
            
            // Now try to sync with remote in the background (non-blocking)
            (async () => {
              try {
                const auth = getAuthInstance();
                const uid = auth.currentUser?.uid;
                let resp: Response | null = null;
                if (uid) {
                  resp = await fetch(`/api/upstash/push?key=user:${encodeURIComponent(uid)}:project:${encodeURIComponent(projectId)}`);
                }
                if (!resp || !resp.ok) {
                  resp = await fetch(`/api/upstash/push?key=project:${encodeURIComponent(projectId)}`);
                }
                if (resp && resp.ok) {
                  const json = await resp.json();
                  const remote = json?.value ?? null;
                  if (remote && remote.files) {
                    const remoteSaved = remote.savedAt || remote.payload?.savedAt;
                    const localSaved = localParsed?.savedAt;
                    console.log(tag, "🔵 loadProject remote check", projectId, Object.keys(remote.files || {}).length, "remoteSaved:", remoteSaved, "localSaved:", localSaved);
                    
                    if (!localSaved && remoteSaved) {
                      safeSetLocal(localKey, JSON.stringify(remote));
                      set((s2) => ({ ...s2, files: remote.files, unsaved: {}, currentProjectId: projectId }));
                      console.log(tag, "✅ loadProject synced remote (no local save time)", projectId);
                    } else if (localSaved && remoteSaved) {
                      const localTime = new Date(localSaved).getTime();
                      const remoteTime = new Date(remoteSaved).getTime();
                      if (remoteTime > localTime) {
                        safeSetLocal(localKey, JSON.stringify(remote));
                        set((s2) => ({ ...s2, files: remote.files, unsaved: {}, currentProjectId: projectId }));
                        console.log(tag, "✅ loadProject synced remote (remote is newer)", projectId);
                      } else if (localTime > remoteTime) {
                        console.log(tag, "ℹ️  loadProject local is newer, keeping local", projectId);
                      }
                    }
                  }
                }
              } catch (err) {
                console.log(tag, "⚠️  loadProject background remote check failed", String(err));
              }
            })();
            
            return { files, unsaved, currentProjectId: projectId } as any;
          }

          console.log(tag, "❌ loadProject found no data for", projectId);
          return s;
        } catch (err) {
          console.error(tag, "loadProject error", String(err));
          return s;
        }
      }) as any,
    listProjects: () => {
      try {
        console.log(tag, "listProjects start");
        const res: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i) as string;
          if (key?.startsWith("nebula:project:")) {
            res.push(key.replace("nebula:project:", ""));
          }
        }
        d("listProjects", res.length);
        console.log(tag, "listProjects result", res.length);
        return res;
      } catch (err) {
        e("listProjects error", String(err));
        console.log(tag, "listProjects error", String(err));
        return [];
      }
    },
  });
});
