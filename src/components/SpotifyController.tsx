import React, { useState, useEffect, useRef } from "react";
import { Playlist, Track } from "../types";
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, Plus, Trash2, CheckSquare, Square, ExternalLink, LogIn, RefreshCw } from "lucide-react";
import { PRESET_PLAYLISTS } from "../constants";

const SpotifyIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.377-1.454-5.37-1.783-8.893-.98-.336.075-.67-.138-.746-.473-.075-.335.138-.67.473-.746 3.854-.88 7.15-.5 9.816 1.135.295.18.387.563.207.857zm1.225-2.72c-.227.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.075-1.185-.413.125-.847-.11-.973-.523-.125-.413.11-.847.523-.973 3.666-1.114 8.233-.567 11.34 1.345.367.228.487.708.26 1.075zm.105-2.822C14.422 8.71 8.653 8.52 5.315 9.533c-.514.156-1.053-.135-1.21-.65-.155-.513.136-1.052.65-1.21 3.84-1.164 10.224-.94 14.25 1.45.462.274.613.874.34 1.336-.273.46-.874.612-1.336.34z"/>
  </svg>
);

interface SpotifyControllerProps {
  initialPlaylists: Playlist[];
  onTrackChange?: (trackName: string | null) => void;
}

export default function SpotifyController({ initialPlaylists, onTrackChange }: SpotifyControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(() => localStorage.getItem("spotify_token"));
  const [spotifyUser, setSpotifyUser] = useState<{ name: string; id: string } | null>(null);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [devTokenInput, setDevTokenInput] = useState("");

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    // Start with preset playlists
    const all = [...PRESET_PLAYLISTS];
    initialPlaylists.forEach((initP) => {
      if (!all.some((p) => p.id === initP.id)) {
        all.push(initP);
      }
    });
    return all;
  });

  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>(() => {
    return [PRESET_PLAYLISTS[0].id];
  });

  // Track state
  const [currentQueue, setCurrentQueue] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.4);

  // New compact custom playlist state
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistUrl, setNewPlaylistUrl] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Set up window postMessage listener for real popup OAuth success
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "OAUTH_AUTH_SUCCESS" && event.data.token) {
        const token = event.data.token;
        localStorage.setItem("spotify_token", token);
        setSpotifyToken(token);
        setIsTokenModalOpen(false);
      }
    };
    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, []);

  // Fetch real Spotify playlists and user profile if token is present
  useEffect(() => {
    if (!spotifyToken) {
      setSpotifyUser(null);
      // Revert back to defaults
      setPlaylists(PRESET_PLAYLISTS);
      setSelectedPlaylistIds([PRESET_PLAYLISTS[0].id]);
      return;
    }

    const loadSpotifyData = async () => {
      setIsLoadingPlaylists(true);
      try {
        // 1. Fetch user profile
        const userRes = await fetch("https://api.spotify.com/v1/me", {
          headers: { Authorization: `Bearer ${spotifyToken}` },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setSpotifyUser({ name: userData.display_name, id: userData.id });
        } else if (userRes.status === 401) {
          // Token expired
          handleDisconnect();
          return;
        }

        // 2. Fetch user playlists
        const playlistsRes = await fetch("https://api.spotify.com/v1/me/playlists?limit=25", {
          headers: { Authorization: `Bearer ${spotifyToken}` },
        });

        if (playlistsRes.ok) {
          const data = await playlistsRes.json();
          const spotifyPlaylists: Playlist[] = data.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || `My Spotify Playlist`,
            artwork: item.images?.[0]?.url || "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=300&auto=format&fit=crop&q=60",
            spotifyUrl: item.external_urls?.spotify || `https://open.spotify.com/playlist/${item.id}`,
            tracks: [], // Will load tracks on selection dynamically
            isCustom: true,
          }));

          // Merge presets and Spotify playlists
          setPlaylists([...PRESET_PLAYLISTS, ...spotifyPlaylists]);
          if (spotifyPlaylists.length > 0) {
            setSelectedPlaylistIds([spotifyPlaylists[0].id]);
          }
        }
      } catch (err) {
        console.error("Error loading Spotify data:", err);
      } finally {
        setIsLoadingPlaylists(false);
      }
    };

    loadSpotifyData();
  }, [spotifyToken]);

  // Load tracks dynamically when a playlist is selected
  useEffect(() => {
    const loadTracksForSelected = async () => {
      const activeIds = selectedPlaylistIds;
      const loadedPlaylists = [...playlists];
      let updatedAny = false;

      for (let i = 0; i < loadedPlaylists.length; i++) {
        const p = loadedPlaylists[i];
        if (activeIds.includes(p.id) && p.tracks.length === 0 && spotifyToken && !p.id.startsWith("preset-")) {
          try {
            const tracksRes = await fetch(`https://api.spotify.com/v1/playlists/${p.id}/tracks?limit=15`, {
              headers: { Authorization: `Bearer ${spotifyToken}` },
            });
            if (tracksRes.ok) {
              const data = await tracksRes.json();
              const tracks: Track[] = data.items
                .filter((item: any) => item.track)
                .map((item: any, idx: number) => {
                  const t = item.track;
                  return {
                    id: t.id || `track-${p.id}-${idx}`,
                    title: t.name,
                    artist: t.artists.map((a: any) => a.name).join(", "),
                    duration: formatTime(t.duration_ms / 1000),
                    // If no preview URL, use a cozy loop track from presets to ensure audio plays
                    audioUrl: t.preview_url || PRESET_PLAYLISTS[idx % PRESET_PLAYLISTS.length].tracks[0].audioUrl,
                    artwork: t.album?.images?.[0]?.url || p.artwork,
                  };
                });

              loadedPlaylists[i] = { ...p, tracks };
              updatedAny = true;
            }
          } catch (err) {
            console.error("Error fetching tracks for playlist", p.id, err);
          }
        }
      }

      if (updatedAny) {
        setPlaylists(loadedPlaylists);
      }
    };

    if (spotifyToken) {
      loadTracksForSelected();
    }
  }, [selectedPlaylistIds, playlists, spotifyToken]);

  // Merge tracks from selected playlists to form queue
  useEffect(() => {
    const activePlaylists = playlists.filter((p) => selectedPlaylistIds.includes(p.id));
    const mergedTracks: Track[] = [];

    activePlaylists.forEach((playlist) => {
      playlist.tracks.forEach((track) => {
        if (!mergedTracks.some((t) => t.id === track.id)) {
          mergedTracks.push(track);
        }
      });
    });

    setCurrentQueue(mergedTracks);
    if (mergedTracks.length === 0) {
      setIsPlaying(false);
      setCurrentTrackIndex(0);
    } else if (currentTrackIndex >= mergedTracks.length) {
      setCurrentTrackIndex(0);
    }
  }, [selectedPlaylistIds, playlists]);

  // Handle HTML5 Audio Lifecycle
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.volume = volume;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      const currentTrack = currentQueue[currentTrackIndex];
      const isCustomUserTrack = currentTrack?.id?.startsWith("custom") || currentTrack?.id?.startsWith("spotify-");
      if (isCustomUserTrack) {
        // Stop custom track, find default Vibe playlist, load and play it
        setIsPlaying(false);
        const defaultPlaylist = playlists.find((p) => p.id === "aluminum-vibe");
        if (defaultPlaylist) {
          setCurrentQueue(defaultPlaylist.tracks);
          setCurrentTrackIndex(0);
        }
      } else {
        handleSkipForward();
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentQueue, currentTrackIndex]);

  // Load new audio source when track changes
  useEffect(() => {
    if (currentQueue.length > 0 && audioRef.current) {
      const activeTrack = currentQueue[currentTrackIndex];
      const wasPlaying = isPlaying;

      audioRef.current.src = activeTrack.audioUrl;
      audioRef.current.load();

      if (wasPlaying) {
        audioRef.current.play().catch((err) => {
          console.log("Audio play error:", err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentQueue, currentTrackIndex]);

  // Call App track callback on play state changes
  useEffect(() => {
    if (onTrackChange) {
      const activeTrack = currentQueue[currentTrackIndex];
      onTrackChange(isPlaying && activeTrack ? activeTrack.title : null);
    }
  }, [isPlaying, currentQueue, currentTrackIndex]);

  const togglePlay = () => {
    if (currentQueue.length === 0) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch((err) => console.log("Play error:", err));
      setIsPlaying(true);
    }
  };

  const handleSkipForward = () => {
    if (currentQueue.length <= 1) return;
    setCurrentTrackIndex((prev) => (prev + 1) % currentQueue.length);
  };

  const handleSkipBackward = () => {
    if (currentQueue.length <= 1) return;
    setCurrentTrackIndex((prev) => (prev - 1 + currentQueue.length) % currentQueue.length);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleTogglePlaylistSelection = (id: string) => {
    if (selectedPlaylistIds.includes(id)) {
      if (selectedPlaylistIds.length > 1) {
        setSelectedPlaylistIds(selectedPlaylistIds.filter((pId) => pId !== id));
      }
    } else {
      setSelectedPlaylistIds([...selectedPlaylistIds, id]);
    }
  };

  const handleAddPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const id = `custom-${Date.now()}`;
    const newP: Playlist = {
      id,
      name: newPlaylistName,
      description: "Custom focus soundtrack.",
      artwork: "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=300&auto=format&fit=crop&q=60",
      spotifyUrl: newPlaylistUrl.trim() || "https://open.spotify.com",
      isCustom: true,
      tracks: [
        {
          id: `track-${Date.now()}-1`,
          title: "Focus Acoustic Echoes",
          artist: "Aura Acoustic",
          duration: "4:00",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
          artwork: "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=300&auto=format&fit=crop&q=60",
        },
      ],
    };

    setPlaylists([...playlists, newP]);
    setSelectedPlaylistIds([...selectedPlaylistIds, id]);
    setNewPlaylistName("");
    setNewPlaylistUrl("");
  };

  const handleRemovePlaylist = (id: string) => {
    setPlaylists(playlists.filter((p) => p.id !== id));
    setSelectedPlaylistIds(selectedPlaylistIds.filter((pId) => pId !== id));
  };

  const handleConnectSpotify = async () => {
    try {
      const res = await fetch("/api/auth/spotify-url");
      const data = await res.json();
      if (data.configured && data.url) {
        window.open(data.url, "spotify_oauth", "width=600,height=700");
      } else {
        setIsTokenModalOpen(true);
      }
    } catch (err) {
      setIsTokenModalOpen(true);
    }
  };

  const handleSaveTokenInput = () => {
    if (devTokenInput.trim()) {
      localStorage.setItem("spotify_token", devTokenInput.trim());
      setSpotifyToken(devTokenInput.trim());
      setIsTokenModalOpen(false);
      setDevTokenInput("");
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("spotify_token");
    setSpotifyToken(null);
    setSpotifyUser(null);
  };

  const currentTrack: Track | undefined = currentQueue[currentTrackIndex];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  return (
    <div className="relative" id="spotify-controller-widget">
      {/* Spotify Float Trigger */}
      <button
        type="button"
        id="btn-spotify-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/95 hover:bg-white text-blue-600 border border-slate-200/80 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] z-40 relative group cursor-pointer font-sans text-xs font-bold"
      >
        <SpotifyIcon className={`w-4 h-4 text-orange-600 ${isPlaying ? "animate-[spin_4s_linear_infinite]" : ""}`} />
        <span>Vibe Control</span>
      </button>

      {/* Controller Drawer (Pops up above the button, compact) */}
      {isOpen && (
        <div
          id="spotify-dropdown-drawer"
          className="absolute right-0 bottom-full mb-3 w-72 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-2xl overflow-hidden z-50 text-slate-800 font-sans"
        >
          {/* Header */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <SpotifyIcon className="w-4 h-4 text-blue-600 animate-pulse" />
              <div className="font-bold text-[11px] uppercase tracking-wider text-slate-500">Aluminum Vibe</div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 text-[10px] font-bold cursor-pointer"
            >
              Close
            </button>
          </div>

          {/* Connection status */}
          <div className="px-3 py-2 bg-blue-50/30 border-b border-slate-100 flex items-center justify-between text-xs">
            {spotifyToken ? (
              <>
                <div className="flex items-center gap-1.5 text-blue-800 font-bold text-[11px]">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  <span className="truncate max-w-[130px]">Linked: {spotifyUser?.name || "Spotify"}</span>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-[9px] text-orange-600 hover:underline font-bold"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <>
                <span className="text-slate-500 text-[10px]">Connect Spotify account</span>
                <button
                  type="button"
                  onClick={handleConnectSpotify}
                  className="flex items-center gap-1 text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded-lg font-bold transition-all shadow-sm"
                >
                  <LogIn className="w-3 h-3" /> Link
                </button>
              </>
            )}
          </div>

          {/* Current track player segment */}
          <div className="p-3 border-b border-slate-100 text-center bg-slate-50/20">
            {currentTrack ? (
              <div className="space-y-2.5">
                <div className="relative group w-16 h-16 mx-auto rounded-xl overflow-hidden shadow-md">
                  <img
                    src={currentTrack.artwork}
                    alt={currentTrack.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <div className="font-bold text-xs truncate text-slate-800">{currentTrack.title}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{currentTrack.artist}</div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <input
                    type="range"
                    id="slider-track-progress"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleProgressChange}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3.5">
                  <button
                    type="button"
                    id="btn-spotify-prev"
                    onClick={handleSkipBackward}
                    className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    id="btn-spotify-play"
                    onClick={togglePlay}
                    className="w-7 h-7 bg-orange-600 hover:bg-orange-500 text-white rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3 h-3 fill-white" /> : <Play className="w-3 h-3 fill-white ml-0.5" />}
                  </button>
                  <button
                    type="button"
                    id="btn-spotify-next"
                    onClick={handleSkipForward}
                    className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Volume slider */}
                <div className="flex items-center gap-2 pt-0.5 px-3 pb-2 border-b border-slate-100">
                  <Volume2 className="w-3 h-3 text-slate-400" />
                  <input
                    type="range"
                    id="slider-volume"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                </div>

                {/* Perfect Audio Search Helpers */}
                <div className="pt-2 flex flex-col items-center gap-1.5 px-3">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Play full track in:</span>
                  <div className="flex gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        const q = encodeURIComponent(`${currentTrack.title} ${currentTrack.artist}`);
                        window.open(`https://open.spotify.com/search/${q}`, "_blank");
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-1 px-2 border border-slate-200 hover:border-blue-500 rounded-xl text-[10px] font-semibold text-slate-600 hover:text-blue-600 transition-colors bg-white cursor-pointer shadow-sm"
                    >
                      <SpotifyIcon className="w-3 h-3 text-emerald-600" />
                      Spotify
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const q = encodeURIComponent(`${currentTrack.title} ${currentTrack.artist}`);
                        window.open(`https://www.youtube.com/results?search_query=${q}`, "_blank");
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-1 px-2 border border-slate-200 hover:border-red-500 rounded-xl text-[10px] font-semibold text-slate-600 hover:text-red-600 transition-colors bg-white cursor-pointer shadow-sm"
                    >
                      <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.54 12 3.54 12 3.54s-7.52 0-9.388.515A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.868.515 9.388.515 9.388.515s7.52 0 9.388-.515a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      YouTube
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-1.5">
                <Music className="w-5 h-5 text-slate-300 mx-auto animate-pulse" />
                <div className="text-[10px] text-slate-400">Select sound channel below</div>
              </div>
            )}
          </div>

          {/* Playlists Selection list */}
          <div className="p-3 max-h-36 overflow-y-auto space-y-1.5 border-b border-slate-100">
            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Sound Channels</div>
            {isLoadingPlaylists ? (
              <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center py-3">
                <RefreshCw className="w-3 h-3 animate-spin text-blue-500" /> Fetching channels...
              </div>
            ) : (
              <div className="space-y-1">
                {playlists.map((playlist) => {
                  const isSelected = selectedPlaylistIds.includes(playlist.id);
                  return (
                    <div key={playlist.id} className="flex items-center justify-between p-1 hover:bg-slate-50 rounded-lg transition-colors">
                      <button
                        type="button"
                        onClick={() => handleTogglePlaylistSelection(playlist.id)}
                        className="flex items-center gap-2 text-[10px] text-slate-700 font-medium truncate flex-1 text-left cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Square className="w-3 h-3 text-slate-300 flex-shrink-0" />
                        )}
                        <span className="truncate text-[10px]">{playlist.name}</span>
                      </button>
                      <div className="flex items-center gap-1 opacity-60 hover:opacity-100">
                        <a href={playlist.spotifyUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 text-slate-400 hover:text-blue-600" />
                        </a>
                        {playlist.isCustom && !spotifyToken && (
                          <button type="button" onClick={() => handleRemovePlaylist(playlist.id)}>
                            <Trash2 className="w-3 h-3 text-slate-400 hover:text-rose-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sleek, super compact customized playlist adding */}
          <form onSubmit={handleAddPlaylist} className="p-2.5 bg-slate-50/50 space-y-1.5">
            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Link Focus Preset</div>
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="Name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-[9px] text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-bold cursor-pointer transition-all"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manual Spotify Token Entry Modal */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-3.5 text-center">
            <div className="space-y-1.5">
              <SpotifyIcon className="w-10 h-10 text-blue-600 mx-auto animate-[spin_5s_linear_infinite]" />
              <h3 className="font-bold text-slate-800 text-base">Integrate Your Account</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                To connect directly to your personal playlists, please paste your Spotify User Access Token below.
              </p>
            </div>

            <div className="space-y-2.5 text-left">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">User Token</label>
                <input
                  type="password"
                  placeholder="Bearer OAuth Token..."
                  value={devTokenInput}
                  onChange={(e) => setDevTokenInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-mono text-slate-800"
                />
              </div>

              <div className="p-2 bg-slate-50 rounded-xl space-y-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Where do I find this?</span>
                <p className="text-[9px] text-slate-400 leading-relaxed">
                  Log in to the{" "}
                  <a
                     href="https://developer.spotify.com/documentation/web-api"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-blue-600 font-semibold hover:underline"
                  >
                    Spotify Developer Console
                  </a>{" "}
                  to obtain a temporary user access token, then paste it here to view your real dashboard!
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsTokenModalOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTokenInput}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Link Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
