import { Navbar } from "@/components/Navbar";
import { CategoryTabs } from "@/components/CategoryTabs";
import { VideoCard } from "@/components/VideoCard";
import thumb1 from "@/assets/thumb1.jpg";
import thumb2 from "@/assets/thumb2.jpg";
import thumb3 from "@/assets/thumb3.jpg";
import thumb4 from "@/assets/thumb4.jpg";
import thumb5 from "@/assets/thumb5.jpg";
import thumb6 from "@/assets/thumb6.jpg";

const videos = [
  {
    id: "1",
    thumbnail: thumb1,
    title: "Building Modern Web Apps with React and TypeScript",
    channel: "TechMaster",
    views: "1.2M views",
    timestamp: "2 days ago",
  },
  {
    id: "2",
    thumbnail: thumb2,
    title: "Epic Gaming Montage - Best Moments 2024",
    channel: "ProGamer",
    views: "850K views",
    timestamp: "1 week ago",
  },
  {
    id: "3",
    thumbnail: thumb3,
    title: "Relaxing Music Mix - Deep Focus Beats",
    channel: "MusicVibes",
    views: "2.1M views",
    timestamp: "3 days ago",
  },
  {
    id: "4",
    thumbnail: thumb4,
    title: "5-Minute Gourmet Recipes You Need to Try",
    channel: "ChefLife",
    views: "640K views",
    timestamp: "5 days ago",
  },
  {
    id: "5",
    thumbnail: thumb5,
    title: "Hidden Paradise - Top 10 Beaches in the World",
    channel: "TravelDiaries",
    views: "920K views",
    timestamp: "1 week ago",
  },
  {
    id: "6",
    thumbnail: thumb6,
    title: "Full Body Workout - 30 Minutes No Equipment",
    channel: "FitnessPro",
    views: "1.5M views",
    timestamp: "4 days ago",
  },
  // Duplicate for more content
  {
    id: "7",
    thumbnail: thumb1,
    title: "Advanced JavaScript Patterns Explained",
    channel: "TechMaster",
    views: "780K views",
    timestamp: "6 days ago",
  },
  {
    id: "8",
    thumbnail: thumb2,
    title: "Ultimate Gaming Setup Tour 2024",
    channel: "ProGamer",
    views: "1.1M views",
    timestamp: "3 days ago",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryTabs />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
