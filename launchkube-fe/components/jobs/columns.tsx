"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  ExternalLink,
  Logs,
  MoreHorizontal,
  RefreshCcw,
} from "lucide-react";
import { Button } from "../ui/button";
import { Job } from "@/lib/generated/prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Id
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "repoUrl",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Repository
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const repoUrl = row.getValue("repoUrl") as string;

      const repoName = repoUrl?.split("/").pop()?.replace(".git", "");

      return <div>{repoName}</div>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { id, status } = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <span className="sr-only">Open</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              disabled={status === "PENDING"}
            >
              <Logs className="mr-2 h-4 w-4" />
              Check Logs
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              disabled={status === "PENDING" || status === "RUNNING"}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              disabled={
                status === "PENDING" ||
                status === "RUNNING" ||
                status === "FAILED"
              }
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
