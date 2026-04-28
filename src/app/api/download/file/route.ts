import { NextRequest, NextResponse } from "next/server";
import { getJob, cleanupJob } from "@/lib/download-manager";
import { existsSync, createReadStream, statSync } from "fs";

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("id");

  if (!jobId) {
    return NextResponse.json({ error: "Job ID required" }, { status: 400 });
  }

  const job = getJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.status !== "done") {
    return NextResponse.json({ error: "Download not complete" }, { status: 400 });
  }

  if (!existsSync(job.filePath)) {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }

  try {
    const fileStat = statSync(job.filePath);
    const isAudio = job.filePath.endsWith(".mp3");
    const ext = job.filePath.split(".").pop() || "mp4";

    // Stream the file instead of reading entirely into memory
    const nodeStream = createReadStream(job.filePath);
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk: any) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        nodeStream.on("end", () => {
          controller.close();
          // Clean up temp file after stream finishes
          setTimeout(() => cleanupJob(jobId), 10000);
        });
        nodeStream.on("error", (err) => {
          controller.error(err);
        });
      },
      cancel() {
        nodeStream.destroy();
      },
    });

    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": isAudio ? "audio/mpeg" : "video/mp4",
        "Content-Disposition": `attachment; filename="download.${ext}"`,
        "Content-Length": fileStat.size.toString(),
      },
    });
  } catch (err: any) {
    console.error("File serve error:", err.message);
    return NextResponse.json({ error: "Failed to serve file: " + err.message }, { status: 500 });
  }
}

export const runtime = "nodejs";
