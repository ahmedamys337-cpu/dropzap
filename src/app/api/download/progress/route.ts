import { NextRequest } from "next/server";
import { getJob } from "@/lib/download-manager";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("id");

  if (!jobId) {
    return new Response(JSON.stringify({ error: "Job ID required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        const job = getJob(jobId);

        if (!job) {
          const data = JSON.stringify({ status: "error", error: "Job not found" });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          clearInterval(interval);
          controller.close();
          return;
        }

        const data = JSON.stringify({
          status: job.status,
          progress: job.progress,
          speed: job.speed,
          eta: job.eta,
          fileSize: job.fileSize,
          error: job.error,
        });

        controller.enqueue(encoder.encode(`data: ${data}\n\n`));

        if (job.status === "done" || job.status === "error") {
          clearInterval(interval);
          controller.close();
        }
      }, 500);

      // Timeout after 10 minutes
      setTimeout(() => {
        clearInterval(interval);
        try { controller.close(); } catch {}
      }, 10 * 60 * 1000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
