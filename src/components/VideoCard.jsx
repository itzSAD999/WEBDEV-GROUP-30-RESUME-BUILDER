import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

interface VideoCardProps {
  id: string;
  thumbnail: string;
  title: string;
  channel: string;
  views: string;
  timestamp: string;
}

export const VideoCard = ({ id, thumbnail, title, channel, views, timestamp }: VideoCardProps) => {
  return (
    <Link to={`/watch/${id}`}>
      <Card className="group overflow-hidden border-0 bg-transparent hover:bg-card/50 transition-all duration-300">
        <div className="relative overflow-hidden rounded-lg aspect-video mb-3">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            12:34
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{channel}</p>
          <p className="text-sm text-muted-foreground">
            {views} • {timestamp}
          </p>
        </div>
      </Card>
    </Link>
  );
};
