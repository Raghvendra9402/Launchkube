import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { getSQSClient } from "@/lib/sqs";
import prisma from "@/lib/db";

export const appRouter = createTRPCRouter({
  send: baseProcedure
    .input(
      z.object({
        repoUrl: z.url(),
        envVariables: z
          .array(
            z.object({
              key: z
                .string()
                .min(1, "Key is required")
                .regex(/^[A-Z_]+$/, "Use uppercase env keys like API_KEY"),
              value: z.string().min(1, "Value cannot be empty."),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { repoUrl, envVariables } = input;

      const jobId = crypto.randomUUID();

      await prisma.job.create({
        data: {
          id: jobId,
          repoUrl,
          status: "PENDING",
        },
      });

      const qUrl =
        "https://sqs.ap-south-1.amazonaws.com/864899840088/ez-deploy-queue";

      const command = {
        QueueUrl: qUrl,
        MessageBody: JSON.stringify({
          jobId,
          repoUrl: repoUrl,
          envVariables: envVariables,
        }),
      };

      await getSQSClient().send(new SendMessageCommand(command));

      return {
        success: true,
        jobId,
      };
    }),

  getStatus: baseProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      return prisma.job.findFirst({
        where: {
          id: input.jobId,
        },
      });
    }),

  getLogs: baseProcedure
    .input(
      z.object({
        jobId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return prisma.jobLog.findMany({
        where: {
          jobId: input.jobId,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 500,
      });
    }),
});
export type AppRouter = typeof appRouter;
