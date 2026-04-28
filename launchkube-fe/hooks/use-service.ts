import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useSendUrl = () => {
  const trpc = useTRPC();
  const router = useRouter();
  return useMutation(
    trpc.send.mutationOptions({
      onSuccess: (data) => {
        toast.success("Your project is lined up for deploy successfully");
        router.push(`/project/${data.jobId}`);
      },
      onError: () => {
        toast.error("Something went wrong while sending message!");
      },
    }),
  );
};

export const useGetStatus = (jobId: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.getStatus.queryOptions(
      { jobId: jobId },
      {
        refetchInterval(query) {
          const data = query.state.data;
          if (!data || data.status === "PENDING" || data.status === "RUNNING") {
            return 100;
          } else {
            return false;
          }
        },
      },
    ),
  );
};

export const useGetProjectLogs = (jobId: string) => {
  const trpc = useTRPC();

  return useQuery(
    trpc.getLogs.queryOptions(
      { jobId },
      {
        refetchInterval: 1000,
      },
    ),
  );
};
