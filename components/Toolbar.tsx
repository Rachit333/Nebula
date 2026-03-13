// "use client";
// import React from "react";
// import { useProjectStore } from "@/hooks/useProjectStore";
// import {
//   Pencil,
//   Trash,
//   ChevronDown,
//   ChevronRight,
//   Folder,
//   FilePlus,
//   FolderPlus,
//   Settings,
//   Download,
//   Upload,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   ContextMenu,
//   ContextMenuContent,
//   ContextMenuItem,
//   ContextMenuSeparator,
//   ContextMenuTrigger,
// } from "@/components/ui/context-menu";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { toast } from "sonner";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// type TreeNode =
//   | { type: "file"; name: string; path: string }
//   | { type: "folder"; name: string; path: string; children: TreeNode[] };

// function getFileIcon(fileName: string) {
//   const ext = fileName.split(".").pop()?.toLowerCase() || "";

//   // Common file extensions and their styling
//   const iconMap: Record<string, { label: string; className: string }> = {
//     // JavaScript/TypeScript
//     js: {
//       label: "JS",
//       className:
//         "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
//     },
//     jsx: {
//       label: "JS",
//       className:
//         "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
//     },
//     ts: {
//       label: "TS",
//       className:
//         "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
//     },
//     tsx: {
//       label: "TS",
//       className:
//         "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
//     },

//     // Markup/Style
//     html: {
//       label: "<>",
//       className:
//         "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30",
//     },
//     css: {
//       label: "#",
//       className:
//         "bg-blue-400/20 text-blue-500 dark:text-blue-300 border-blue-400/30",
//     },
//     scss: {
//       label: "SCSS",
//       className:
//         "bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30",
//     },

//     // Config/Data
//     json: {
//       label: "{}",
//       className:
//         "bg-yellow-600/20 text-yellow-700 dark:text-yellow-500 border-yellow-600/30",
//     },
//     md: {
//       label: "MD",
//       className:
//         "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30",
//     },
//     yaml: {
//       label: "YML",
//       className:
//         "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
//     },
//     yml: {
//       label: "YML",
//       className:
//         "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
//     },

//     // Others
//     txt: {
//       label: "TXT",
//       className:
//         "bg-gray-400/20 text-gray-600 dark:text-gray-400 border-gray-400/30",
//     },
//   };

//   return (
//     iconMap[ext] || {
//       label: ext.toUpperCase().slice(0, 3) || "FILE",
//       className: "bg-muted text-muted-foreground border-border",
//     }
//   );
// }

// function buildTree(files: Record<string, string>): TreeNode[] {
//   const root: TreeNode = {
//     type: "folder",
//     name: "my-app",
//     path: "/",
//     children: [],
//   };

//   Object.keys(files)
//     .sort()
//     .forEach((fullPath) => {
//       const parts = fullPath.split("/").filter(Boolean);
//       let cur: any = root;
//       let acc = "";
//       parts.forEach((part, idx) => {
//         acc += `/${part}`;
//         const isLast = idx === parts.length - 1;
//         if (isLast) {
//           cur.children.push({ type: "file", name: part, path: fullPath });
//         } else {
//           let next = cur.children.find(
//             (c: any) => c.type === "folder" && c.name === part
//           );
//           if (!next) {
//             next = { type: "folder", name: part, path: acc, children: [] };
//             cur.children.push(next);
//           }
//           cur = next;
//         }
//       });
//     });

//   function sortChildren(node: TreeNode) {
//     if (node.type === "file") return;
//     node.children.sort((a, b) => {
//       if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
//       return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
//     });
//     node.children.forEach((c) => {
//       if (c.type === "folder") sortChildren(c);
//     });
//   }

//   sortChildren(root);

//   return [root];
// }

// function NodeView({
//   node,
//   depth,
//   activeFile,
//   onOpen,
//   onRename,
//   onDelete,
// }: {
//   node: TreeNode;
//   depth: number;
//   activeFile?: string;
//   onOpen?: (p: string) => void;
//   onRename?: (oldP: string, newP: string) => void;
//   onDelete?: (p: string) => void;
// }) {
//   const [open, setOpen] = React.useState(depth === 0);
//   const [showFileDialog, setShowFileDialog] = React.useState(false);
//   const [showFolderDialog, setShowFolderDialog] = React.useState(false);
//   const [isRenaming, setIsRenaming] = React.useState(false);
//   const [newName, setNewName] = React.useState(node.name);
//   const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
//   const inputRef = React.useRef<HTMLInputElement>(null);

//   React.useEffect(() => {
//     if (isRenaming && inputRef.current) {
//       inputRef.current.focus();
//       inputRef.current.select();
//     }
//   }, [isRenaming]);

//   const handleRename = () => {
//     if (!newName.trim() || newName === node.name) {
//       setIsRenaming(false);
//       setNewName(node.name);
//       return;
//     }

//     if (node.type === "file" && onRename) {
//       onRename(node.path, node.path.replace(/[^/]+$/, newName));
//     } else if (node.type === "folder" && onRename) {
//       const dir = node.path.substring(0, node.path.lastIndexOf("/"));
//       const newPath = dir === "" ? `/${newName}` : `${dir}/${newName}`;
//       useProjectStore.getState().renameFolder(node.path, newPath);
//       onRename(node.path, newPath);
//     }
//     setIsRenaming(false);
//   };

