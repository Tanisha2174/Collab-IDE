"use client";

import { Button } from "../../components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../../components/ui/resizable";
import { Editor, OnMount } from "@monaco-editor/react";
import { FileJson, Plus, SquareTerminal, X } from "lucide-react";
import monaco from "monaco-editor"
import { useEffect, useRef, useState } from "react";
import SideBar from "./sidebar";
import { useClerk } from "@clerk/nextjs";
import Tab from "../ui/tab";
import { TFile, TFolder, TTab } from "./sidebar/types";
import { io, Socket } from "socket.io-client";
import { processFileType } from "@/lib/utils";
import { toast } from "sonner";
import EditorTerminal from "./terminal";

export default function CodeEditor({
    userId,
    virtualboxId,
}: {
    userId: string,
    virtualboxId: string,
}) {

    const editorRef = useRef<null | Parameters<OnMount>[0]>(null);

    const clerk = useClerk()
    const [socket, setSocket] = useState<Socket | null>(null);

    const [tabs, setTabs] = useState<TTab[]>([])
    const [activeId, setActiveId] = useState<string | null>(null);
    const [files, setFiles] = useState<(TFile | TFolder)[]>([]);
    const [editorLanguage, setEditorLanguage] = useState<string | undefined>(undefined);
    const [activeFile, setActiveFile] = useState<string | null>(null);
    const [terminals, setTerminals] = useState<string[]>([]);


    useEffect(() => {
        const newSocket = io("http://localhost:4000", {
            query: { userId, virtualboxId, type: "react" },
        });
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [userId, virtualboxId]);


    useEffect(() => {
        if (!socket) return;
        function onLoadedEvent(initialFiles: (TFile | TFolder)[]) {
            console.log("Files loaded from server:", initialFiles);
            setFiles(initialFiles);
        }

        const onConnect = () => { }

        const onDisconnect = () => { }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        socket.on("loaded", onLoadedEvent);

        return () => {
            socket.off("loaded", onLoadedEvent);
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, [socket]);

    const selectFile = (tab: TTab) => {
        const exists = tabs.find((t) => t.id === tab.id);
        setTabs((prev) => {
            if (exists) {
                setActiveId(exists.id)
                return prev
            }
            return [...prev, tab];
        })
        socket?.emit("getFile", tab.id, (response: string) => {
            setActiveFile(response);
        });
        setEditorLanguage(processFileType(tab.name));
        setActiveId(tab.id);
    }

    const closeTab = (tab: TFile) => {
        const numTabs = tabs.length
        const index = tabs.findIndex((t) => t.id === tab.id)
        if (index === -1) return;


        const nextId = activeId === tab.id ? numTabs === 1 ? null : index < numTabs - 1 ? tabs[index + 1].id : tabs[index - 1].id : activeId;
        const nextTab = tabs.find((t) => t.id === nextId);
        if (nextTab) selectFile(nextTab);
        else setActiveFile(null);

        setTabs((prev) => prev.filter((t) => t.id !== tab.id));
    }

    const handleEditorMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
    }


    const handleRename = (
        id: string,
        newName: string,
        oldName: string,
        type: "file" | "folder"
    ) => {
        if (newName === oldName) {
            return false;
        }
        if (
            newName.includes("/") ||
            newName.includes("\\") ||
            newName.includes(" ") ||
            (type === "file" && !newName.includes(".")) ||
            (type === "folder" && newName.includes("."))
        ) {
            toast.error("Invalid file name");
            return false;
        }

        socket?.emit("renameFile", id, newName);

        setTabs((prev) =>
            prev.map((tab) => (tab.id === id ? { ...tab, name: newName } : tab))
        );

        return true;
    };

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                const activeTab = tabs.find((tab) => tab.id === activeId);
                setTabs((prev) =>
                    prev.map((tab) =>
                        tab.id === activeId ? { ...tab, saved: true } : tab
                    )
                );
                socket?.emit("saveFile", activeId, editorRef.current?.getValue());
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [activeId, tabs]);

    const handleDeleteFile = (file: TFile) => {
        socket?.emit("deleteFile", file.id, (response: (TFolder | TFile)[]) => {
            setFiles(response);
        })
        closeTab(file);
    }

    const handleDeleteFolder = (folder: TFolder) => {

    }


    return (
        socket ? (
            <>
                <SideBar files={files} selectFile={selectFile} handleRename={handleRename} handleDeleteFile={handleDeleteFile} handleDeleteFolder={handleDeleteFolder} socket={socket} addNew={(name, type) => {
                    if (type === "file") {
                        setFiles((prev) => [
                            ...prev,
                            { id: `projects/${virtualboxId}/${name}`, name, type: "file" }
                        ]);
                    } else {
                        console.log("adding folder");
                    }
                }} />
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel maxSize={75} minSize={30} defaultSize={60} className="flex flex-col p-2">
                        <div className="h-10 w-full flex gap-2">
                            {tabs.map((tab) => (
                                <Tab key={tab.id} saved={tab.saved} selected={activeId === tab.id} onClick={() => selectFile(tab)} onClose={() => closeTab(tab)}>
                                    {tab.name}
                                </Tab>
                            ))}
                        </div>
                        <div className="grow w-full overflow-hidden rounded-lg">
                            {activeId === null ? (
                                <>
                                    <div className="flex items-center justify-center w-full h-full text-xl font-medium text-secondary select-none">
                                        <FileJson className="w-6 h-6 mr-3" />
                                        No File selected
                                    </div>
                                </>
                            ) :
                                clerk.loaded ? (
                                    <Editor height={"100%"} defaultLanguage="typescript" theme="vs-dark"
                                        onMount={handleEditorMount} onChange={(value) => {
                                            setTabs((prev) => prev.map((tab) => tab.id === activeId ? { ...tab, saved: false } : tab));
                                        }} language={editorLanguage}
                                        options={{
                                            minimap: {
                                                enabled: false
                                            },
                                            padding: {
                                                bottom: 4, top: 4,
                                            },
                                            scrollBeyondLastLine: false,
                                            fixedOverflowWidgets: true,
                                        }}
                                        value={activeFile ?? ""}
                                    />
                                ) : null
                            }

                        </div>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={40}>
                        <ResizablePanelGroup direction="vertical">
                            <ResizablePanel defaultSize={50} minSize={20} className="p-2 flex flex-col">
                                <div className="h-10 w-full flex gap-2">
                                    <Button variant={"secondary"} size={"sm"} className="min-w-20 justify-between">
                                        localhost:3000<X className="w-3 h-3" />
                                    </Button>
                                </div>
                                <div className="w-full rounded-lg bg-foreground"></div>
                            </ResizablePanel>
                            <ResizableHandle />
                            <ResizablePanel defaultSize={50} minSize={20} className="p-2 flex flex-col gap-2">
                                <div className="h-10 w-full flex gap-2">
                                    <Tab selected> 
                                        <SquareTerminal className="w-4 h-4 mr-2"/>
                                        Shell
                                    </Tab>
                                    <Button size={"smIcon"} variant={"secondary"} className="font-normal select-none text-muted-foreground">
                                        <Plus className="w-4 h-4"/>
                                    </Button>
                                </div>
                                <div className="w-full relative rounded-lg bg-secondary">
                                    {socket ? <EditorTerminal socket={socket} /> : null}
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </>
        ) : (
            <div>Connecting to server...</div>
        )
    )
}

