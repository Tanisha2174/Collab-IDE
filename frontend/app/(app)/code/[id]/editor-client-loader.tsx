"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import the CodeEditor with SSR turned off
const CodeEditor = dynamic(() => import('@/components/editor'), {
  ssr: false,
  // Optional: Add a loading component
  loading: () => <p>Loading Editor...</p>, 
});

// Define the props your CodeEditor needs
interface EditorLoaderProps {
  userId: string;
  virtualboxId: string;
}

export default function EditorLoader({ userId, virtualboxId }: EditorLoaderProps) {
  // Pass the props down to the actual CodeEditor component
  return <CodeEditor userId={userId} virtualboxId={virtualboxId} />;
}