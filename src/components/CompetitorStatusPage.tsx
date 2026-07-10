import Link from "next/link";
import { CheckCircle2, XCircle, AlertCircle, Zap, ArrowRight } from "lucide-react";

export interface CompetitorConfig {
  name: string;
  url: string;
  slug: string;
  headline: string;
  description: string;
  alternativeHref: string;
  alternativeLabel: string;
}

interface Props {
  config: CompetitorConfig;
  status: { up: boolean; statusCode: number; responseTimeMs: number; checkedAt: string; error?: string } | null;
}

export default function CompetitorStatusPage({ config, status }: Props) {
  return (
    <main className="min-h-screen gradient-bg animate-gradient">
      <header className="sticky top-0 z-50 w-full glass-strong">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
              DropZap
            </span>
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 pt-16 pb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Is <span className="text-purple-400">{config.name}</span> down?
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          {config.description}
        </p>

        {status ? (
          <div
            className={`rounded-2xl border px-6 py-8 mb-8 ${
              status.up
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-red-500/30 bg-red-500/10"
            }`}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              {status.up ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              ) : (
                <XCircle className="h-8 w-8 text-red-400" />
              )}
              <span className="text-2xl font-bold">
                {status.up ? `${config.name} is up` : `${config.name} appears down`}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              HTTP {status.statusCode} · {status.responseTimeMs}ms · checked {status.checkedAt}
            </p>
            {!status.up && (
              <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3 text-left">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">
                  We could not reach {config.name} from our server. That does not guarantee it is down for everyone, but it is a strong signal.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-8 mb-8">
            <p className="text-muted-foreground">Status check is temporarily unavailable. Try refreshing the page.</p>
          </div>
        )}

        <div className="glass rounded-2xl p-8 text-left">
          <h2 className="text-2xl font-bold mb-3">Use DropZap instead</h2>
          <p className="text-muted-foreground mb-6">
            {config.headline} DropZap is free, works when competitors are down, and downloads without watermark.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={config.alternativeHref}
              className="inline-flex items-center justify-center gap-2 h-14 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition-transform"
            >
              {config.alternativeLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 h-14 px-6 rounded-xl font-bold border-2 border-purple-500/50 hover:bg-purple-500/10 transition-colors"
            >
              Go to DropZap Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
