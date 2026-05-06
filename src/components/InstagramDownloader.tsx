"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SimpleDownloader from "@/components/SimpleDownloader";
import { isValidInstagramUrl } from "@/lib/utils";
import { Film, Images } from "lucide-react";

/**
 * Instagram has two distinct download flows that benefit from a clearer UI
 * split: video content (Reels / video posts / IGTV) goes through the unified
 * /api/stream pipeline, while still images (single photo posts and multi-slide
 * carousels) need /api/instagram/photos which returns either the raw JPG or
 * a zip of every carousel slide. Surfacing the choice as two tabs lets us
 * (a) tell the user up front what each tab handles, (b) keep the per-tab
 * placeholder + helper text precise, and (c) avoid confusing fallthrough
 * where pasting a photo URL into the video flow returned an opaque error.
 */
export default function InstagramDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  return (
    <Tabs defaultValue="reels" className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-11 mb-4 bg-foreground/[0.04] border border-foreground/10 p-1">
        <TabsTrigger
          value="reels"
          className="gap-2 text-sm font-semibold rounded-md transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-pink-600 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-pink-600/30"
        >
          <Film className="h-4 w-4" />
          Reels &amp; Videos
        </TabsTrigger>
        <TabsTrigger
          value="photos"
          className="gap-2 text-sm font-semibold rounded-md transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-pink-600 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-pink-600/30"
        >
          <Images className="h-4 w-4" />
          Photos &amp; Carousels
        </TabsTrigger>
      </TabsList>

      <TabsContent value="reels" className="mt-0">
        <SimpleDownloader
          platform="Instagram"
          filePrefix="instagram-reel"
          mediaTypeLabel="Reel / Video MP4"
          placeholder="Paste Instagram Reel, video post, or IGTV URL..."
          validate={isValidInstagramUrl}
          buttonClassName="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 shadow-pink-600/30"
          help="Downloads Instagram Reels, video posts, and IGTV in original HD quality."
          onDownload={onDownload}
        />
      </TabsContent>

      <TabsContent value="photos" className="mt-0">
        <SimpleDownloader
          platform="Instagram"
          filePrefix="instagram-photo"
          mediaTypeLabel="Photo / Carousel"
          placeholder="Paste Instagram photo or carousel post URL..."
          validate={isValidInstagramUrl}
          buttonClassName="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 shadow-pink-600/30"
          help="Single photo → JPG. Multi-image carousel → ZIP of every slide."
          onDownload={onDownload}
          endpoint="/api/instagram/photos"
          fileExtension="zip"
        />
      </TabsContent>
    </Tabs>
  );
}
