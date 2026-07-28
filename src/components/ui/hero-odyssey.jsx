import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Radio, ArrowRight, Lock, MapPin, Zap } from 'lucide-react';
import Lightning from './Lightning';

const ElasticHueSlider = ({
  value,
  onChange,
  min = 0,
  max = 360,
  step = 1,
  label = 'Adjust Energy Hue',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  const progress = (value - min) / (max - min);
  const thumbPosition = progress * 100;

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="scale-75 sm:scale-90 relative w-full max-w-xs flex flex-col items-center" ref={sliderRef}>
      {label && <label htmlFor="hue-slider-native" className="text-white/60 text-xs font-semibold mb-1 flex items-center gap-1.5"><Zap className="w-3 h-3 text-[#FF5F8A]" />{label}</label>}
      <div className="relative w-full h-5 flex items-center">
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
          className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-30 w-4 h-4 bg-white rounded-full shadow-lg shadow-[#FF5F8A]/50 pointer-events-none"
          style={{ left: `${thumbPosition}%` }}
          animate={{ scale: isDragging ? 1.4 : 1 }}
          transition={{ type: "spring", stiffness: 500, damping: isDragging ? 20 : 30 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
          className="text-[11px] font-mono text-white/50 mt-1 font-bold"
        >
          {value}° Hue
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const FeatureItem = ({ name, value, position, icon: Icon }) => {
  return (
    <div className={`absolute ${position} z-20 hidden md:block group transition-all duration-300 hover:scale-110 pointer-events-auto cursor-pointer`}>
      <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-xl group-hover:border-[#FF5F8A]/40 transition-colors">
        <div className="relative p-2 rounded-xl bg-white/5 text-[#FF5F8A]">
          {Icon ? <Icon className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          <div className="absolute -inset-1 bg-[#FF5F8A]/20 rounded-full blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <div className="text-white">
          <div className="text-xs font-bold group-hover:text-[#FF5F8A] transition-colors">{name}</div>
          <div className="text-[11px] text-white/50">{value}</div>
        </div>
      </div>
    </div>
  );
};

export function HeroOdyssey({ onActionClick, actionText = "Launch Console" }) {
  const [lightningHue, setLightningHue] = useState(330);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="relative w-full min-h-[85vh] bg-[#03010A] text-white overflow-hidden flex flex-col justify-between rounded-[40px] border border-white/10 shadow-2xl my-4">
      
      {/* WebGL Lightning Canvas Backdrop */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#03010A]/70 z-10 backdrop-blur-[2px]" />

        {/* Central Lightning Shader Beam */}
        <div className="absolute top-0 w-full left-1/2 transform -translate-x-1/2 h-full z-0">
          <Lightning
            hue={lightningHue}
            xOffset={0}
            speed={1.5}
            intensity={0.65}
            size={1.9}
          />
        </div>
      </div>

      {/* Floating Telemetry Feature Badges */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full z-20 pointer-events-none relative"
      >
        <motion.div variants={itemVariants}>
          <FeatureItem name="Real-Time GPS" value="Sub-Meter Telemetry" position="left-8 top-32" icon={Radio} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <FeatureItem name="Encrypted Vault" value="AES-256 Stream Dumps" position="left-1/4 top-16" icon={Lock} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <FeatureItem name="Geofence Alerts" value="Instant Boundary Triggers" position="right-1/4 top-16" icon={MapPin} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <FeatureItem name="SOS Dispatch" value="1-Tap Emergency Sentinel" position="right-8 top-32" icon={Shield} />
        </motion.div>
      </motion.div>

      {/* Main Hero Odyssey Body */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-30 flex flex-col items-center text-center max-w-4xl mx-auto px-4 py-12 my-auto"
      >
        
        {/* Hue Controller */}
        <motion.div variants={itemVariants} className="mb-4">
          <ElasticHueSlider
            value={lightningHue}
            onChange={setLightningHue}
            label="Energy Hue Shader"
          />
        </motion.div>

        {/* Pill Tagline */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-full text-xs font-semibold mb-6 transition-all duration-300 text-white/80"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF5F8A]" />
          <span>Shrimati Setu &bull; Protection Sentinel</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-3 text-white"
        >
          Hero Odyssey <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5F8A] to-[#9D65FF]">Console</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.h2
          variants={itemVariants}
          className="text-2xl sm:text-4xl font-light pb-2 text-white/90"
        >
          Lighting Up Safety for Everyone
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-xs sm:text-sm text-white/60 mb-8 max-w-xl leading-relaxed"
        >
          Real-time safety monitoring, instant geofence boundaries, and encrypted evidence vaults backed by live WebGL shaders.
        </motion.p>

        {/* CTA Button */}
        {onActionClick && (
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onActionClick}
            className="px-8 py-4 bg-gradient-to-r from-[#FF5F8A] to-[#D63162] hover:opacity-90 text-white font-bold text-sm rounded-2xl shadow-xl shadow-[#FF5F8A]/30 flex items-center gap-2 transition-all"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}

      </motion.div>

      {/* Footer bar */}
      <div className="relative z-20 px-8 py-4 flex items-center justify-between text-[11px] text-white/40 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <span>WebGL Shader Canvas Engine</span>
        <span>Shrimati Setu 2.0</span>
      </div>

    </div>
  );
}

export default HeroOdyssey;