//   if (node.type === "file") {
//     const fileExtension = node.name.split(".").pop() || "";
//     const fileIcon = getFileIcon(node.name);
//     const isActive = activeFile === node.path;

//     return (
//       <ContextMenu>
//         <ContextMenuTrigger>
//           <motion.div
//             initial={{ opacity: 0, x: -10 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.15 }}
//             style={{ paddingLeft: depth * 16 + 8 }}
//             className={`flex items-center justify-between group px-2 py-1.5 rounded-md text-sm cursor-pointer transition-all ${
//               isActive
//                 ? "bg-accent text-accent-foreground font-medium"
//                 : "hover:bg-accent/50 text-foreground"
//             }`}
//             onClick={() => !isRenaming && onOpen && onOpen(node.path)}
//           >
//             <div className="flex items-center gap-2 flex-1 min-w-0">
//               <div
//                 className={`text-[14px] font-bold${fileIcon.className}`}
//               >
//                 {fileIcon.label}
//               </div>
//               {/* <File
//                 className={`w-4 h-4 flex-shrink-0 ${
//                   isActive ? "text-primary" : "text-muted-foreground"
//                 }`}
//               /> */}
//               {isRenaming ? (
//                 <Input
//                   ref={inputRef}
//                   value={newName}
//                   onChange={(e) => setNewName(e.target.value)}
//                   onBlur={handleRename}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") handleRename();
//                     if (e.key === "Escape") {
//                       setIsRenaming(false);
//                       setNewName(node.name);
//                     }
//                   }}
//                   className="h-6 px-1 text-sm"
//                   onClick={(e) => e.stopPropagation()}
//                 />
//               ) : (
//                 <span className="truncate">{node.name}</span>
//               )}
//             </div>
//             {!isRenaming && (
//               <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
//                 {fileExtension}
//               </span>
//             )}
//           </motion.div>
//         </ContextMenuTrigger>
//         <ContextMenuContent>
//           <ContextMenuItem onClick={() => setIsRenaming(true)}>
//             <Pencil className="mr-2 h-4 w-4" />
//             Rename
//           </ContextMenuItem>
//           <ContextMenuSeparator />
//           {/* <ContextMenuItem 
//             onClick={() => {
//               if (confirm(`Delete ${node.name}?`)) {
//                 onDelete && onDelete(node.path);
//               }
//             }}
//             className="text-destructive focus:text-destructive"
//           >
//             <Trash className="mr-2 h-4 w-4" />
//             Delete
//           </ContextMenuItem> */}

//           <ContextMenuItem
//             onClick={() => setShowDeleteDialog(true)}
//             className="text-destructive focus:text-destructive"
//           >
//             <Trash className="mr-2 h-4 w-4" />
//             Delete
//           </ContextMenuItem>
//         </ContextMenuContent>
//         <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//           <AlertDialogContent>
//             <AlertDialogHeader>
//               <AlertDialogTitle>Delete File</AlertDialogTitle>
//               <AlertDialogDescription>
//                 Are you sure you want to delete{" "}
//                 <span className="font-semibold">{node.name}</span>? This action
//                 cannot be undone.
//               </AlertDialogDescription>
//             </AlertDialogHeader>
//             <AlertDialogFooter>
//               <AlertDialogCancel>Cancel</AlertDialogCancel>
//               <AlertDialogAction
//                 onClick={() => {
//                   onDelete && onDelete(node.path);
//                   toast.success("File deleted", {
//                     description: `${node.name} has been deleted.`,
//                   });
//                 }}
//                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//               >
//                 Delete
//               </AlertDialogAction>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialog>
//       </ContextMenu>
//     );
//   }

//   const folderItemCount = node.children.length;

//   return (
//     <div>
//       <ContextMenu>
//         <ContextMenuTrigger>
//           <motion.div
//             initial={{ opacity: 0, x: -10 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.15 }}
//             style={{ paddingLeft: depth * 16 }}
//             className="flex items-center justify-between px-2 py-1.5 text-sm font-medium text-foreground cursor-pointer hover:bg-accent/50 rounded-md transition-all group"
//             onClick={() => setOpen((s) => !s)}
//           >
//             <div className="flex items-center gap-2 flex-1 min-w-0">
//               {open ? (
//                 <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
//               ) : (
//                 <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
//               )}
//               {isRenaming ? (
//                 <Input
//                   ref={inputRef}
//                   value={newName}
//                   onChange={(e) => setNewName(e.target.value)}
//                   onBlur={handleRename}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") handleRename();
//                     if (e.key === "Escape") {
//                       setIsRenaming(false);
//                       setNewName(node.name);
//                     }
//                   }}
//                   className="h-6 px-1 text-sm"
//                   onClick={(e) => e.stopPropagation()}
//                 />
//               ) : (
//                 <span className="truncate">{node.name}</span>
//               )}
//             </div>
//             {!isRenaming && (
//               <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
//                 {folderItemCount}
//               </span>
//             )}
//           </motion.div>
//         </ContextMenuTrigger>
//         <ContextMenuContent>
//           <ContextMenuItem onClick={() => setShowFileDialog(true)}>
//             <FilePlus className="mr-2 h-4 w-4" />
//             New File
//           </ContextMenuItem>
//           <ContextMenuItem onClick={() => setShowFolderDialog(true)}>
//             <FolderPlus className="mr-2 h-4 w-4" />
//             New Folder
//           </ContextMenuItem>
//           <ContextMenuSeparator />
//           <ContextMenuItem onClick={() => setIsRenaming(true)}>
//             <Pencil className="mr-2 h-4 w-4" />
//             Rename
//           </ContextMenuItem>
//           <ContextMenuItem
//             onClick={() => setShowDeleteDialog(true)}
//             className="text-destructive focus:text-destructive"
//           >
//             <Trash className="mr-2 h-4 w-4" />
//             Delete
//           </ContextMenuItem>
//         </ContextMenuContent>
//       </ContextMenu>

