import React from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  audioUrl: string;
  artwork: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  artwork: string;
  tracks: Track[];
  spotifyUrl: string;
  isCustom?: boolean;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isHint?: boolean;
}

export interface UserProfile {
  email: string;
  name: string;
  picture: string;
}

export interface BackgroundPreset {
  id: string;
  name: string;
  type: "animated" | "gradient" | "uploaded" | "video";
  class: string;
  description: string;
  videoUrl?: string;
  isDark?: boolean;
  style?: React.CSSProperties;
}
