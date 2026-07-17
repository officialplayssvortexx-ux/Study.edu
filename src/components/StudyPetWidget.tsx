import React, { useState } from "react";
import { motion } from "motion/react";
import { Heart, Trophy } from "lucide-react";

export interface PetType {
  id: string;
  name: string;
  species: string;
  requiredStreak: number;
  unlocked: boolean;
  color: string;
  quote: string;
  petPhrase: string;
}

export const PET_LIST: PetType[] = [
  {
    id: "luna",
    name: "Luna",
    species: "Luna the Cat",
    requiredStreak: 0,
    unlocked: true,
    color: "bg-slate-400",
    quote: "*purrrr* Mew! Thanks for petting me! Let's ace this class! 🐾",
    petPhrase: "Mew! Keep up the focus!",
  },
  {
    id: "bramble",
    name: "Bramble",
    species: "Bramble the Bear",
    requiredStreak: 0,
    unlocked: true,
    color: "bg-amber-800",
    quote: "Grrr, so warm! Let's keep studying together! 🐻",
    petPhrase: "Focus block by focus block!",
  },
  {
    id: "winston",
    name: "Winston",
    species: "Winston the Owl",
    requiredStreak: 1,
    unlocked: false,
    color: "bg-yellow-600",
    quote: "Hoot hoot! Knowledge is the greatest treasure! Brilliant job today! 🦉",
    petPhrase: "A wise choice to study!",
  },
  {
    id: "pip",
    name: "Pip",
    species: "Pip the Penguin",
    requiredStreak: 2,
    unlocked: false,
    color: "bg-slate-800",
    quote: "Waddle-waddle! Brrr, it's chilly, but your hard work warms me up! 🐧",
    petPhrase: "Stay cool under pressure!",
  },
  {
    id: "barnaby",
    name: "Barnaby",
    species: "Barnaby the Bunny",
    requiredStreak: 3,
    unlocked: false,
    color: "bg-slate-200",
    quote: "Hop hop! Let's study more! You are leaping ahead of everyone! 🐰",
    petPhrase: "Bounce right into your work!",
  },
  {
    id: "daisy",
    name: "Daisy",
    species: "Daisy the Deer",
    requiredStreak: 4,
    unlocked: false,
    color: "bg-amber-600",
    quote: "Fawn-tastic study session! You are deer-ly loved! 🦌",
    petPhrase: "Oh deer, look how smart you are!",
  },
  {
    id: "rory",
    name: "Rory",
    species: "Rory the Red Panda",
    requiredStreak: 5,
    unlocked: false,
    color: "bg-orange-600",
    quote: "Squeak! Hugs and high fives! I believe in your academic success! 🎒",
    petPhrase: "Red-dy, set, study!",
  },
  {
    id: "oliver",
    name: "Oliver",
    species: "Oliver the Otter",
    requiredStreak: 6,
    unlocked: false,
    color: "bg-gray-500",
    quote: "Otter-ly amazing effort! We make an outstanding study team! 🦦",
    petPhrase: "We are otter-ly unstoppable!",
  },
  {
    id: "hazel",
    name: "Hazel",
    species: "Hazel the Hedgehog",
    requiredStreak: 7,
    unlocked: false,
    color: "bg-yellow-800",
    quote: "Soft spike cuddles! Sharp mind, sharp focus! 🦔",
    petPhrase: "Keep on point!",
  },
  {
    id: "sasha",
    name: "Sasha",
    species: "Sasha the Squirrel",
    requiredStreak: 8,
    unlocked: false,
    color: "bg-amber-500",
    quote: "Nut-thing can stop us now! Let's gather more knowledge! 🐿️",
    petPhrase: "Go nuts for learning!",
  },
];