//       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Folder</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete{" "}
//               <span className="font-semibold">{node.name}</span> and all its
//               contents? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={() => {
//                 onDelete && onDelete(node.path);
//                 toast.success("Folder deleted", {
//                   description: `${node.name} and its contents have been deleted.`,
//                 });
//               }}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>Create New File</DialogTitle>
//             <DialogDescription>
//               Create a new file in{" "}
//               <span className="font-medium">{node.name}</span>
//             </DialogDescription>
//           </DialogHeader>
//           <CreateFileDialogContent
//             parentPath={node.path}
//             onCreate={(path: string) => {
//               onOpen && onOpen(path);
//               setShowFileDialog(false);
//             }}
//           />
//         </DialogContent>
//       </Dialog>

//       <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>Create New Folder</DialogTitle>
//             <DialogDescription>
//               Create a new folder in{" "}
//               <span className="font-medium">{node.name}</span>
//             </DialogDescription>
//           </DialogHeader>
//           <CreateFolderDialogContent
//             parentPath={node.path}
//             onCreate={(path: string) => {
//               onOpen && onOpen(path);
//               setShowFolderDialog(false);
//             }}
//           />
//         </DialogContent>
//       </Dialog>

//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{ duration: 0.2, ease: "easeInOut" }}
//             className="overflow-hidden"
//           >
//             {node.children.map((c, i) => (
//               <NodeView
//                 key={c.path || i}
//                 node={c}
//                 depth={depth + 1}
//                 activeFile={activeFile}
//                 onOpen={onOpen}
//                 onRename={onRename}
//                 onDelete={onDelete}
//               />
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// export default function Toolbar({
//   activeFile,
//   onOpen,
//   onRename,
//   onDelete,
// }: {
//   activeFile?: string;
//   onOpen?: (path: string) => void;
//   onRename?: (oldP: string, newP: string) => void;
//   onDelete?: (p: string) => void;
// }) {
//   const files = useProjectStore((s) => s.files);
//   const tree = React.useMemo(() => buildTree(files), [files]);
//   const unsaved = useProjectStore((s) => s.unsaved);
//   // const commitUnsaved = useProjectStore((s) => s.commitUnsaved);
//   // const hasUnsaved = activeFile ? !!unsaved?.[activeFile] : false;
//   // const [showNewFileDialog, setShowNewFileDialog] = React.useState(false);
//   // const [showNewFolderDialog, setShowNewFolderDialog] = React.useState(false);

//   return (
//     <TooltipProvider>
//       <div className="border-r border-border bg-background h-full flex flex-col w-64">
//         {/* Header */}
//         <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
//           <div className="flex items-center gap-2">
//             <Folder className="w-4 h-4 text-primary" />
//             <span className="font-semibold text-sm">Explorer</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <ProjectMenu />
//           </div>
//         </div>

//         {/* Quick Actions Bar removed — autosave runs automatically */}

//         {/* File Tree */}
//         <ScrollArea className="flex-1">
//           <div className="p-2">
//             {tree.map((n, i) => (
//               <NodeView
//                 key={(n as any).path || i}
//                 node={n}
//                 depth={0}
//                 activeFile={activeFile}
//                 onOpen={onOpen}
//                 onRename={onRename}
//                 onDelete={onDelete}
//               />
//             ))}
//           </div>
//         </ScrollArea>
//       </div>
//     </TooltipProvider>
//   );
// }

// function ProjectMenu() {
//   const [open, setOpen] = React.useState(false);
//   const saveProject = useProjectStore((s) => s.saveProject);
//   const loadProject = useProjectStore((s) => s.loadProject);
//   const listProjects = useProjectStore((s) => s.listProjects);
//   const [projectId, setProjectId] = React.useState("");
//   const [savedList, setSavedList] = React.useState<string[]>([]);

//   React.useEffect(() => {
//     if (open) {
//       setSavedList(listProjects());
//     }
//   }, [open, listProjects]);

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <DialogTrigger asChild>
//             <Button variant="ghost" size="icon" className="h-7 w-7">
//               <Settings className="w-4 h-4" />
//             </Button>
//           </DialogTrigger>
//         </TooltipTrigger>
//         <TooltipContent>Project Settings</TooltipContent>
//       </Tooltip>

//       <DialogContent className="sm:max-w-[500px]">
//         <DialogHeader>
//           <DialogTitle>Project Settings</DialogTitle>
//           <DialogDescription>
//             Manage your project settings and saved states
//           </DialogDescription>
//         </DialogHeader>

//         <Tabs defaultValue="load" className="w-full">
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="load">Load Project</TabsTrigger>
//             <TabsTrigger value="save">Save Project</TabsTrigger>
//           </TabsList>

