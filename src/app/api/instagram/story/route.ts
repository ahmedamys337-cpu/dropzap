import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { fetchInstagramStories } from "@/lib/instagram";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface StoryItem {
  type: "image" | "video";
  url: string;
  thumbnail?: string;
}

interface StoryResult {
  username: string;
  stories: StoryItem[];
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.success) {
    return NextResponse.json(
      { error: `Rate limited. Try again in ${limit.retryAfter}s` },
      { status: 429 }
    );
  }

  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Accept both story URLs and profile URLs
    const isValidUrl = /instagram\.com\/(stories\/[^\/]+|[^\/\?]+)$/i.test(url);
    if (!isValidUrl) {
      return NextResponse.json(
        { error: "Please provide a valid Instagram Story URL (e.g., instagram.com/stories/username/story_id) or profile URL (e.g., instagram.com/username)" },
        { status: 400 }
      );
    }

    logger.log(`[instagram:story] Fetching stories for: ${url}`);
    const result = await fetchInstagramStories(url);
    
    if (!result) {
      throw new Error("Could not fetch Instagram stories. The user may not have active stories or the account is private.");
    }

    // Convert to the format expected by the frontend
    const stories: StoryItem[] = [];
    
    for (const imgUrl of result.images) {
      stories.push({
        type: "image",
        url: imgUrl,
      });
    }

    for (const vidUrl of result.videos) {
      stories.push({
        type: "video",
        url: vidUrl,
      });
    }

    logger.log(`[instagram:story] Found ${stories.length} stories for @${result.username}`);

    return NextResponse.json({
      username: result.username,
      stories,
    });
  } catch (err: any) {
    logger.error("[instagram:story] Error:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch Instagram stories. Stories may be expired or private." },
      { status: 500 }
    );
  }
}
