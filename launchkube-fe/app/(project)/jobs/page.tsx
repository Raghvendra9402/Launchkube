"use client";

import { columns } from "@/components/jobs/columns";
import { DataTable } from "@/components/jobs/data-table";
import { useGetJobs } from "@/hooks/use-service";

export default function JobsPage() {
  const { data = [] } = useGetJobs();
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
