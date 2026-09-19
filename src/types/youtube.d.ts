interface Window {
  YT: typeof YT;
  onYouTubeIframeAPIReady: () => void;
}

declare namespace YT {
  class Player {
    constructor(el: string | HTMLElement, options: PlayerOptions);
    playVideo(): void;
    pauseVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getCurrentTime(): number;
    destroy(): void;
  }
  interface PlayerOptions {
    videoId: string;
    playerVars?: Record<string, string | number>;
    events?: {
      onReady?: (e: PlayerEvent) => void;
      onStateChange?: (e: PlayerEvent) => void;
    };
  }
  interface PlayerEvent {
    target: Player;
    data?: number;
  }
}