import { spawn, type ChildProcess } from "child_process";
import { tmpdir } from "os";
import { join, dirname } from "path";
import { unlink, readdir } from "fs/promises";
import { randomUUID } from "crypto";
import { existsSync } from "fs";

export interface DownloadJob {
  id: string;
  url: string;
  status: "pending" | "downloading" | "merging" | "done" | "error";
  progress: number;
  speed: string;
  eta: string;
  fileSize: string;
  filePath: string;
  error?: string;
  process?: ChildProcess;
  createdAt: number;
}

const jobs = new Map<string, DownloadJob>();

// Clean up old jobs every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.createdAt > 30 * 60 * 1000) {
      if (job.filePath && existsSync(job.filePath)) {
        unlink(job.filePath).catch(() => {});
      }
      jobs.delete(id);
    }
  }
}, 10 * 60 * 1000);

export function getJob(id: string): DownloadJob | undefined {
  return jobs.get(id);
}

export function startDownload(opts: {
  url: string;
  formatId?: string;
  audioOnly?: boolean;
  bitrate?: string;
  platform?: string;
}): string {
  const id = randomUUID().slice(0, 12);
  const ext = opts.audioOnly ? "mp3" : "mp4";
  const filePath = join(tmpdir(), `dl-${id}.${ext}`);

  const job: DownloadJob = {
    id,
    url: opts.url,
    status: "pending",
    progress: 0,
    speed: "",
    eta: "",
    fileSize: "",
    filePath,
    createdAt: Date.now(),
  };

  jobs.set(id, job);

  const args: string[] = [
    opts.url,
    "-o", filePath,
    "--no-check-certificates",
    "--no-warnings",
    "--no-playlist",
    "--newline",
    "--progress",
    "--progress-template", "%(progress._percent_str)s|%(progress._speed_str)s|%(progress._eta_str)s|%(progress._total_bytes_str)s",
  ];

  if (opts.audioOnly) {
    args.push("-x", "--audio-format", "mp3");
    if (opts.bitrate) {
      args.push("--audio-quality", opts.bitrate === "320" ? "0" : "5");
    }
  } else if (opts.formatId) {
    args.push("-f", `${opts.formatId}+bestaudio/best`);
    args.push("--merge-output-format", "mp4");
  } else {
    args.push("-f", "best[ext=mp4]/best");
  }

  try {
    const proc = spawn("yt-dlp", args, { stdio: ["ignore", "pipe", "pipe"] });
    job.process = proc;
    job.status = "downloading";

    let detectedFilePath = "";

    proc.stdout?.on("data", (data: Buffer) => {
      const lines = data.toString().split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Capture destination file from yt-dlp output
        const destMatch = trimmed.match(/\[download\] Destination:\s*(.+)/);
        if (destMatch) {
          detectedFilePath = destMatch[1].trim();
        }

        // Capture merged output path
        const mergeMatch = trimmed.match(/\[Merger\] Merging formats into "(.+)"/);
        if (mergeMatch) {
          detectedFilePath = mergeMatch[1].trim();
        }

        // Parse progress template output
        if (trimmed.includes("|")) {
          const parts = trimmed.split("|");
          if (parts.length >= 1) {
            const pct = parseFloat(parts[0].replace("%", "").trim());
            if (!isNaN(pct)) {
              job.progress = Math.min(pct, 100);
            }
          }
          if (parts.length >= 2) job.speed = parts[1]?.trim() || "";
          if (parts.length >= 3) job.eta = parts[2]?.trim() || "";
          if (parts.length >= 4) job.fileSize = parts[3]?.trim() || "";
        }

        // Also parse default yt-dlp percentage lines like "[download]  45.2% of ..."
        const defaultPct = trimmed.match(/\[download\]\s+([\d.]+)%/);
        if (defaultPct) {
          const pct = parseFloat(defaultPct[1]);
          if (!isNaN(pct)) job.progress = Math.min(pct, 100);
        }

        // Detect merging phase
        if (trimmed.includes("[Merger]") || trimmed.includes("Merging")) {
          job.status = "merging";
          job.progress = 99;
        }

        // Detect extraction/conversion
        if (trimmed.includes("[ExtractAudio]") || trimmed.includes("Post-process")) {
          job.status = "merging";
          job.progress = 95;
        }
      }
    });

    proc.stderr?.on("data", (data: Buffer) => {
      const msg = data.toString().trim();
      // yt-dlp uses stderr for some info lines too, only capture real errors
      if (msg.includes("ERROR")) {
        job.error = msg.split("ERROR:").pop()?.trim() || msg;
      }
    });

    proc.on("close", async (code) => {
      job.process = undefined;
      if (code === 0) {
        // Try detected path first, then check common variations
        const candidatePaths = [
          detectedFilePath,
          filePath,
        ];

        // Add common extension variations
        const base = filePath.replace(/\.[^.]+$/, "");
        for (const ext of [".mp4", ".mp3", ".mkv", ".webm", ".m4a", ".opus"]) {
          candidatePaths.push(base + ext);
          candidatePaths.push(filePath + ext);
        }

        // Also scan temp dir for files with our ID
        try {
          const tempDir = dirname(filePath);
          const prefix = `dl-${id}`;
          const files = await readdir(tempDir);
          for (const f of files) {
            if (f.startsWith(prefix)) {
              candidatePaths.push(join(tempDir, f));
            }
          }
        } catch {}

        let found = false;
        for (const p of candidatePaths) {
          if (p && existsSync(p)) {
            job.filePath = p;
            found = true;
            break;
          }
        }

        job.status = found ? "done" : "error";
        if (!found) job.error = "Downloaded file not found at expected path";
        job.progress = found ? 100 : 0;
      } else {
        job.status = "error";
        job.error = job.error || "Download failed with exit code " + code;
      }
    });

    proc.on("error", (err) => {
      job.process = undefined;
      job.status = "error";
      job.error = err.message;
    });
  } catch (err: any) {
    job.status = "error";
    job.error = err.message;
  }

  return id;
}

export function cleanupJob(id: string) {
  const job = jobs.get(id);
  if (job) {
    if (job.filePath && existsSync(job.filePath)) {
      unlink(job.filePath).catch(() => {});
    }
    jobs.delete(id);
  }
}
