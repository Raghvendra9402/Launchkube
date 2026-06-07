import { z } from "zod";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { getSQSClient } from "@/lib/sqs";
import prisma from "@/lib/db";

export const appRouter = createTRPCRouter({
  send: protectedProcedure
    .input(
      z.object({
        repoUrl: z.url("Repo URL needed.").min(1),
        preset: z.enum(["nextjs", "nodejs"]),
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
    .mutation(async ({ input, ctx }) => {
      const { repoUrl, envVariables, preset } = input;

      const jobId = crypto.randomUUID();

      await prisma.job.create({
        data: {
          id: jobId,
          userId: ctx.auth.user.id,
          repoUrl,
          status: "PENDING",
        },
      });

      const qUrl = process.env.AWS_QUEUE_URL;

      const command = {
        QueueUrl: qUrl,
        MessageBody: JSON.stringify({
          jobId,
          repoUrl: repoUrl,
          envVariables: envVariables,
          type: preset,
        }),
      };

      await getSQSClient().send(new SendMessageCommand(command));

      return {
        success: true,
        jobId,
      };
    }),

  getStatus: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      return prisma.job.findFirst({
        where: {
          id: input.jobId,
        },
      });
    }),

  getLogs: protectedProcedure
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

  getJobs: protectedProcedure.query(({ ctx }) => {
    return prisma.job.findMany({
      where: {
        userId: ctx.auth.user.id,
      },
    });
  }),
});
export type AppRouter = typeof appRouter;
