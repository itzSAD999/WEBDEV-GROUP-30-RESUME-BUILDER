import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { VideoCard } from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Share2, Flag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import heroGradient from "@/assets/hero-gradient.jpg";
import thumb1 from "@/assets/thumb1.jpg";
import thumb2 from "@/assets/thumb2.jpg";
import thumb3 from "@/assets/thumb3.jpg";
import thumb4 from "@/assets/thumb4.jpg";

const relatedVideos = [
  {
    id: "2",
    thumbnail: thumb1,
    title: "Building Modern Web Apps",
    channel: "TechMaster",
    views: "1.2M views",
    timestamp: "2 days ago",
  },
  {
    id: "3",
    thumbnail: thumb2,
    title: "Epic Gaming Moments",
    channel: "ProGamer",
    views: "850K views",
    timestamp: "1 week ago",
  },
  {
    id: "4",
    thumbnail: thumb3,
    title: "Relaxing Music Mix",
    channel: "MusicVibes",
    views: "2.1M views",
    timestamp: "3 days ago",
  },
  {
    id: "5",
    thumbnail: thumb4,
    title: "Gourmet Recipes",
    channel: "ChefLife",
    views: "640K views",
    timestamp: "5 days ago",
  },
];

const Watch = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <img
                src={heroGradient}
                alt="Video player"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">
                Amazing Video Title - Must Watch!
              </h1>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-muted-foreground">
                  1.2M views • 2 days ago
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    123K
                  </Button>
                  <Button variant="secondary" size="sm">
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Dislike
                  </Button>
                  <Button variant="secondary" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="secondary" size="sm">
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Channel Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                  TM
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">TechMaster</h3>
                  <p className="text-sm text-muted-foreground">2.5M subscribers</p>
                </div>
                <Button>Subscribe</Button>
              </div>

              {/* Description */}
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm text-foreground">
                  This is an amazing video that you won't want to miss! In this video, we explore
                  incredible content that will blow your mind. Make sure to like, subscribe, and
                  hit the notification bell for more awesome content!
                </p>
              </div>

              {/* Comments */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">1,234 Comments</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-bold">
                        U{i}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">@user{i}</span>
                          <span className="text-xs text-muted-foreground">2 days ago</span>
                        </div>
                        <p className="text-sm">
                          Great video! Really enjoyed the content and learned a lot.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Related Videos</h3>
            <div className="space-y-3">
              {relatedVideos.map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Watch;
