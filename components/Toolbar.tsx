"use client";
import React from "react";
import { useProjectStore } from "@/hooks/useProjectStore";
import {
  Pencil,
  Trash,
  ChevronDown,
  ChevronRight,
  Folder,
  FilePlus,
  FolderPlus,
  Settings,
  Download,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type TreeNode =
  | { type: "file"; name: string; path: string }
  | { type: "folder"; name: string; path: string; children: TreeNode[] };

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  // Common file extensions and their styling
  const iconMap: Record<string, { label: string; className: string }> = {
    // JavaScript/TypeScript
    js: {
      label: "JS",
      className:
        "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
    },
    jsx: {
      label: "JS",
      className:
        "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
    },
    ts: {
      label: "TS",
      className:
        "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
    },
    tsx: {
      label: "TS",
      className:
        "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
    },

    // Markup/Style
    html: {
      label: "<>",
      className:
        "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30",
    },
    css: {
      label: "#",
      className:
        "bg-blue-400/20 text-blue-500 dark:text-blue-300 border-blue-400/30",
    },
    scss: {
      label: "SCSS",
      className:
        "bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30",
    },

    // Config/Data
    json: {
      label: "{}",
      className:
        "bg-yellow-600/20 text-yellow-700 dark:text-yellow-500 border-yellow-600/30",
    },
    md: {
      label: "MD",
      className:
        "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30",
    },
    yaml: {
      label: "YML",
      className:
        "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
    },
    yml: {
      label: "YML",
      className:
        "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
    },

    // Others
    txt: {
      label: "TXT",
      className:
        "bg-gray-400/20 text-gray-600 dark:text-gray-400 border-gray-400/30",
    },
  };

  return (
    iconMap[ext] || {
      label: ext.toUpperCase().slice(0, 3) || "FILE",
      className: "bg-muted text-muted-foreground border-border",
    }
  );
}

function buildTree(files: Record<string, string>): TreeNode[] {
  const root: TreeNode = {
    type: "folder",
    name: "my-app",
    path: "/",
    children: [],
  };

  Object.keys(files)
    .sort()
    .forEach((fullPath) => {
      const parts = fullPath.split("/").filter(Boolean);
      let cur: any = root;
      let acc = "";
      parts.forEach((part, idx) => {
        acc += `/${part}`;
        const isLast = idx === parts.length - 1;
        if (isLast) {
          cur.children.push({ type: "file", name: part, path: fullPath });
        } else {
          let next = cur.children.find(
            (c: any) => c.type === "folder" && c.name === part
          );
          if (!next) {
            next = { type: "folder", name: part, path: acc, children: [] };
            cur.children.push(next);
          }
          cur = next;
        }
      });
    });

  function sortChildren(node: TreeNode) {
    if (node.type === "file") return;
    node.children.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
    node.children.forEach((c) => {
      if (c.type === "folder") sortChildren(c);
    });
  }

  sortChildren(root);

  return [root];
}

