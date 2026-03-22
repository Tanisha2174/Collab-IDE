import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function processFileType(file: string) {
  const ext = file.split('.').pop();
  if (ext === "ts" || ext == "tsx") return "typescript";
  if (ext === "js" || ext == "jsx") return "javascript";

  if (ext) return ext;
  return "plaintext";
}


export function decodeTerminalResponse(buffer: Buffer): string {
  return buffer.toString("utf-8");
}


export function validateName(
  newName: string,
  oldName: string,
  type: "file" | "folder"
) {
  if (newName === oldName || newName.length===0) {
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

  return true;
}