export function PetSVG({ id, isPetting }: { id: string; isPetting: boolean }) {
  // Return the SVG according to the animal type
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto select-none">
      {/* 1. ANIMAL SPECIES SPECIFIC DRAWING */}
      {id === "luna" && (
        <g>
          {/* Ears */}
          <polygon points="26,35 42,46 32,58" fill="#94a3b8" />
          <polygon points="74,35 58,46 68,58" fill="#94a3b8" />
          <polygon points="29,38 39,46 34,54" fill="#fda4af" />
          <polygon points="71,38 61,46 66,54" fill="#fda4af" />
          {/* Head */}
          <circle cx="50" cy="58" r="22" fill="#94a3b8" />
          {/* Cheeks blush */}
          <circle cx="36" cy="62" r="3" fill="#fda4af" opacity="0.6" />
          <circle cx="64" cy="62" r="3" fill="#fda4af" opacity="0.6" />
          {/* Eyes */}
          {isPetting ? (
            <>
              <path d="M 35,55 Q 40,51 45,55" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 55,55 Q 60,51 65,55" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="40" cy="56" r="3" fill="#1e293b" />
              <circle cx="60" cy="56" r="3" fill="#1e293b" />
              <circle cx="41" cy="55" r="1" fill="#fff" />
              <circle cx="61" cy="55" r="1" fill="#fff" />
            </>
          )}
          {/* Nose */}
          <polygon points="50,61 47,58 53,58" fill="#f43f5e" />
          {/* Mouth */}
          <path d="M 46,64 Q 50,67 50,64 Q 50,67 54,64" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
          {/* Whiskers */}
          <line x1="30" y1="62" x2="16" y2="60" stroke="#475569" strokeWidth="1" />
          <line x1="30" y1="65" x2="18" y2="67" stroke="#475569" strokeWidth="1" />
          <line x1="70" y1="62" x2="84" y2="60" stroke="#475569" strokeWidth="1" />
          <line x1="70" y1="65" x2="82" y2="67" stroke="#475569" strokeWidth="1" />
        </g>
      )}

      {id === "bramble" && (
        <g>
          {/* Ears */}
          <circle cx="31" cy="42" r="8" fill="#b45309" />
          <circle cx="69" cy="42" r="8" fill="#b45309" />
          <circle cx="31" cy="42" r="4" fill="#fda4af" />
          <circle cx="69" cy="42" r="4" fill="#fda4af" />
          {/* Head */}
          <circle cx="50" cy="58" r="23" fill="#b45309" />
          {/* Snout */}
          <ellipse cx="50" cy="65" rx="7" ry="5" fill="#fef3c7" />
          {/* Cheeks blush */}
          <circle cx="35" cy="64" r="3" fill="#fda4af" opacity="0.6" />
          <circle cx="65" cy="64" r="3" fill="#fda4af" opacity="0.6" />
          {/* Eyes */}
          {isPetting ? (
            <>
              <path d="M 36,56 Q 40,52 44,56" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 56,56 Q 60,52 64,56" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="40" cy="57" r="3" fill="#1e293b" />
              <circle cx="60" cy="57" r="3" fill="#1e293b" />
            </>
          )}
          {/* Nose */}
          <ellipse cx="50" cy="63" rx="2.5" ry="1.5" fill="#1e293b" />
          {/* Mouth */}
          <path d="M 48,66 Q 50,68 52,66" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}

      {id === "winston" && (
        <g>
          {/* Ears / Tufts */}
          <polygon points="28,34 38,42 26,48" fill="#ca8a04" />
          <polygon points="72,34 62,42 74,48" fill="#ca8a04" />
          {/* Body/Head */}
          <rect x="26" y="38" width="48" height="42" rx="16" fill="#ca8a04" />
          {/* Eyebrows */}
          <path d="M 28,45 L 48,48" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" />
          <path d="M 72,45 L 52,48" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" />
          {/* Eye disks */}
          <circle cx="40" cy="56" r="9" fill="#fef08a" />
          <circle cx="60" cy="56" r="9" fill="#fef08a" />
          {/* Eyes */}
          {isPetting ? (
            <>
              <path d="M 37,56 Q 40,53 43,56" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 57,56 Q 60,53 63,56" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="40" cy="56" r="3.5" fill="#1e293b" />
              <circle cx="60" cy="56" r="3.5" fill="#1e293b" />
              <circle cx="41.5" cy="54.5" r="1" fill="#fff" />
              <circle cx="61.5" cy="54.5" r="1" fill="#fff" />
            </>
          )}
          {/* Beak */}
          <polygon points="50,56 46,62 54,62" fill="#ea580c" />
          {/* Breast Feathers */}
          <path d="M 44,69 Q 47,72 50,69 Q 53,72 56,69" fill="none" stroke="#fef08a" strokeWidth="1.5" />
          <path d="M 40,73 Q 45,76 50,73 Q 55,76 60,73" fill="none" stroke="#fef08a" strokeWidth="1.5" />
        </g>
      )}

      {id === "pip" && (
        <g>
          {/* Head */}
          <circle cx="50" cy="58" r="23" fill="#1e293b" />
          {/* White Face area */}
          <ellipse cx="41" cy="62" rx="9" ry="12" fill="#ffffff" />
          <ellipse cx="59" cy="62" rx="9" ry="12" fill="#ffffff" />
          {/* Cheeks blush */}
          <circle cx="36" cy="66" r="2.5" fill="#fda4af" opacity="0.6" />
          <circle cx="64" cy="66" r="2.5" fill="#fda4af" opacity="0.6" />
          {/* Eyes */}
          {isPetting ? (
            <>
              <path d="M 37,58 Q 41,55 45,58" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 55,58 Q 59,55 63,58" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="41" cy="59" r="2.5" fill="#1e293b" />
              <circle cx="59" cy="59" r="2.5" fill="#1e293b" />
            </>
          )}
          {/* Beak */}
          <polygon points="50,60 45,66 55,66" fill="#f59e0b" />
        </g>
      )}

      {id === "barnaby" && (
        <g>
          {/* Long Ears */}
          <rect x="33" y="16" width="7" height="28" rx="3.5" fill="#e2e8f0" />
          <rect x="60" y="16" width="7" height="28" rx="3.5" fill="#e2e8f0" />
          <rect x="35" y="19" width="3" height="20" rx="1.5" fill="#fda4af" />
          <rect x="62" y="19" width="3" height="20" rx="1.5" fill="#fda4af" />
          {/* Head */}
          <circle cx="50" cy="58" r="21" fill="#e2e8f0" />
          {/* Cheeks blush */}
          <circle cx="36" cy="64" r="3" fill="#fda4af" opacity="0.6" />
          <circle cx="64" cy="64" r="3" fill="#fda4af" opacity="0.6" />
          {/* Eyes */}
          {isPetting ? (
            <>
              <path d="M 36,56 Q 40,52 44,56" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 56,56 Q 60,52 64,56" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="40" cy="57" r="2.5" fill="#1e293b" />
              <circle cx="60" cy="57" r="2.5" fill="#1e293b" />
            </>
          )}
          {/* Nose */}
          <circle cx="50" cy="61" r="1.5" fill="#fda4af" />
          {/* Mouth */}
          <path d="M 47,64 Q 50,66 50,64 Q 50,66 53,64" fill="none" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      )}

      {id === "daisy" && (
        <g>
          {/* Antlers */}
          <path d="M 36,36 L 24,24 M 31,30 L 22,32 M 64,36 L 76,24 M 69,30 L 78,32" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
          {/* Ears */}
          <polygon points="28,42 16,44 26,52" fill="#d97706" />
          <polygon points="72,42 84,44 74,52" fill="#d97706" />
          {/* Head */}
          <circle cx="50" cy="58" r="21" fill="#d97706" />
          {/* Spots */}
          <circle cx="44" cy="44" r="1.5" fill="#fff" />
          <circle cx="56" cy="44" r="1.5" fill="#fff" />
          <circle cx="50" cy="42" r="1" fill="#fff" />
          {/* Cheeks blush */}
          <circle cx="36" cy="64" r="3" fill="#fda4af" opacity="0.6" />
          <circle cx="64" cy="64" r="3" fill="#fda4af" opacity="0.6" />
          {/* Eyes */}
          {isPetting ? (
            <>
              <path d="M 36,56 Q 40,52 44,56" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 56,56 Q 60,52 64,56" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="40" cy="57" r="3" fill="#1e293b" />
              <circle cx="60" cy="57" r="3" fill="#1e293b" />
            </>
          )}
          {/* Nose */}
          <ellipse cx="50" cy="62" rx="3.5" ry="2" fill="#1e293b" />
        </g>
      )}

      {id === "rory" && (
        <g>
          {/* Ears */}
          <polygon points="25,36 38,42 27,52" fill="#ea580c" />
          <polygon points="75,36 62,42 73,52" fill="#ea580c" />
          <polygon points="27,39 34,42 29,48" fill="#fff" />
          <polygon points="73,39 66,42 71,48" fill="#fff" />
          {/* Head */}
          <circle cx="50" cy="58" r="22" fill="#ea580c" />
          {/* White cheeks patches */}
          <ellipse cx="34" cy="65" rx="5" ry="4" fill="#ffffff" />
          <ellipse cx="66" cy="65" rx="5" ry="4" fill="#ffffff" />
          {/* Nose */}
          <polygon points="50,61 47,58 53,58" fill="#1e293b" />
          {/* Eyes */}
          {isPetting ? (
            <>
              <path d="M 36,55 Q 40,51 44,55" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 56,55 Q 60,51 64,55" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="40" cy="56" r="3" fill="#1e293b" />
              <circle cx="60" cy="56" r="3" fill="#1e293b" />
            </>
          )}
          {/* Mouth */}
          <path d="M 47,63 Q 50,65 53,63" fill="none" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      )}

      {id === "oliver" && (
        <g>
          {/* Ears */}
          <circle cx="31" cy="45" r="4.5" fill="#64748b" />
          <circle cx="69" cy="45" r="4.5" fill="#64748b" />
          {/* Head */}
          <circle cx="50" cy="58" r="21" fill="#64748b" />
          {/* Snout area */}
          <ellipse cx="50" cy="64" rx="6" ry="4.5" fill="#f1f5f9" />
          {/* Nose */}
          <ellipse cx="50" cy="62" rx="2.2" ry="1.4" fill="#1e293b" />
          {/* Whiskers */}
          <line x1="32" y1="63" x2="20" y2="61" stroke="#334155" strokeWidth="1" />
          <line x1="32" y1="65" x2="22" y2="67" stroke="#334155" strokeWidth="1" />
          <line x1="68" y1="63" x2="80" y2="61" stroke="#334155" strokeWidth="1" />
          <line x1="68" y1="65" x2="78" y2="67" stroke="#334155" strokeWidth="1" />
          {/* Eyes */}
          {isPetting ? (
            <>
              <path d="M 36,55 Q 40,51 44,55" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 56,55 Q 60,51 64,55" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="40" cy="56" r="2.5" fill="#1e293b" />
              <circle cx="60" cy="56" r="2.5" fill="#1e293b" />
            </>
          )}
        </g>
      )}

      {id === "hazel" && (
        <g>
          {/* Quill background spikes */}
          <path d="M 24,58 C 24,30 76,30 76,58 Z" fill="#451a03" />
          {/* Extra quill elements */}
          <polygon points="26,36 34,44 22,46" fill="#451a03" />
          <polygon points="74,36 66,44 78,46" fill="#451a03" />
          <polygon points="40,24 50,34 60,24" fill="#451a03" />
          {/* Face */}
          <circle cx="50" cy="60" r="18" fill="#ffedd5" />
          {/* Cheeks blush */}
          <circle cx="38" cy="64" r="2" fill="#fda4af" opacity="0.6" />
          <circle cx="62" cy="64" r="2" fill="#fda4af" opacity="0.6" />
          {/* Eyes */}
          {isPetting ? (
            <>
              <path d="M 38,58 Q 41,55 44,58" fill="none" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 56,58 Q 59,55 62,58" fill="none" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="41" cy="59" r="2" fill="#1e293b" />
              <circle cx="59" cy="59" r="2" fill="#1e293b" />
            </>
          )}
          {/* Nose */}
          <circle cx="50" cy="64" r="2.2" fill="#1e293b" />
        </g>
      )}

      {id === "sasha" && (
        <g>
          {/* Fluffy ears tufts */}
          <path d="M 31,38 Q 28,24 31,34 M 69,38 Q 72,24 69,34" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
          {/* Head */}
          <circle cx="50" cy="58" r="21" fill="#d97706" />
          {/* Light Snout area */}
          <circle cx="50" cy="64" r="5" fill="#fef3c7" />
          {/* Nose */}
          <ellipse cx="50" cy="62" rx="1.8" ry="1.2" fill="#1e293b" />
          {/* Cute squirrel front teeth */}
          <rect x="48" y="65" width="4" height="3" fill="#ffffff" stroke="#1e293b" strokeWidth="0.5" />
          {/* Eyes */}
          {isPetting ? (
            <>
              <path d="M 36,55 Q 40,51 44,55" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 56,55 Q 60,51 64,55" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="40" cy="56" r="2.8" fill="#1e293b" />
              <circle cx="60" cy="56" r="2.8" fill="#1e293b" />
            </>
          )}
        </g>
      )}

      {/* 2. CLASSIC BLACK GRADUATION CAP OVERLAY ON TOP OF ANIMAL'S HEAD */}
      <g transform="translate(0, -6)">
        {/* Cap cap-board */}
        <polygon points="34,26 50,18 66,26 50,34" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
        {/* Cap skull-cap */}
        <path d="M 42,28 C 42,33 58,33 58,28" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
        {/* Golden Tassel */}
        <path d="M 50,26 L 58,29 L 58,35" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="58" cy="35" r="1.5" fill="#f59e0b" />
      </g>
    </svg>
  );
}

