"use client";
import React, { useState } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";

interface TooltipItem {
  id: string | number;
  name: string;
  designation: string;
  image: string;
}

export default function AnimatedTooltip({
  items,
}: {
  items: TooltipItem[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<string | number | null>(null);
  const springConfig = { stiffness: 100, damping: 8 };
  const x = useMotionValue(0); // tracks mouse position

  // rotate the tooltip
  const rotate = useSpring(
    useTransform(x, [-50, 50], [-15, 15]),
    springConfig
  );
  // translate the tooltip
  const translateX = useSpring(
    useTransform(x, [-50, 50], [-15, 15]),
    springConfig
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLImageElement>) => {
    const halfWidth = event.currentTarget.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  return (
    <div className="flex flex-row items-center select-none">
      {items.map((item) => (
        <div
          className="-mr-2.5 relative group z-10 hover:z-30"
          key={item.id}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout">
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 flex text-[9px] flex-col items-center justify-center rounded-lg bg-zinc-950/95 border border-white/10 z-50 shadow-2xl px-2.5 py-1.5 backdrop-blur-sm"
              >
                <div className="font-black text-white relative z-30 text-[10px] leading-tight">
                  {item.name}
                </div>
                <div className="text-slate-400 text-[8px] mt-0.5 leading-none">{item.designation}</div>
              </motion.div>
            )}
          </AnimatePresence>
          <img
            onMouseMove={handleMouseMove}
            src={item.image}
            alt={item.name}
            className="object-cover !m-0 !p-0 object-top rounded-full h-8 w-8 border border-white/20 shadow-md group-hover:scale-110 relative transition duration-300 ease-out bg-zinc-900"
          />
        </div>
      ))}
    </div>
  );
}