//           <TabsContent value="load" className="space-y-4 mt-4">
//             <div className="space-y-2">
//               <Label>Saved Projects</Label>
//               <Select value={projectId} onValueChange={setProjectId}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select a project to load" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {savedList.length === 0 ? (
//                     <SelectItem value="none" disabled>
//                       No saved projects
//                     </SelectItem>
//                   ) : (
//                     savedList.map((id) => (
//                       <SelectItem key={id} value={id}>
//                         {id}
//                       </SelectItem>
//                     ))
//                   )}
//                 </SelectContent>
//               </Select>
//             </div>
//             <Button
//               className="w-full"
//               onClick={() => {
//                 if (!projectId || projectId === "none") {
//                   toast.error("No project selected", {
//                     description: "Please select a project to load.",
//                   });
//                   return;
//                 }
//                 loadProject(projectId);
//                 toast.success("Project loaded", {
//                   description: `"${projectId}" has been loaded successfully.`,
//                 });
//                 setOpen(false);
//               }}
//               disabled={!projectId || projectId === "none"}
//             >
//               <Upload className="w-4 h-4 mr-2" />
//               Load Project
//             </Button>
//           </TabsContent>

//           <TabsContent value="save" className="space-y-4 mt-4">
//             <div className="space-y-2">
//               <Label htmlFor="project-id">Project ID</Label>
//               <Input
//                 id="project-id"
//                 placeholder="Enter project name"
//                 value={projectId}
//                 onChange={(e) => setProjectId(e.target.value)}
//               />
//             </div>
//             <Button
//               className="w-full"
//               onClick={() => {
//                 if (!projectId.trim()) {
//                   toast.error("No project name", {
//                     description: "Please enter a project name.",
//                   });
//                   return;
//                 }
//                 saveProject(projectId);
//                 toast.success("Project saved", {
//                   description: `"${projectId}" has been saved successfully.`,
//                 });
//                 setProjectId("");
//                 setSavedList(listProjects());
//               }}
//             >
//               <Download className="w-4 h-4 mr-2" />
//               Save Project
//             </Button>
//           </TabsContent>
//         </Tabs>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => setOpen(false)}>
//             Close
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// interface CreateFileDialogContentProps {
//   parentPath: string;
//   onCreate: (path: string) => void;
// }

// function CreateFileDialogContent({
//   parentPath,
//   onCreate,
// }: CreateFileDialogContentProps) {
//   const [fileName, setFileName] = React.useState("");
//   const [error, setError] = React.useState("");
//   const files = useProjectStore((s) => s.files);

//   const handleCreate = () => {
//     if (!fileName.trim()) {
//       setError("File name is required");
//       return;
//     }

//     if (/[<>:"|?*\\\/]/.test(fileName)) {
//       setError("Invalid characters in file name");
//       return;
//     }

//     const finalName = ensureHasExtension(fileName);
//     const fullPath =
//       parentPath === "/" ? `/${finalName}` : `${parentPath}/${finalName}`;

//     if (files[fullPath]) {
//       setError(`File ${finalName} already exists`);
//       return;
//     }

//     useProjectStore.getState().setFile(fullPath, "");
//     onCreate(fullPath);
//   };

//   return (
//     <>
//       <div className="grid gap-4 py-4">
//         <div className="grid gap-2">
//           <Label htmlFor="file-name">File Name</Label>
//           <Input
//             id="file-name"
//             placeholder="component.tsx"
//             value={fileName}
//             onChange={(e) => {
//               setFileName(e.target.value);
//               setError("");
//             }}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") handleCreate();
//             }}
//             autoFocus
//             className={error ? "border-destructive" : ""}
//           />
//           {error ? (
//             <p className="text-xs text-destructive">{error}</p>
//           ) : (
//             <p className="text-xs text-muted-foreground">
//               Extension will be added automatically if not provided
//             </p>
//           )}
//         </div>
//       </div>
//       <DialogFooter>
//         <DialogClose asChild>
//           <Button variant="outline">Cancel</Button>
//         </DialogClose>
//         <Button onClick={handleCreate}>
//           <FilePlus className="w-4 h-4 mr-2" />
//           Create File
//         </Button>
//       </DialogFooter>
//     </>
//   );
// }

// interface CreateFolderDialogContentProps {
//   parentPath: string;
//   onCreate: (path: string) => void;
// }

// function CreateFolderDialogContent({
//   parentPath,
//   onCreate,
// }: CreateFolderDialogContentProps) {
//   const [folderName, setFolderName] = React.useState("");
//   const [error, setError] = React.useState("");
//   const files = useProjectStore((s) => s.files);

//   const handleCreate = () => {
//     if (!folderName.trim()) {
//       setError("Folder name is required");
//       return;
//     }

//     if (/[<>:"|?*\\\/]/.test(folderName)) {
//       setError("Invalid characters in folder name");
//       return;
//     }

//     const fullPath =
//       parentPath === "/" ? `/${folderName}` : `${parentPath}/${folderName}`;
//     const idx = `${fullPath}/index.js`;

//     if (files[idx]) {
//       onCreate(idx);
//       return;
//     }

//     useProjectStore
//       .getState()
//       .setFile(idx, "export default function() { return null; }");
//     onCreate(idx);
//   };

