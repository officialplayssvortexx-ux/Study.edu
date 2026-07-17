import { Playlist, BackgroundPreset } from "./types";

export const PRESET_PLAYLISTS: Playlist[] = [
  {
    id: "aluminum-vibe",
    name: "Aluminum Education Vibe",
    description: "Your official focus playlist featuring Mashko, Benson Boone, Cafune, and more.",
    artwork: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300&auto=format&fit=crop&q=60",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn",
    tracks: [
      {
        id: "vibe-1",
        title: "Coconut x | Get Lonely",
        artist: "Mashko",
        duration: "3:42",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        artwork: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300&auto=format&fit=crop&q=60",
      },
      {
        id: "vibe-2",
        title: "Beautiful Things",
        artist: "Benson Boone",
        duration: "3:18",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        artwork: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&auto=format&fit=crop&q=60",
      },
      {
        id: "vibe-3",
        title: "To be Alive",
        artist: "Tree Machines",
        duration: "4:05",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        artwork: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=300&auto=format&fit=crop&q=60",
      },
      {
        id: "vibe-4",
        title: "Hold on",
        artist: "Summer Was Fun, Q'Aila",
        duration: "3:22",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        artwork: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&auto=format&fit=crop&q=60",
      },
      {
        id: "vibe-5",
        title: "Tek It",
        artist: "Cafune",
        duration: "3:12",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        artwork: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&auto=format&fit=crop&q=60",
      },
      {
        id: "vibe-6",
        title: "Good old Days",
        artist: "Macklemore, Kesha",
        duration: "4:00",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        artwork: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=60",
      },
      {
        id: "vibe-7",
        title: "Your Eyes",
        artist: "Joey Pecoraro",
        duration: "3:28",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        artwork: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=60",
      },
      {
        id: "vibe-8",
        title: "Can't Take My Eyes off You",
        artist: "Craymer, ALLVAWN",
        duration: "3:05",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        artwork: "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=300&auto=format&fit=crop&q=60",
      },
      {
        id: "vibe-9",
        title: "Aesthetic",
        artist: "Tollan Kim",
        duration: "2:54",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        artwork: "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=300&auto=format&fit=crop&q=60",
      },
      {
        id: "vibe-10",
        title: "Chill Days",
        artist: "Lakey Inspired",
        duration: "3:01",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        artwork: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300&auto=format&fit=crop&q=60",
      }
    ],
  }
];

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: "warm-fireplace",
    name: "Warm Fireplace (Cozy)",
    type: "video",
    class: "",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-cozy-fireplace-under-mantle-42232-large.mp4",
    style: {
      background: "#1c1917",
      backgroundColor: "#1c1917",
    },
    description: "A cozy crackling fireplace with glowing red-hot logs.",
    isDark: true,
  },
  {
    id: "cosmic-nebula",
    name: "Cosmic Nebula (Dark Mode)",
    type: "video",
    class: "",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4",
    style: {
      background: "#030712",
      backgroundColor: "#030712",
    },
    description: "Gazing into the starfield. Cosmic deep-space loop.",
    isDark: true,
  },
  {
    id: "rainy-window",
    name: "Rainy Cafe Window (Cozy Dark)",
    type: "video",
    class: "",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-rain-drops-on-window-pane-2309-large.mp4",
    style: {
      background: "#0f172a",
      backgroundColor: "#0f172a",
    },
    description: "Quiet raindrops streaming down warm glass window pane.",
    isDark: true,
  },
  {
    id: "natural-tones",
    name: "Natural Tones (Light)",
    type: "gradient",
    class: "",
    style: {
      background: "radial-gradient(circle at 0% 0%, #e0e7ff 0%, #fdf2f8 50%, #fff7ed 100%)",
      backgroundColor: "#f8fafc",
    },
    description: "The official soft pastel radial gradient study room vibes.",
    isDark: false,
  },
  {
    id: "mint-moss",
    name: "Mint & Moss Green (Light)",
    type: "animated",
    class: "",
    style: {
      background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)",
      backgroundColor: "#f0fdf4",
    },
    description: "Invigorating light moss breeze with soft floating mint pollen.",
    isDark: false,
  },
  {
    id: "warm-biscuit",
    name: "Warm Biscuit (Light)",
    type: "gradient",
    class: "",
    style: {
      background: "linear-gradient(135deg, #fefaf0 0%, #fdf2db 50%, #fae8c3 100%)",
      backgroundColor: "#fefaf0",
    },
    description: "A cozy cream tea, fresh shortbread, and parchment feel.",
    isDark: false,
  },
  {
    id: "ocean-breeze",
    name: "Oceanic Mist (Light)",
    type: "animated",
    class: "",
    style: {
      background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)",
      backgroundColor: "#f0f9ff",
    },
    description: "Refreshing breeze of bright sky blue and salt-water mist.",
    isDark: false,
  }
];
