"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type Direction = "up" | "left" | "right" | "none";

const variants: Record<Direction, { hidden: Record<string, number>; visible: Record<string, number> }> = {
  up: { hidden: { opacity: 0, y: 48 }, visible: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -48 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 48 }, visible: { opacity: 1, x: 0 } },
  none: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
};

export default function SectionReveal({
  children,
  direction = "up",
  delay = 0,
  className,
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
}) {
  const v = variants[direction];
  return (
    <motion.div
      initial={v.hidden}
      whileInView={v.visible}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