//   return (
//     <>
//       <div className="grid gap-4 py-4">
//         <div className="grid gap-2">
//           <Label htmlFor="folder-name">Folder Name</Label>
//           <Input
//             id="folder-name"
//             placeholder="components"
//             value={folderName}
//             onChange={(e) => {
//               setFolderName(e.target.value);
//               setError("");
//             }}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") handleCreate();
//             }}
//             autoFocus
//             className={error ? "border-destructive" : ""}
//           />
//           {error ? (
//             <p className="text-xs text-destructive">{error}</p>
//           ) : (
//             <p className="text-xs text-muted-foreground">
//               An index.js file will be created automatically
//             </p>
//           )}
//         </div>
//       </div>
//       <DialogFooter>
//         <DialogClose asChild>
//           <Button variant="outline">Cancel</Button>
//         </DialogClose>
//         <Button onClick={handleCreate}>
//           <FolderPlus className="w-4 h-4 mr-2" />
//           Create Folder
//         </Button>
//       </DialogFooter>
//     </>
//   );
// }

// function ensureHasExtension(p: string) {
//   const parts = p.split("/");
//   const last = parts[parts.length - 1] || "";
//   if (last.includes(".")) return p;
//   return p.replace(/\/$/, "") + ".js";
// }

// 

"use client";
import React from "react";
import { useProjectStore } from "@/hooks/useProjectStore";
import {
  Pencil, Trash2, ChevronDown, ChevronRight,
  FilePlus, FolderPlus, Settings, Download,
  Upload, X, AlertTriangle, Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ─── File icon badges ───────────────────────────────────────────────────────

const EXT_BADGES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  js: { label: "JS", color: "#facc15", bg: "rgba(250,204,21,0.12)", border: "rgba(250,204,21,0.25)" },
  jsx: { label: "JSX", color: "#facc15", bg: "rgba(250,204,21,0.12)", border: "rgba(250,204,21,0.25)" },
  ts: { label: "TS", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.25)" },
  tsx: { label: "TSX", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.25)" },
  css: { label: "CSS", color: "#93c5fd", bg: "rgba(147,197,253,0.10)", border: "rgba(147,197,253,0.22)" },
  scss: { label: "SCSS", color: "#f472b6", bg: "rgba(244,114,182,0.10)", border: "rgba(244,114,182,0.22)" },
  html: { label: "</>", color: "#fb923c", bg: "rgba(251,146,60,0.10)", border: "rgba(251,146,60,0.22)" },
  json: { label: "{}", color: "#fbbf24", bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.22)" },
  md: { label: "MD", color: "#a3a3a3", bg: "rgba(163,163,163,0.10)", border: "rgba(163,163,163,0.20)" },
  yaml: { label: "YML", color: "#f87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.22)" },
  yml: { label: "YML", color: "#f87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.22)" },
};

