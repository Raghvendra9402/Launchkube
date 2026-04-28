"use client";

import { useEffect, useRef } from "react";
import { useGetProjectLogs, useGetStatus } from "@/hooks/use-service";
import { CheckCircle, Loader2, TriangleAlert } from "lucide-react";
import Link from "next/link";

interface ProjectPageProps {
  projectId: string;
}

export function ProjectPage({ projectId }: ProjectPageProps) {
  const { data } = useGetStatus(projectId);
  const { data: logs } = useGetProjectLogs(projectId);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const renderLogs = () => (
    <div className="w-full bg-black text-white rounded-lg border p-4 h-125 overflow-y-auto font-mono text-sm shadow">
      {logs?.flatMap((log, logIdx) =>
        log.message.split("\n").map((line, lineIdx) => {
          const key = `${logIdx}-${lineIdx}`;

          let color = "text-gray-300";
          const trimmed = line.trim();

          if (trimmed.startsWith("[ERROR]")) color = "text-red-400";
          else if (trimmed.startsWith("[INFO]")) color = "text-blue-400";
          else if (trimmed.startsWith("[WARN]") || trimmed.includes("WARNING"))
            color = "text-yellow-400";
          else if (trimmed.includes("DONE")) color = "text-green-400";

          return (
            <div key={key} className={`${color} whitespace-pre-wrap`}>
              {line}
            </div>
          );
        }),
      )}
      <div ref={bottomRef} />
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-[60vh] px-4">
      <div className="w-full max-w-3xl space-y-4">
        {/* STATUS HEADER */}
        <div className="flex items-center gap-2 text-sm font-medium">
          {data?.status === "RUNNING" && (
            <>
              <Loader2 className="size-5 animate-spin text-blue-500" />
              <span>Building your project...</span>
            </>
          )}

          {data?.status === "FAILED" && (
            <>
              <TriangleAlert className="size-5 text-red-500" />
              <span>Build failed</span>
            </>
          )}

          {data?.status === "SUCCESS" && (
            <>
              <CheckCircle className="size-5 text-green-500" />
              <span>Build successful</span>
            </>
          )}
        </div>

        {/* LOGS */}
        {(data?.status === "RUNNING" || data?.status === "FAILED") &&
          renderLogs()}

        {/* SUCCESS CARD */}
        {data?.status === "SUCCESS" && (
          <div className="p-4 border rounded-lg bg-green-50 text-green-700">
            <p className="font-medium">Your app is live 🚀</p>
            <Link href={`https://app-${projectId}.rsxdev.co.in`}>
              {`https://app-${projectId}.rsxdev.co.in`}
            </Link>
          </div>
        )}

        {/* FALLBACK */}
        {!data?.status && (
          <div className="text-center text-muted-foreground">
            Project not found
            <Link
              href="/"
              className="px-4 py-2 rounded border text-sm hover:bg-gray-100"
            >
              Go Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
