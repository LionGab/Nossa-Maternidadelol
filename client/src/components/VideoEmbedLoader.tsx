import { useState } from "react";
import { Play, Loader2 } from "lucide-react";

interface VideoEmbedLoaderProps {
  children: React.ReactNode;
  platform: "tiktok" | "instagram";
}

export function VideoEmbedLoader({ children, platform }: VideoEmbedLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative min-h-[500px]">
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm rounded-lg">
          <div className="text-center space-y-4 p-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full bg-pink-accent/20 animate-ping"></div>
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-pink-accent to-primary flex items-center justify-center">
                <Play className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando vídeo...
              </p>
              <p className="text-xs text-muted-foreground">
                {platform === "tiktok" ? "Conectando ao TikTok" : "Conectando ao Instagram"}
              </p>
            </div>
            {/* Skeleton */}
            <div className="mt-4 space-y-3">
              <div className="h-3 bg-muted rounded-full w-3/4 mx-auto animate-pulse"></div>
              <div className="h-3 bg-muted rounded-full w-1/2 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Actual Embed - Hidden until loaded */}
      <div 
        className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
      >
        {children}
      </div>
      
      {/* Timeout fallback - show content after 8 seconds regardless */}
      {isLoading && (
        <div className="hidden" ref={(el) => {
          if (el) {
            setTimeout(() => setIsLoading(false), 8000);
          }
        }} />
      )}
    </div>
  );
}
