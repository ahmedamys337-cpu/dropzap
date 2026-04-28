import { NextRequest } from "next/server";
import { spawn } from "child_process";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const format = request.nextUrl.searchParams.get("f") || "best";
  const filename = request.nextUrl.searchParams.get("name") || "download.mp4";
  const audio = request.nextUrl.searchParams.get("audio") === "1";
  const expectedSize = request.nextUrl.searchParams.get("size");

  if (!url) {
    return new Response("URL required", { status: 400 });
  }

  const fmtArg = audio
    ? "bestaudio[ext=m4a]/bestaudio"
    : format !== "best" ? format : "best[ext=mp4]/best";

  const ext = audio ? "m4a" : "mp4";
  const safeName = filename.replace(/[^\w\s.-]/g, "").trim() || `download.${ext}`;

  try {
    const args: string[] = [
      url, "-o", "-",
      "--no-check-certificates", "--no-warnings", "--no-playlist",
      "-f", fmtArg,
    ];

    const proc = spawn("yt-dlp", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let errorMsg = "";
    proc.stderr?.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      if (text.includes("ERROR")) errorMsg += text;
    });

    const stream = new ReadableStream({
      start(controller) {
        proc.stdout?.on("data", (chunk: Buffer) => {
          try { controller.enqueue(new Uint8Array(chunk)); } catch {}
        });
        proc.stdout?.on("end", () => {
          try { controller.close(); } catch {}
        });
        proc.stdout?.on("error", () => {
          try { controller.close(); } catch {}
        });
        proc.on("error", () => {
          try { controller.close(); } catch {}
        });
      },
      cancel() {
        proc.kill("SIGTERM");
      },
    });

    const headers: Record<string, string> = {
      "Content-Type": audio ? "audio/mp4" : "video/mp4",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "no-store",
    };

    // Use client-provided filesize for Content-Length (enables progress bar)
    if (expectedSize && parseInt(expectedSize) > 0) {
      headers["Content-Length"] = expectedSize;
    }

    return new Response(stream, { status: 200, headers });
  } catch (err: any) {
    return new Response("Download failed: " + err.message, { status: 500 });
  }
}
