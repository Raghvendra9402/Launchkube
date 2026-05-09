"use client";

import { columns } from "@/components/jobs/columns";
import { DataTable } from "@/components/jobs/data-table";
import { useGetJobs } from "@/hooks/use-service";

export default function JobsPage() {
  const { data = [] } = useGetJobs();
  return (
    <div className="py-10 px-4">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