interface StudyPetWidgetProps {
  currentPetId: string;
  onChangePet: (petId: string) => void;
  streak: number;
  isSessionCompletedToday?: boolean;
}

export function StudyPetWidget({
  currentPetId,
  onChangePet,
  streak,
  isSessionCompletedToday,
}: StudyPetWidgetProps) {
  const [isPetting, setIsPetting] = useState(false);
  const [pettingCount, setPettingCount] = useState(0);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [customPhrase, setCustomPhrase] = useState<string | null>(null);

  const selectedPet = PET_LIST.find((p) => p.id === currentPetId) || PET_LIST[0];

  // Check how many pets are unlocked based on the current streak
  const getUnlockedCount = () => {
    return PET_LIST.filter((p) => streak >= p.requiredStreak).length;
  };

  const handlePet = () => {
    setIsPetting(true);
    setPettingCount((prev) => prev + 1);

    // Spawn 3 sparkling stars/hearts
    const newSparkles = Array.from({ length: 3 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 40 + 10,
    }));
    setSparkles((prev) => [...prev, ...newSparkles]);

    // Set custom phrase
    setCustomPhrase(selectedPet.quote);

    setTimeout(() => {
      setIsPetting(false);
    }, 1200);

    setTimeout(() => {
      // Clear sparkles after fade out
      setSparkles((prev) => prev.filter((s) => !newSparkles.some((ns) => ns.id === s.id)));
    }, 2000);
  };

  // Check feeding level based on whether they have completed a study session today
  const isWellFed = isSessionCompletedToday || streak > 0;

  return (
    <div className="bg-white/95 border border-slate-100 rounded-3xl p-5 shadow-xl text-slate-800 flex flex-col items-center justify-center space-y-3 relative overflow-hidden w-full max-w-sm">
      {/* Sparkles Overlay */}
      {sparkles.map((sp) => (
        <motion.div
          key={sp.id}
          initial={{ scale: 0, opacity: 1, y: 30 }}
          animate={{ scale: 1.5, opacity: 0, y: -20, x: (Math.random() - 0.5) * 40 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute text-rose-500 text-lg z-20 pointer-events-none"
          style={{ left: `${sp.x}%`, top: `${sp.y}%` }}
        >
          {Math.random() > 0.5 ? "❤️" : "✨"}
        </motion.div>
      ))}

      {/* Header and streak display */}
      <div className="w-full flex items-center justify-between text-xs px-1 border-b border-slate-50 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-600">
          <Trophy className="w-4 h-4 text-orange-500" />
          <span>My Study Companion</span>
        </div>
        <div className="bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
          <span>{streak}d Streak</span>
        </div>
      </div>

      {/* Main interactive visual area */}
      <div className="relative group cursor-pointer flex flex-col items-center py-3" onClick={handlePet}>
        {/* Hover Hint */}
        <div className="absolute -top-1 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50/80 px-2 py-0.5 rounded-full">
          Click to pet {selectedPet.name}!
        </div>

        {/* Floating Fed Status Bar */}
        <div className="absolute bottom-1 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-[9px] font-bold shadow-sm flex items-center gap-1">
          <span className={isWellFed ? "text-emerald-600" : "text-amber-500 animate-pulse"}>
            {isWellFed ? "Satisfied & Well-Fed 🎓" : "Hungry - complete focus to feed!"}
          </span>
        </div>

        {/* Bounce motion for petting */}
        <motion.div
          animate={isPetting ? { scale: [1, 1.15, 0.95, 1.05, 1], y: [0, -10, 2, -1, 0] } : {}}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="relative"
        >
          <PetSVG id={selectedPet.id} isPetting={isPetting} />
        </motion.div>
      </div>

      {/* Speech bubbles/status quotes */}
      <div className="min-h-[44px] text-center px-2">
        {isPetting || customPhrase ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[11px] text-blue-700 italic font-semibold leading-relaxed"
          >
            {customPhrase || selectedPet.petPhrase}
          </motion.div>
        ) : (
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
            "{selectedPet.petPhrase}"
            <span className="block text-[8px] text-slate-400 mt-1">Pet count today: {pettingCount}</span>
          </p>
        )}
      </div>

      {/* Select active pet (unlocked ones only) */}
      <div className="w-full space-y-1.5 pt-2 border-t border-slate-100">
        <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block text-left">
          Select Study Pet (Unlocked: {getUnlockedCount()}/10)
        </label>
        <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
          {PET_LIST.map((pet) => {
            const isUnlocked = streak >= pet.requiredStreak;
            const isSelected = pet.id === selectedPet.id;

            return (
              <button
                key={pet.id}
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  onChangePet(pet.id);
                  setCustomPhrase(null);
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-2xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                  isSelected
                    ? "bg-blue-600 border-blue-500 text-white shadow-sm scale-105"
                    : isUnlocked
                    ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    : "bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                }`}
                title={isUnlocked ? pet.species : `Locked - Requires ${pet.requiredStreak}-day Streak`}
              >
                <span>{isUnlocked ? "" : "🔒 "}</span>
                <span>{pet.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
