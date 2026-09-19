"use client";

import { useEffect, useRef } from "react";

interface AudioPlayerProps {
  active: boolean;
}

const YOUTUBE_ID = "8QF9hM1MQwc";
const LOOP_START = 0;   // seconds
const LOOP_END = 12;    // seconds

export default function AudioPlayer({ active }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!active || mountedRef.current) return;
    mountedRef.current = true;

    // Load the YouTube IFrame API script once
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const initPlayer = () => {
      if (!containerRef.current) return;

      // Create a div inside the container for the player to attach to
      const div = document.createElement("div");
      div.id = `yt-player-${Math.random().toString(36).slice(2)}`;
      containerRef.current.appendChild(div);

      playerRef.current = new window.YT.Player(div.id, {
        videoId: YOUTUBE_ID,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          loop: 0,        // we handle looping manually for precision
          start: LOOP_START,
          mute: 0,
        },
        events: {
          onReady: (e: YT.PlayerEvent) => {
            e.target.playVideo();
            // Poll every 200ms and reset when we hit LOOP_END
            intervalRef.current = setInterval(() => {
              const player = playerRef.current;
              if (!player) return;
              const t = player.getCurrentTime?.();
              if (t !== undefined && t >= LOOP_END) {
                player.seekTo(LOOP_START, true);
                player.playVideo();
              }
            }, 200);
          },
        },
      });
    };

    // Wait for the API to be ready — may already be ready
    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      playerRef.current?.destroy();
      playerRef.current = null;
      mountedRef.current = false;
    };
  }, [active]);

  // When active turns false, pause
  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      playerRef.current?.pauseVideo();
      playerRef.current?.destroy();
      playerRef.current = null;
      mountedRef.current = false;
    }
  }, [active]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
      }}
    />
  );
}