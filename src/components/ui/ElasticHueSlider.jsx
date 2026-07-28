import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function ElasticHueSlider({
  value,
  onChange,
  min = 0,
  max = 360,
  step = 1,
  label = 'Energy Hue',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  const progress = (value - min) / (max - min);
  const thumbPosition = progress * 100;

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="relative w-44 sm:w-52 flex items-center gap-3 bg-black/40 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md" ref={sliderRef}>
      <Zap className="w-3.5 h-3.5 text-[#FF5F8A] shrink-0" />
      <div className="relative flex-1 h-4 flex items-center">
        <input
          id="hue-slider-native"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer z-20"
          style={{ WebkitAppearance: 'none' }}
        />

        <div className="absolute left-0 w-full h-1 bg-white/10 rounded-full z-0"></div>

        <div
          className="absolute left-0 h-1 bg-gradient-to-r from-[#FF5F8A] to-[#9D65FF] rounded-full z-10"
          style={{ width: `${thumbPosition}%` }}
        ></div>

        <motion.div
          className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-30 w-3.5 h-3.5 bg-white rounded-full shadow-lg shadow-[#FF5F8A]/60 pointer-events-none"
          style={{ left: `${thumbPosition}%` }}
          animate={{ scale: isDragging ? 1.4 : 1 }}
          transition={{ type: "spring", stiffness: 500, damping: isDragging ? 20 : 30 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="text-[10px] font-mono text-white/70 font-bold shrink-0 w-7 text-right"
        >
          {value}°
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
