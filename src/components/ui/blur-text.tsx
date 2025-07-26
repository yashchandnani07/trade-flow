
"use client";

import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { FC, useRef } from "react";

interface BlurTextProps {
  text: string;
  className?: string;
  animateBy?: "words" | "characters";
  delay?: number;
  duration?: number;
  direction?: "top" | "bottom" | "left" | "right";
  onAnimationComplete?: () => void;
}

const BlurText: FC<BlurTextProps> = ({
  text,
  className,
  animateBy = "words",
  delay = 0,
  duration = 0.4,
  direction = "bottom",
  onAnimationComplete,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const getAnimationDirection = () => {
    switch (direction) {
      case "top":
        return { y: -20 };
      case "bottom":
        return { y: 20 };
      case "left":
        return { x: -20 };
      case "right":
        return { x: 20 };
      default:
        return { y: 20 };
    }
  };

  const variants = {
    hidden: { ...getAnimationDirection(), opacity: 0, filter: "blur(4px)" },
    visible: { y: 0, x: 0, opacity: 1, filter: "blur(0px)" },
  };

  const animationData =
    animateBy === "words" ? text.split(" ") : text.split("");

  return (
    <motion.div
      ref={ref}
      className={cn("flex flex-wrap", className)}
      onAnimationComplete={onAnimationComplete}
    >
      {animationData.map((data, index) => (
        <motion.span
          key={index}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={variants}
          transition={{
            duration: duration,
            delay: index * delay,
            ease: "easeOut",
          }}
          style={{ whiteSpace: "pre-wrap" }} // Use pre-wrap to respect newlines
        >
          {data}{animateBy === 'words' && !data.includes('\n') ? ' ' : ''}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default BlurText;