function NodeView({
  node,
  depth,
  activeFile,
  onOpen,
  onRename,
  onDelete,
}: {
  node: TreeNode;
  depth: number;
  activeFile?: string;
  onOpen?: (p: string) => void;
  onRename?: (oldP: string, newP: string) => void;
  onDelete?: (p: string) => void;
}) {
  const [open, setOpen] = React.useState(depth === 0);
  const [showFileDialog, setShowFileDialog] = React.useState(false);
  const [showFolderDialog, setShowFolderDialog] = React.useState(false);
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [newName, setNewName] = React.useState(node.name);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRename = () => {
    if (!newName.trim() || newName === node.name) {
      setIsRenaming(false);
      setNewName(node.name);
      return;
    }

    if (node.type === "file" && onRename) {
      onRename(node.path, node.path.replace(/[^/]+$/, newName));
    } else if (node.type === "folder" && onRename) {
      const dir = node.path.substring(0, node.path.lastIndexOf("/"));
      const newPath = dir === "" ? `/${newName}` : `${dir}/${newName}`;
      useProjectStore.getState().renameFolder(node.path, newPath);
      onRename(node.path, newPath);
    }
    setIsRenaming(false);
  };

  if (node.type === "file") {
    const fileExtension = node.name.split(".").pop() || "";
    const fileIcon = getFileIcon(node.name);
    const isActive = activeFile === node.path;

    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            style={{ paddingLeft: depth * 16 + 8 }}
            className={`flex items-center justify-between group px-2 py-1.5 rounded-md text-sm cursor-pointer transition-all ${
              isActive
                ? "bg-accent text-accent-foreground font-medium"
                : "hover:bg-accent/50 text-foreground"
            }`}
            onClick={() => !isRenaming && onOpen && onOpen(node.path)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className={`text-[14px] font-bold${fileIcon.className}`}
              >
                {fileIcon.label}
              </div>
              {/* <File
                className={`w-4 h-4 flex-shrink-0 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              /> */}
              {isRenaming ? (
                <Input
                  ref={inputRef}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") {
                      setIsRenaming(false);
                      setNewName(node.name);
                    }
                  }}
                  className="h-6 px-1 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="truncate">{node.name}</span>
              )}
            </div>
            {!isRenaming && (
              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {fileExtension}
              </span>
            )}
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setIsRenaming(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuSeparator />
          {/* <ContextMenuItem 
            onClick={() => {
              if (confirm(`Delete ${node.name}?`)) {
                onDelete && onDelete(node.path);
              }
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem> */}

          <ContextMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete File</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{node.name}</span>? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onDelete && onDelete(node.path);
                  toast.success("File deleted", {
                    description: `${node.name} has been deleted.`,
                  });
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ContextMenu>
    );
  }

  const folderItemCount = node.children.length;

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            style={{ paddingLeft: depth * 16 }}
            className="flex items-center justify-between px-2 py-1.5 text-sm font-medium text-foreground cursor-pointer hover:bg-accent/50 rounded-md transition-all group"
            onClick={() => setOpen((s) => !s)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {open ? (
                <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
              )}
              {isRenaming ? (
                <Input
                  ref={inputRef}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") {
                      setIsRenaming(false);
                      setNewName(node.name);
                    }
                  }}
                  className="h-6 px-1 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="truncate">{node.name}</span>
              )}
            </div>
            {!isRenaming && (
              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {folderItemCount}
              </span>
            )}
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setShowFileDialog(true)}>
            <FilePlus className="mr-2 h-4 w-4" />
            New File
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setShowFolderDialog(true)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => setIsRenaming(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{node.name}</span> and all its
              contents? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete && onDelete(node.path);
                toast.success("Folder deleted", {
                  description: `${node.name} and its contents have been deleted.`,
                });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
            <DialogDescription>
              Create a new file in{" "}
              <span className="font-medium">{node.name}</span>
            </DialogDescription>
          </DialogHeader>
          <CreateFileDialogContent
            parentPath={node.path}
            onCreate={(path: string) => {
              onOpen && onOpen(path);
              setShowFileDialog(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder in{" "}
              <span className="font-medium">{node.name}</span>
            </DialogDescription>
          </DialogHeader>
          <CreateFolderDialogContent
            parentPath={node.path}
            onCreate={(path: string) => {
              onOpen && onOpen(path);
              setShowFolderDialog(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {node.children.map((c, i) => (
              <NodeView
                key={c.path || i}
                node={c}
                depth={depth + 1}
                activeFile={activeFile}
                onOpen={onOpen}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Toolbar({
  activeFile,
  onOpen,
  onRename,
  onDelete,
}: {
  activeFile?: string;
  onOpen?: (path: string) => void;
  onRename?: (oldP: string, newP: string) => void;
  onDelete?: (p: string) => void;
}) {
  const files = useProjectStore((s) => s.files);
  const tree = React.useMemo(() => buildTree(files), [files]);
  const unsaved = useProjectStore((s) => s.unsaved);
  // const commitUnsaved = useProjectStore((s) => s.commitUnsaved);
  // const hasUnsaved = activeFile ? !!unsaved?.[activeFile] : false;
  // const [showNewFileDialog, setShowNewFileDialog] = React.useState(false);
  // const [showNewFolderDialog, setShowNewFolderDialog] = React.useState(false);

  return (
    <TooltipProvider>
      <div className="border-r border-border bg-background h-full flex flex-col w-64">
        {/* Header */}
        <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Explorer</span>
          </div>
          <div className="flex items-center gap-1">
            <ProjectMenu />
          </div>
        </div>

        {/* Quick Actions Bar removed — autosave runs automatically */}

        {/* File Tree */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {tree.map((n, i) => (
              <NodeView
                key={(n as any).path || i}
                node={n}
                depth={0}
                activeFile={activeFile}
                onOpen={onOpen}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}

function ProjectMenu() {
  const [open, setOpen] = React.useState(false);
  const saveProject = useProjectStore((s) => s.saveProject);
  const loadProject = useProjectStore((s) => s.loadProject);
  const listProjects = useProjectStore((s) => s.listProjects);
  const [projectId, setProjectId] = React.useState("");
  const [savedList, setSavedList] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (open) {
      setSavedList(listProjects());
    }
  }, [open, listProjects]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Settings className="w-4 h-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Project Settings</TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Manage your project settings and saved states
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="load" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="load">Load Project</TabsTrigger>
            <TabsTrigger value="save">Save Project</TabsTrigger>
          </TabsList>

          <TabsContent value="load" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Saved Projects</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project to load" />
                </SelectTrigger>
                <SelectContent>
                  {savedList.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No saved projects
                    </SelectItem>
                  ) : (
                    savedList.map((id) => (
                      <SelectItem key={id} value={id}>
                        {id}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (!projectId || projectId === "none") {
                  toast.error("No project selected", {
                    description: "Please select a project to load.",
                  });
                  return;
                }
                loadProject(projectId);
                toast.success("Project loaded", {
                  description: `"${projectId}" has been loaded successfully.`,
                });
                setOpen(false);
              }}
              disabled={!projectId || projectId === "none"}
            >
              <Upload className="w-4 h-4 mr-2" />
              Load Project
            </Button>
          </TabsContent>

          <TabsContent value="save" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="project-id">Project ID</Label>
              <Input
                id="project-id"
                placeholder="Enter project name"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (!projectId.trim()) {
                  toast.error("No project name", {
                    description: "Please enter a project name.",
                  });
                  return;
                }
                saveProject(projectId);
                toast.success("Project saved", {
                  description: `"${projectId}" has been saved successfully.`,
                });
                setProjectId("");
                setSavedList(listProjects());
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Save Project
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CreateFileDialogContentProps {
  parentPath: string;
  onCreate: (path: string) => void;
}

function CreateFileDialogContent({
  parentPath,
  onCreate,
}: CreateFileDialogContentProps) {
  const [fileName, setFileName] = React.useState("");
  const [error, setError] = React.useState("");
  const files = useProjectStore((s) => s.files);

  const handleCreate = () => {
    if (!fileName.trim()) {
      setError("File name is required");
      return;
    }

    if (/[<>:"|?*\\\/]/.test(fileName)) {
      setError("Invalid characters in file name");
      return;
    }

    const finalName = ensureHasExtension(fileName);
    const fullPath =
      parentPath === "/" ? `/${finalName}` : `${parentPath}/${finalName}`;

    if (files[fullPath]) {
      setError(`File ${finalName} already exists`);
      return;
    }

    useProjectStore.getState().setFile(fullPath, "");
    onCreate(fullPath);
  };

  return (
    <>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="file-name">File Name</Label>
          <Input
            id="file-name"
            placeholder="component.tsx"
            value={fileName}
            onChange={(e) => {
              setFileName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            autoFocus
            className={error ? "border-destructive" : ""}
          />
          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Extension will be added automatically if not provided
            </p>
          )}
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={handleCreate}>
          <FilePlus className="w-4 h-4 mr-2" />
          Create File
        </Button>
      </DialogFooter>
    </>
  );
}

interface CreateFolderDialogContentProps {
  parentPath: string;
  onCreate: (path: string) => void;
}

function CreateFolderDialogContent({
  parentPath,
  onCreate,
}: CreateFolderDialogContentProps) {
  const [folderName, setFolderName] = React.useState("");
  const [error, setError] = React.useState("");
  const files = useProjectStore((s) => s.files);

  const handleCreate = () => {
    if (!folderName.trim()) {
      setError("Folder name is required");
      return;
    }

    if (/[<>:"|?*\\\/]/.test(folderName)) {
      setError("Invalid characters in folder name");
      return;
    }

    const fullPath =
      parentPath === "/" ? `/${folderName}` : `${parentPath}/${folderName}`;
    const idx = `${fullPath}/index.js`;

    if (files[idx]) {
      onCreate(idx);
      return;
    }

    useProjectStore
      .getState()
      .setFile(idx, "export default function() { return null; }");
    onCreate(idx);
  };

  return (
    <>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="folder-name">Folder Name</Label>
          <Input
            id="folder-name"
            placeholder="components"
            value={folderName}
            onChange={(e) => {
              setFolderName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            autoFocus
            className={error ? "border-destructive" : ""}
          />
          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              An index.js file will be created automatically
            </p>
          )}
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={handleCreate}>
          <FolderPlus className="w-4 h-4 mr-2" />
          Create Folder
        </Button>
      </DialogFooter>
    </>
  );
}

function ensureHasExtension(p: string) {
  const parts = p.split("/");
  const last = parts[parts.length - 1] || "";
  if (last.includes(".")) return p;
  return p.replace(/\/$/, "") + ".js";
}
