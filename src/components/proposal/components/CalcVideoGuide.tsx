"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const YT_ID = "Ui89g6mua0o";
const YT_THUMB = `https://img.youtube.com/vi/${YT_ID}/maxresdefault.jpg`;

export function CalcVideoGuide({ label = "Calculator budget guide" }: { label?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [fs, setFs] = useState(false);

  const play = useCallback(() => setPlaying(true), []);

  const toggleFs = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
      setFs(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setFs(false);
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) setFs(false);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <div className="calc-video" ref={wrapRef}>
      <div className="calc-video-inner">
        <div className="calc-video-label">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" />
          </svg>
          <span>{label}</span>
        </div>
        <div className="calc-video-frame">
          {playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${YT_ID}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&iv_load_policy=3&disablekb=0&fs=0`}
              title={label}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <button type="button" className="calc-video-poster" onClick={play} aria-label={label ? `Play ${label}` : "Play video"}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={YT_THUMB} alt="" loading="lazy" />
              <span className="calc-video-play" aria-hidden>
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </button>
          )}
        </div>
        <button
          type="button"
          className="calc-video-fs"
          onClick={toggleFs}
          aria-label={fs ? "Exit fullscreen" : "Fullscreen"}
          title={fs ? "Exit fullscreen" : "Fullscreen"}
        >
          {fs ? (
            <svg viewBox="0 0 24 24" aria-hidden><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
          )}
        </button>
      </div>
    </div>
  );
}
