"use client";

import { useEffect, useRef } from "react";
import { useGetProjectLogs, useGetStatus } from "@/hooks/use-service";
import {
  CheckCheck,
  CheckCircle,
  Loader2,
  Rocket,
  TriangleAlert,
} from "lucide-react";
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

  return (
    <div className="h-screen flex flex-col gap-y-4 items-center justify-center px-4">
      <div>
        {data?.status === "PENDING" && (
          <div className="flex flex-row items-center gap-x-2">
            <Rocket className="size-6" />
            Your project is lined up for deployment
          </div>
        )}

        {data?.status === "RUNNING" && (
          <div className="flex flex-row items-center gap-x-2">
            <Loader2 className="size-6 animate-spin" />
            Your project is building
          </div>
        )}

        {data?.status === "FAILED" && (
          <div className="flex flex-row items-center gap-x-2">
            <TriangleAlert className="size-6 text-red-500" />
            Your project has failed.
          </div>
        )}

        {data?.status === "SUCCESS" && (
          <div className="flex flex-row items-center gap-x-2">
            <CheckCheck className="size-6 text-emerald-400" />
            Your project is deployed.
            <Link
              href={`http://app-${projectId}.rsxdev.co.in`}
              target="_blank"
              className="text-blue-500 underline"
            >
              Visit Your Site
            </Link>
          </div>
        )}
      </div>

      {(data?.status === "RUNNING" || data?.status === "FAILED") && (
        <div className="w-full max-w-4xl bg-black h-96 rounded-lg border p-4 overflow-y-auto text-sm">
          {logs?.flatMap((log, logIdx) =>
            log.message.split("\n").map((line, lineIdx) => {
              const key = `${logIdx}-${lineIdx}`;

              let color = "text-gray-400";
              const trimmed = line.trim();

              if (trimmed.startsWith("[ERROR]")) color = "text-red-400";
              else if (trimmed.startsWith("[INFO]")) color = "text-blue-400";
              else if (
                trimmed.startsWith("[WARN]") ||
                trimmed.includes("WARNING")
              )
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
      )}
    </div>
  );
}
