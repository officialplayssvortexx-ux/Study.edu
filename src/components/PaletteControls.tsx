import React, { useState, useRef } from "react";
import { Palette, Check, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { BackgroundPreset } from "../types";
import { BACKGROUND_PRESETS } from "../constants";

interface PaletteControlsProps {
  currentPreset: BackgroundPreset;
  onSelectPreset: (preset: BackgroundPreset) => void;
  customBackgroundUrl: string | null;
  onUploadCustomBackground: (dataUrl: string | null) => void;
  selectedFont?: string;
  onChangeFont?: (font: string) => void;
}

export default function PaletteControls({
  currentPreset,
  onSelectPreset,
  customBackgroundUrl,
  onUploadCustomBackground,
  selectedFont,
  onChangeFont,
}: PaletteControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Only allow images or GIFs
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, or GIF).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUploadCustomBackground(dataUrl);

      // Automatically switch to 'uploaded' type preset
      const customPreset: BackgroundPreset = {
        id: "uploaded-bg",
        name: "Uploaded Canvas",
        type: "uploaded",
        class: "",
        description: "Your custom uploaded study background.",
      };
      onSelectPreset(customPreset);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearCustomBackground = () => {
    onUploadCustomBackground(null);
    // Revert to first preset if we are on custom background
    if (currentPreset.type === "uploaded") {
      onSelectPreset(BACKGROUND_PRESETS[0]);
    }
  };

  return (
    <div className="relative" id="palette-controls-widget">
      {/* Floating Paint Palette trigger button */}
      <button
        type="button"
        id="btn-palette-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 bg-white/90 hover:bg-slate-50 text-emerald-600 border border-slate-200 rounded-full shadow-xl transition-transform hover:scale-105 z-40 relative group cursor-pointer"
      >
        <Palette className="w-6 h-6" />
        <span className="absolute -left-28 top-3.5 bg-slate-800 text-white text-xs py-1 px-2.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold shadow-md">
          Vibe Palette
        </span>
      </button>

      {/* Palette customizer pop-up */}
      {isOpen && (
        <div
          id="palette-dropdown-drawer"
          className="absolute right-0 bottom-16 w-72 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-50 text-slate-800 p-4 space-y-4"
        >
          <div className="border-b border-slate-100 pb-2">
            <h4 className="font-bold text-sm text-emerald-700">Background Vibe Customizer</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Customize your cozy study room atmosphere.</p>
          </div>

          {/* Preset list selection */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Built-in Ambiences</span>
            <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {BACKGROUND_PRESETS.map((preset) => {
                const isActive = currentPreset.id === preset.id && currentPreset.type !== "uploaded";
                return (
                  <button
                    key={preset.id}
                    type="button"
                    id={`btn-preset-${preset.id}`}
                    onClick={() => onSelectPreset(preset)}
                    className={`flex items-center justify-between p-2 rounded-2xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm"
                        : "bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs">{preset.name}</div>
                      <div className="text-[9px] text-slate-500 truncate mt-0.5">{preset.description}</div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Upload Section */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Custom Background Upload</span>

            {customBackgroundUrl ? (
              <div className="flex items-center justify-between p-2 rounded-2xl border border-emerald-200 bg-emerald-50">
                <button
                  type="button"
                  id="btn-select-uploaded-bg"
                  onClick={() =>
                    onSelectPreset({
                      id: "uploaded-bg",
                      name: "Uploaded Canvas",
                      type: "uploaded",
                      class: "",
                      description: "Your custom uploaded study background.",
                    })
                  }
                  className="flex items-center gap-2.5 text-xs text-emerald-700 font-semibold flex-1 text-left"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span className="truncate">Use Uploaded Background</span>
                </button>
                <button
                  type="button"
                  id="btn-delete-uploaded-bg"
                  onClick={clearCustomBackground}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                id="drop-zone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-500 hover:text-slate-700 shadow-sm"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Upload className="w-5 h-5 mx-auto mb-1.5 text-emerald-600" />
                <div className="text-[10px] font-semibold">Click or drag & drop image/GIF</div>
                <div className="text-[8px] text-slate-400 mt-0.5">Supports PNG, JPG, GIF</div>
              </div>
            )}
          </div>

          {/* Custom Font Family Selection */}
          {selectedFont && onChangeFont && (
            <div className="space-y-1.5 pt-3.5 border-t border-slate-100 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Font Family Customizer</span>
              <select
                id="select-custom-font"
                value={selectedFont}
                onChange={(e) => onChangeFont(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm font-semibold"
              >
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Default)</option>
                <option value="Inter">Inter (Geometric)</option>
                <option value="Playfair Display">Playfair Display (Serif)</option>
                <option value="Lora">Lora (Cozy Serif)</option>
                <option value="JetBrains Mono">JetBrains Mono (Mono Tech)</option>
                <option value="Outfit">Outfit (Minimalist)</option>
                <option value="Space Grotesk">Space Grotesk (Neo-Futurist)</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
