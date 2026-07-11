"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import React, { useRef } from "react";

interface SwipeableItemProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void; // Delete
  onSwipeRight?: () => void; // Complete
  onLongPress?: () => void; // Edit
}

export default function SwipeableItem({
  children,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
}: SwipeableItemProps) {
  const x = useMotionValue(0);
  const dragConstraintsRef = useRef<HTMLDivElement>(null);

  // Map drag value to background gradients
  const background = useTransform(
    x,
    [-120, 0, 120],
    [
      "linear-gradient(90deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0) 100%)", // Red for Swipe Left (Delete)
      "transparent",
      "linear-gradient(270deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0) 100%)", // Green for Swipe Right (Complete)
    ]
  );

  const leftOpacity = useTransform(x, [-100, -30], [1, 0]);
  const rightOpacity = useTransform(x, [30, 100], [0, 1]);

  const handleDragEnd = (_event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Trigger actions past threshold or fast flick velocity
    if (offset < -100 || (offset < -50 && velocity < -100)) {
      if (onSwipeLeft) onSwipeLeft();
    } else if (offset > 100 || (offset > 50 && velocity > 100)) {
      if (onSwipeRight) onSwipeRight();
    }
  };

  // Support long press edit
  let pressTimer: any = null;
  const handleTouchStart = () => {
    pressTimer = setTimeout(() => {
      if (onLongPress) onLongPress();
    }, 600); // 600ms long press threshold
  };
  const handleTouchEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
  };

  return (
    <div ref={dragConstraintsRef} className="relative overflow-hidden w-full rounded-2xl">
      {/* Background Actions Layer */}
      <motion.div
        style={{ background }}
        className="absolute inset-0 flex justify-between items-center px-4 -z-10 rounded-2xl pointer-events-none"
      >
        {/* Swipe Right indicator (Complete) */}
        {onSwipeRight ? (
          <motion.div style={{ opacity: rightOpacity }} className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
            <Check className="w-4 h-4" /> Complete
          </motion.div>
        ) : (
          <div />
        )}

        {/* Swipe Left indicator (Delete) */}
        {onSwipeLeft ? (
          <motion.div style={{ opacity: leftOpacity }} className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
            Delete <Trash2 className="w-4 h-4" />
          </motion.div>
        ) : (
          <div />
        )}
      </motion.div>

      {/* Foreground Content Card (Draggable) */}
      <motion.div
        drag={onSwipeLeft || onSwipeRight ? "x" : false}
        dragConstraints={{ left: onSwipeLeft ? -150 : 0, right: onSwipeRight ? 150 : 0 }}
        dragElastic={0.4}
        style={{ x }}
        onDragEnd={handleDragEnd}
        onTouchStart={onLongPress ? handleTouchStart : undefined}
        onTouchEnd={onLongPress ? handleTouchEnd : undefined}
        className="relative z-10 w-full cursor-grab active:cursor-grabbing touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
}
