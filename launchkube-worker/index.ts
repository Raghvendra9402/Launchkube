import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { spawn } from "child_process";
import { prisma } from "./lib/db";

const client = new SQSClient({
  region: "ap-south-1",
});

const qUrl = process.env.AWS_QUEUE_URL!;

type EnvVarType = {
  key: string;
  value: string;
};

async function runCommand(
  repoUrl: string,
  jobId: string,
  type: string,
  envVariables: EnvVarType[],
) {
  return new Promise((resolve, reject) => {
    let buffer = "";

    const child = spawn("./command.sh", [
      repoUrl,
      jobId,
      JSON.stringify(envVariables),
      type,
    ]);

    const flush = async () => {
      if (!buffer) return;

      try {
        await prisma.jobLog.create({
          data: {
            id: crypto.randomUUID(),
            jobId,
            message: buffer,
          },
        });
      } catch (err) {
        console.error("Log write failed:", err);
      }

      buffer = "";
    };

    child.stdout.on("data", async (data) => {
      const log = data.toString();
      buffer += log;

      process.stdout.write(log);

      buffer += `[INFO] ${log}`;

      if (buffer.length > 500) {
        flush();
      }
    });

    child.stderr.on("data", (data) => {
      const log = data.toString();

      process.stderr.write(log);

      buffer += `[ERROR] ${log}`;

      if (buffer.length > 500) {
        flush();
      }
    });

    child.on("error", async (err) => {
      console.error("Spawn error:", err);

      buffer += `[ERROR] ${err.message}\n`;
      await flush();

      reject(err);
    });

    child.on("close", async (code) => {
      await flush();

      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });
  });
}

async function getMessage() {
  console.log("polling started");
  while (true) {
    try {
      const command = {
        QueueUrl: qUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20,
      };
      const data = await client.send(new ReceiveMessageCommand(command));
      if (data.Messages && data.Messages.length > 0) {
        const message = data.Messages[0];
        console.log(`Message received from queue...`);
        const body = JSON.parse(message?.Body!);
        console.log(body);

        //main-logic
        console.log("📩 Received job:", body.jobId);

        await prisma.job.update({
          where: {
            id: body.jobId,
          },
          data: {
            status: "RUNNING",
          },
        });

        try {
          await runCommand(
            body.repoUrl,
            body.jobId,
            body.envVariables,
            body.type,
          );

          await prisma.job.update({
            where: { id: body.jobId },
            data: { status: "SUCCESS" },
          });

          console.log("Job success");
        } catch (error) {
          console.error("❌ Job failed:", error);

          await prisma.job.update({
            where: { id: body.jobId },
            data: { status: "FAILED" },
          });
        }

        await client.send(
          new DeleteMessageCommand({
            QueueUrl: qUrl,
            ReceiptHandle: message?.ReceiptHandle!,
          }),
        );

        console.log("Message deleted....");
      } else {
        console.log("No message in queue");
      }
    } catch (error) {
      console.error(`Error while receiving messages from SQS: ${error}`);
    }
  }
}

getMessage();
