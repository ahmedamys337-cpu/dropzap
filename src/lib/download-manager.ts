// Check if we're in a build environment
const isBuildTime = typeof window !== "undefined" || process.env.NEXT_PHASE === "phase-production-build";

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
  process?: any;
  createdAt: number;
}

let jobs: Map<string, DownloadJob> | null = null;
let cleanupInterval: NodeJS.Timeout | null = null;

function getJobs(): Map<string, DownloadJob> {
  if (jobs) return jobs;
  if (isBuildTime) {
    jobs = new Map();
    return jobs;
  }
  jobs = new Map();
  
  // Clean up old jobs every 10 minutes
  if (!cleanupInterval) {
    const { existsSync } = require("fs");
    const { unlink } = require("fs/promises");
    const jobsRef = jobs; // Capture reference for closure
    cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [id, job] of jobsRef) {
        if (now - job.createdAt > 30 * 60 * 1000) {
          if (job.filePath && existsSync(job.filePath)) {
            unlink(job.filePath).catch(() => {});
          }
          jobsRef.delete(id);
        }
      }
    }, 10 * 60 * 1000);
    cleanupInterval.unref();
  }
  
  return jobs;
}

export function getJob(id: string): DownloadJob | undefined {
  return getJobs().get(id);
}

export function startDownload(opts: {
  url: string;
  formatId?: string;
  audioOnly?: boolean;
  bitrate?: string;
  platform?: string;
}): string {
  if (isBuildTime) return "build-stub";
  
  const { randomUUID } = require("crypto");
  const { join } = require("path");
  const { tmpdir } = require("os");
  const { spawn } = require("child_process");
  const { existsSync } = require("fs");
  const { readdir } = require("fs/promises");
  const { dirname } = require("path");
  const { unlink } = require("fs/promises");
  
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

  getJobs().set(id, job);

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

        const destMatch = trimmed.match(/\[download\] Destination:\s*(.+)/);
        if (destMatch) {
          detectedFilePath = destMatch[1].trim();
        }

        const mergeMatch = trimmed.match(/\[Merger\] Merging formats into "(.+)"/);
        if (mergeMatch) {
          detectedFilePath = mergeMatch[1].trim();
        }

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

        const defaultPct = trimmed.match(/\[download\]\s+([\d.]+)%/);
        if (defaultPct) {
          const pct = parseFloat(defaultPct[1]);
          if (!isNaN(pct)) job.progress = Math.min(pct, 100);
        }

        if (trimmed.includes("[Merger]") || trimmed.includes("Merging")) {
          job.status = "merging";
          job.progress = 99;
        }

        if (trimmed.includes("[ExtractAudio]") || trimmed.includes("Post-process")) {
          job.status = "merging";
          job.progress = 95;
        }
      }
    });

    proc.stderr?.on("data", (data: Buffer) => {
      const msg = data.toString().trim();
      if (msg.includes("ERROR")) {
        job.error = msg.split("ERROR:").pop()?.trim() || msg;
      }
    });

    proc.on("close", async (code: any) => {
      job.process = undefined;
      if (code === 0) {
        const candidatePaths = [
          detectedFilePath,
          filePath,
        ];

        const base = filePath.replace(/\.[^.]+$/, "");
        for (const ext of [".mp4", ".mp3", ".mkv", ".webm", ".m4a", ".opus"]) {
          candidatePaths.push(base + ext);
          candidatePaths.push(filePath + ext);
        }

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

    proc.on("error", (err: any) => {
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
  if (isBuildTime) return;
  
  const { existsSync } = require("fs");
  const { unlink } = require("fs/promises");
  
  const job = getJobs().get(id);
  if (job) {
    if (job.filePath && existsSync(job.filePath)) {
      unlink(job.filePath).catch(() => {});
    }
    getJobs().delete(id);
  }
}