function FileBadge({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const badge = EXT_BADGES[ext] ?? {
    label: ext.toUpperCase().slice(0, 3) || "F",
    color: "rgba(240,242,245,0.4)",
    bg: "rgba(240,242,245,0.06)",
    border: "rgba(240,242,245,0.12)",
  };
  return (
    <span
      className="text-[9px] font-bold px-[5px] py-[2px] rounded border flex-shrink-0 leading-none"
      style={{ color: badge.color, background: badge.bg, borderColor: badge.border, fontFamily: "'DM Mono', monospace" }}
    >
      {badge.label}
    </span>
  );
}

// ─── Tree builder ────────────────────────────────────────────────────────────

type TreeNode =
  | { type: "file"; name: string; path: string }
  | { type: "folder"; name: string; path: string; children: TreeNode[] };

function buildTree(files: Record<string, string>): TreeNode[] {
  const root: TreeNode = { type: "folder", name: "my-app", path: "/", children: [] };
  Object.keys(files).sort().forEach((fullPath) => {
    const parts = fullPath.split("/").filter(Boolean);
    let cur: any = root;
    let acc = "";
    parts.forEach((part, idx) => {
      acc += `/${part}`;
      if (idx === parts.length - 1) {
        cur.children.push({ type: "file", name: part, path: fullPath });
      } else {
        let next = cur.children.find((c: any) => c.type === "folder" && c.name === part);
        if (!next) { next = { type: "folder", name: part, path: acc, children: [] }; cur.children.push(next); }
        cur = next;
      }
    });
  });
  function sort(n: TreeNode) {
    if (n.type === "file") return;
    n.children.sort((a, b) => a.type !== b.type ? (a.type === "folder" ? -1 : 1) : a.name.localeCompare(b.name));
    n.children.forEach(sort);
  }
  sort(root);
  return [root];
}

// ─── Inline input ─────────────────────────────────────────────────────────────

function RenameInput({ value, onCommit, onCancel }: { value: string; onCommit: (v: string) => void; onCancel: () => void }) {
  const [v, setV] = React.useState(value);
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  return (
    <input
      ref={ref}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => onCommit(v)}
      onKeyDown={(e) => { if (e.key === "Enter") onCommit(v); if (e.key === "Escape") onCancel(); }}
      onClick={(e) => e.stopPropagation()}
      className="flex-1 min-w-0 bg-[#080a0e] border border-[#c8f04b]/40 rounded px-[6px] py-[2px] text-[12px] text-[#f0f2f5] outline-none"
      style={{ fontFamily: "'DM Mono', monospace" }}
    />
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ title, description, onConfirm, onCancel }: {
  title: string; description: React.ReactNode; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#080a0e]/80 backdrop-blur-md" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.18 }}
        className="relative bg-[#0f1117] border border-white/10 rounded-xl w-full max-w-[360px] overflow-hidden"
      >
        <div className="h-[3px] bg-gradient-to-r from-red-500/80 to-red-500/20" />
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={14} className="text-red-400" />
            </div>
            <div>
              <div className="font-bold text-[14px] tracking-tight text-[#f0f2f5]" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</div>
              <div className="text-[11px] text-white/40 mt-1 leading-relaxed" style={{ fontFamily: "'DM Mono', monospace" }}>{description}</div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={onCancel} className="text-[11px] px-3 py-[7px] rounded-lg border border-white/10 text-white/40 hover:text-[#f0f2f5] hover:border-white/20 transition-all duration-150" style={{ fontFamily: "'DM Mono', monospace" }}>
              Cancel
            </button>
            <button onClick={onConfirm} className="text-[11px] px-3 py-[7px] rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-all duration-150" style={{ fontFamily: "'DM Mono', monospace" }}>
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Create file/folder modal ─────────────────────────────────────────────────

function CreateModal({ type, parentPath, onClose, onOpen }: {
  type: "file" | "folder"; parentPath: string; onClose: () => void; onOpen?: (p: string) => void;
}) {
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const files = useProjectStore((s) => s.files);

  function handleCreate() {
    if (!name.trim()) { setError(`${type === "file" ? "File" : "Folder"} name is required`); return; }
    if (/[<>:"|?*\\/]/.test(name)) { setError("Invalid characters in name"); return; }

    if (type === "file") {
      const finalName = name.includes(".") ? name : name + ".js";
      const fullPath = parentPath === "/" ? `/${finalName}` : `${parentPath}/${finalName}`;
      if (files[fullPath]) { setError(`${finalName} already exists`); return; }
      useProjectStore.getState().setFile(fullPath, "");
      onOpen?.(fullPath);
    } else {
      const fullPath = parentPath === "/" ? `/${name}` : `${parentPath}/${name}`;
      const idx = `${fullPath}/index.js`;
      useProjectStore.getState().setFile(idx, "export default function() { return null; }");
      onOpen?.(idx);
    }
    onClose();
  }

  const Icon = type === "file" ? FilePlus : FolderPlus;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#080a0e]/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.18 }}
        className="relative bg-[#0f1117] border border-white/10 rounded-xl w-full max-w-[380px] overflow-hidden"
      >
        <div className="h-[3px] bg-gradient-to-r from-[#c8f04b] to-[#c8f04b]/20" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="font-bold text-[15px] tracking-tight text-[#f0f2f5]" style={{ fontFamily: "'Syne', sans-serif" }}>
              New {type === "file" ? "File" : "Folder"}
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md border border-white/7 text-white/30 hover:text-[#f0f2f5] hover:border-white/15 transition-all">
              <X size={12} />
            </button>
          </div>

          <label className="block text-[9px] tracking-[0.12em] uppercase text-white/30 mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>
            {type === "file" ? "File Name" : "Folder Name"}
          </label>
          <input
            autoFocus
            placeholder={type === "file" ? "component.tsx" : "components"}
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className={`w-full bg-[#080a0e] rounded-lg px-3 py-[9px] text-[12px] text-[#f0f2f5] outline-none border transition-all duration-200 placeholder:text-white/20 ${error ? "border-red-500/40 focus:border-red-500/60" : "border-white/7 focus:border-[#c8f04b]/40 focus:shadow-[0_0_0_3px_rgba(200,240,75,0.06)]"
              }`}
            style={{ fontFamily: "'DM Mono', monospace" }}
          />
          {error
            ? <p className="text-[10px] text-red-400 mt-2" style={{ fontFamily: "'DM Mono', monospace" }}>{error}</p>
            : <p className="text-[10px] text-white/25 mt-2" style={{ fontFamily: "'DM Mono', monospace" }}>
              {type === "file" ? "Extension added automatically if omitted" : "An index.js will be created inside"}
            </p>
          }

          <div className="flex gap-2 justify-end mt-5 pt-4 border-t border-white/7">
            <button onClick={onClose} className="text-[11px] px-3 py-[7px] rounded-lg border border-white/10 text-white/40 hover:text-[#f0f2f5] hover:border-white/20 transition-all" style={{ fontFamily: "'DM Mono', monospace" }}>
              Cancel
            </button>
            <button onClick={handleCreate} className="inline-flex items-center gap-[6px] text-[11px] px-3 py-[7px] rounded-lg bg-[#c8f04b]/10 border border-[#c8f04b]/25 text-[#c8f04b] hover:bg-[#c8f04b]/18 transition-all" style={{ fontFamily: "'DM Mono', monospace" }}>
              <Icon size={11} /> Create
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Context menu ─────────────────────────────────────────────────────────────

function CtxMenu({ x, y, items, onClose }: {
  x: number; y: number;
  items: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[];
  onClose: () => void;
}) {
  React.useEffect(() => {
    const handler = () => onClose();
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed z-[300] bg-[#0f1117] border border-white/10 rounded-xl py-1 shadow-2xl min-w-[160px]"
      style={{ top: y, left: x }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => { item.onClick(); onClose(); }}
          className={`w-full flex items-center gap-[10px] px-3 py-[7px] text-[11px] transition-colors duration-100 ${item.danger
            ? "text-red-400 hover:bg-red-500/10"
            : "text-white/50 hover:text-[#f0f2f5] hover:bg-white/5"
            }`}
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ─── NodeView ────────────────────────────────────────────────────────────────

function NodeView({ node, depth, activeFile, onOpen, onRename, onDelete }: {
  node: TreeNode; depth: number; activeFile?: string;
  onOpen?: (p: string) => void;
  onRename?: (oldP: string, newP: string) => void;
  onDelete?: (p: string) => void;
}) {
  const [open, setOpen] = React.useState(depth === 0);
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);
  const [showCreate, setShowCreate] = React.useState<"file" | "folder" | null>(null);
  const [ctx, setCtx] = React.useState<{ cx: number; cy: number } | null>(null);

  function handleRename(newName: string) {
    setIsRenaming(false);
    if (!newName.trim() || newName === node.name) return;
    if (node.type === "file") {
      onRename?.(node.path, node.path.replace(/[^/]+$/, newName));
    } else {
      const dir = node.path.substring(0, node.path.lastIndexOf("/"));
      const newPath = dir === "" ? `/${newName}` : `${dir}/${newName}`;
      useProjectStore.getState().renameFolder(node.path, newPath);
      onRename?.(node.path, newPath);
    }
  }

  const isActive = node.type === "file" && activeFile === node.path;
  const indent = depth * 14 + 8;

  const fileCtxItems = [
    { label: "Rename", icon: <Pencil size={11} />, onClick: () => setIsRenaming(true) },
    { label: "Delete", icon: <Trash2 size={11} />, onClick: () => setShowDelete(true), danger: true },
  ];

  const folderCtxItems = [
    { label: "New File", icon: <FilePlus size={11} />, onClick: () => setShowCreate("file") },
    { label: "New Folder", icon: <FolderPlus size={11} />, onClick: () => setShowCreate("folder") },
    { label: "Rename", icon: <Pencil size={11} />, onClick: () => setIsRenaming(true) },
    { label: "Delete", icon: <Trash2 size={11} />, onClick: () => setShowDelete(true), danger: true },
  ];

  const row = (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.12 }}
      style={{ paddingLeft: indent, fontFamily: "'DM Mono', monospace" }}
      onContextMenu={(e) => { e.preventDefault(); setCtx({ cx: e.clientX, cy: e.clientY }); }}
      onClick={() => {
        if (isRenaming) return;
        if (node.type === "file") onOpen?.(node.path);
        else setOpen((s) => !s);
      }}
      className={`group flex items-center gap-[7px] pr-2 py-[5px] rounded-md cursor-pointer text-[12px] transition-all duration-150 select-none ${isActive
          ? "bg-[rgba(200,240,75,0.09)] text-[#f0f2f5]"
          : "text-white/50 hover:text-white/80 hover:bg-white/5"
        }`}
    >
      {node.type === "folder" ? (
        <span className="text-white/25 flex-shrink-0 transition-transform duration-200" style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>
          <ChevronDown size={12} />
        </span>
      ) : (
        <FileBadge name={node.name} />
      )}

      {isRenaming ? (
        <RenameInput value={node.name} onCommit={handleRename} onCancel={() => setIsRenaming(false)} />
      ) : (
        <>
          <span className={`truncate flex-1 ${node.type === "folder" ? "font-medium text-white/60 group-hover:text-white/85" : ""}`}>
            {node.name}
          </span>
          {isActive && (
            <span className="w-[5px] h-[5px] rounded-full bg-[#c8f04b] flex-shrink-0" style={{ boxShadow: "0 0 6px rgba(200,240,75,0.6)" }} />
          )}
        </>
      )}
    </motion.div>
  );

  return (
    <div className="relative">
      {row}

      {/* context menu */}
      <AnimatePresence>
        {ctx && (
          <CtxMenu
            x={ctx.cx} y={ctx.cy}
            items={node.type === "file" ? fileCtxItems : folderCtxItems}
            onClose={() => setCtx(null)}
          />
        )}
      </AnimatePresence>

      {/* delete confirm */}
      <AnimatePresence>
        {showDelete && (
          <ConfirmDialog
            title={`Delete ${node.type === "file" ? "File" : "Folder"}`}
            description={<>Delete <strong className="text-white/70">{node.name}</strong>{node.type === "folder" ? " and all its contents" : ""}? This cannot be undone.</>}
            onConfirm={() => {
              onDelete?.(node.path);
              toast.success(`${node.type === "file" ? "File" : "Folder"} deleted`, { description: `${node.name} has been deleted.` });
              setShowDelete(false);
            }}
            onCancel={() => setShowDelete(false)}
          />
        )}
      </AnimatePresence>

      {/* create modal */}
      <AnimatePresence>
        {showCreate && node.type === "folder" && (
          <CreateModal
            type={showCreate}
            parentPath={node.path}
            onClose={() => setShowCreate(null)}
            onOpen={onOpen}
          />
        )}
      </AnimatePresence>

      {/* children */}
      {/* children */}
      {node.type === "folder" && (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {/* indent guide line */}
              <div className="relative">
                <div
                  className="absolute top-0 bottom-0 w-px bg-white/10"
                  style={{ left: depth * 14 + 15 }}
                />
                {node.children.map((c, i) => (
                  <NodeView key={c.path || i} node={c} depth={depth + 1} activeFile={activeFile} onOpen={onOpen} onRename={onRename} onDelete={onDelete} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── Project settings modal ───────────────────────────────────────────────────

function ProjectSettingsModal({ onClose }: { onClose: () => void }) {
  const saveProject = useProjectStore((s) => s.saveProject);
  const loadProject = useProjectStore((s) => s.loadProject);
  const listProjects = useProjectStore((s) => s.listProjects);
  const [tab, setTab] = React.useState<"load" | "save">("load");
  const [projectId, setProjectId] = React.useState("");
  const [savedList, setSavedList] = React.useState<string[]>([]);

  React.useEffect(() => { setSavedList(listProjects()); }, [listProjects]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#080a0e]/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.18 }}
        className="relative bg-[#0f1117] border border-white/10 rounded-xl w-full max-w-[420px] overflow-hidden"
      >
        <div className="h-[3px] bg-gradient-to-r from-[#c8f04b] to-[#c8f04b]/20" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="font-bold text-[15px] tracking-tight text-[#f0f2f5]" style={{ fontFamily: "'Syne', sans-serif" }}>Project Settings</div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md border border-white/7 text-white/30 hover:text-[#f0f2f5] hover:border-white/15 transition-all">
              <X size={12} />
            </button>
          </div>

          {/* tabs */}
          <div className="flex gap-1 p-1 bg-white/4 rounded-lg mb-5">
            {(["load", "save"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-[7px] text-[11px] rounded-md transition-all duration-200 capitalize ${tab === t ? "bg-[#151820] text-[#f0f2f5] shadow-sm" : "text-white/35 hover:text-white/60"
                  }`}
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "load" && (
            <div className="space-y-3">
              <label className="block text-[9px] tracking-[0.12em] uppercase text-white/30 mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>Saved Projects</label>
              <div className="max-h-[180px] overflow-y-auto space-y-1">
                {savedList.length === 0 ? (
                  <div className="text-center py-8 text-[11px] text-white/25" style={{ fontFamily: "'DM Mono', monospace" }}>No saved projects yet</div>
                ) : savedList.map((id) => (
                  <button
                    key={id}
                    onClick={() => setProjectId(id)}
                    className={`w-full text-left px-3 py-[8px] rounded-lg text-[12px] border transition-all duration-150 ${projectId === id
                      ? "bg-[rgba(200,240,75,0.08)] border-[rgba(200,240,75,0.2)] text-[#c8f04b]"
                      : "border-white/5 text-white/50 hover:text-white/80 hover:bg-white/4"
                      }`}
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {id}
                  </button>
                ))}
              </div>
              <button
                disabled={!projectId}
                onClick={() => {
                  loadProject(projectId);
                  toast.success("Project loaded", { description: `"${projectId}" loaded successfully.` });
                  onClose();
                }}
                className="w-full inline-flex items-center justify-center gap-2 mt-2 py-[9px] rounded-lg text-[11px] font-medium bg-[#c8f04b]/10 border border-[#c8f04b]/20 text-[#c8f04b] hover:bg-[#c8f04b]/18 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                <Upload size={12} /> Load Project
              </button>
            </div>
          )}

          {tab === "save" && (
            <div className="space-y-3">
              <label className="block text-[9px] tracking-[0.12em] uppercase text-white/30 mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>Project Name</label>
              <input
                autoFocus
                placeholder="my-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && projectId.trim() && (() => {
                  saveProject(projectId);
                  toast.success("Project saved", { description: `"${projectId}" saved.` });
                  setSavedList(listProjects());
                  setProjectId("");
                })()}
                className="w-full bg-[#080a0e] border border-white/7 rounded-lg px-3 py-[9px] text-[12px] text-[#f0f2f5] outline-none focus:border-[#c8f04b]/40 transition-all placeholder:text-white/20"
                style={{ fontFamily: "'DM Mono', monospace" }}
              />
              <button
                disabled={!projectId.trim()}
                onClick={() => {
                  saveProject(projectId);
                  toast.success("Project saved", { description: `"${projectId}" saved.` });
                  setSavedList(listProjects());
                  setProjectId("");
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-[9px] rounded-lg text-[11px] font-medium bg-[#c8f04b]/10 border border-[#c8f04b]/20 text-[#c8f04b] hover:bg-[#c8f04b]/18 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                <Download size={12} /> Save Project
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Toolbar (main export) ────────────────────────────────────────────────────

export default function Toolbar({ activeFile, onOpen, onRename, onDelete }: {
  activeFile?: string;
  onOpen?: (path: string) => void;
  onRename?: (oldP: string, newP: string) => void;
  onDelete?: (p: string) => void;
}) {
  const files = useProjectStore((s) => s.files);
  const tree = React.useMemo(() => buildTree(files), [files]);
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <>
      <div
        className="h-full flex flex-col w-60 border-r border-white/7 bg-[#080a0e]"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/7">
          <span className="text-[10px] tracking-[0.14em] uppercase text-white/30 font-medium">Explorer</span>
          <button
            onClick={() => setShowSettings(true)}
            className="w-6 h-6 flex items-center justify-center rounded-md text-white/25 hover:text-[#c8f04b] hover:bg-[rgba(200,240,75,0.08)] transition-all duration-200"
          >
            <Settings size={12} />
          </button>
        </div>

        {/* tree */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
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
      </div>

      <AnimatePresence>
        {showSettings && <ProjectSettingsModal onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </>
  );
}