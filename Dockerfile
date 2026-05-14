# =============================================================================
# Stage 1: Dependencies
# =============================================================================
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# =============================================================================
# Stage 2: Builder
# =============================================================================
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# Accept Next.js NEXT_PUBLIC_* env vars at build time.
# These get baked into the client JS bundle by `next build`, so they MUST be
# present during the build (not just runtime). Render automatically forwards
# service env vars as Docker build args when declared with ARG below.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_ADSENSE_CLIENT
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
ARG NEXT_PUBLIC_BING_SITE_VERIFICATION
# Per-slot AdSense unit IDs. Unused until AdSense reapproval lands; once
# the env vars are set on Render the next build picks them up and
# AdBanner will start serving AdSense in preference to A-ads.
ARG NEXT_PUBLIC_ADSENSE_SLOT_TOP
ARG NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE
ARG NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM
ARG NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR
# A-ads (anonymousads.com) per-slot unit IDs. These are the active
# revenue path until AdSense is approved. They MUST be declared as
# build args (not just runtime env) because Next.js inlines all
# NEXT_PUBLIC_* values into the client bundle during `next build`.
ARG NEXT_PUBLIC_AADS_SLOT_TOP
ARG NEXT_PUBLIC_AADS_SLOT_MIDDLE
ARG NEXT_PUBLIC_AADS_SLOT_BOTTOM
ARG NEXT_PUBLIC_AADS_SLOT_SIDEBAR
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID}
ENV NEXT_PUBLIC_ADSENSE_CLIENT=${NEXT_PUBLIC_ADSENSE_CLIENT}
ENV NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=${NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION}
ENV NEXT_PUBLIC_BING_SITE_VERIFICATION=${NEXT_PUBLIC_BING_SITE_VERIFICATION}
ENV NEXT_PUBLIC_ADSENSE_SLOT_TOP=${NEXT_PUBLIC_ADSENSE_SLOT_TOP}
ENV NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE=${NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE}
ENV NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM=${NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM}
ENV NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=${NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR}
ENV NEXT_PUBLIC_AADS_SLOT_TOP=${NEXT_PUBLIC_AADS_SLOT_TOP}
ENV NEXT_PUBLIC_AADS_SLOT_MIDDLE=${NEXT_PUBLIC_AADS_SLOT_MIDDLE}
ENV NEXT_PUBLIC_AADS_SLOT_BOTTOM=${NEXT_PUBLIC_AADS_SLOT_BOTTOM}
ENV NEXT_PUBLIC_AADS_SLOT_SIDEBAR=${NEXT_PUBLIC_AADS_SLOT_SIDEBAR}

RUN npm run build

# =============================================================================
# Stage 3: Runtime (slim production image)
# =============================================================================
FROM node:20-slim AS runner
WORKDIR /app

# Install runtime system deps: ffmpeg + ca-certs.
# yt-dlp is installed in its own layer below so we can bust its cache
# independently — Render aggressively caches Docker layers, and a stale
# yt-dlp binary is the #1 reason HD downloads silently regress (YouTube
# ships anti-bot updates ~weekly, yt-dlp ships counter-fixes ~daily).
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Bump YTDLP_CACHEBUST any time you want to force a fresh nightly pull.
# (Render's "Clear build cache & deploy" also works, but this is more
# reliable when the cache decision is per-layer.)
ARG YTDLP_CACHEBUST=2026-05-06-1
RUN echo "ytdlp cachebust: $YTDLP_CACHEBUST" \
    && curl -fsSL https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp_linux \
       -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && /usr/local/bin/yt-dlp --version

# Create non-root user
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

# Copy Next.js standalone output (only what's needed to run)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

# Healthcheck (used by Docker / Render / Fly)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
