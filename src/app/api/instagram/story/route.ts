import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { fetchInstagramMedia, extractIgShortcode, isInstagramStoryUrl } from "@/lib/instagram";
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

async function fetchInstagramStories(url: string): Promise<StoryResult> {
  // Extract username from story URL
  const usernameMatch = url.match(/instagram\.com\/stories\/([^\/]+)/i);
  const username = usernameMatch ? usernameMatch[1] : "unknown";

  // Use the existing Instagram media extraction
  const media = await fetchInstagramMedia(url);
  if (!media) {
    throw new Error("Could not fetch Instagram story data");
  }

  const stories: StoryItem[] = [];

  // Add images
  for (const imgUrl of media.images) {
    stories.push({
      type: "image",
      url: imgUrl,
    });
  }

  // Add video if exists
  if (media.video) {
    stories.push({
      type: "video",
      url: media.video,
    });
  }

  return {
    username,
    stories,
  };
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

    if (!isInstagramStoryUrl(url)) {
      return NextResponse.json(
        { error: "Please provide a valid Instagram Story URL (e.g., instagram.com/stories/username/story_id)" },
        { status: 400 }
      );
    }

    logger.log(`[instagram:story] Fetching stories for: ${url}`);
    const result = await fetchInstagramStories(url);
    logger.log(`[instagram:story] Found ${result.stories.length} stories for @${result.username}`);

    return NextResponse.json(result);
  } catch (err: any) {
    logger.error("[instagram:story] Error:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch Instagram stories. Stories may be expired or private." },
      { status: 500 }
    );
  }
}
