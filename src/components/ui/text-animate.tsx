"use client";

import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextAnimateProps {
  text: string;
  type?: "popIn" | "rollIn" | "whipIn" | "flipIn";
  delay?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  style?: React.CSSProperties;
}

const animationVariants: Record<string, Variants> = {
  popIn: {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1 },
  },
  rollIn: {
    hidden: { opacity: 0, x: -50, rotate: -10 },
    visible: { opacity: 1, x: 0, rotate: 0 },
  },
  whipIn: {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0 },
  },
  flipIn: {
    hidden: { opacity: 0, rotateX: -90 },
    visible: { opacity: 1, rotateX: 0 },
  },
};

export function TextAnimate({
  text,
  type = "whipIn",
  delay = 0,
  className,
  as: Component = "p",
  style,
}: TextAnimateProps) {
  const words = text.split(" ");
  const MotionComponent = motion[Component] as any;

  return (
    <MotionComponent
      className={cn("inline-block", className)}
      style={style}
      initial="hidden"
      animate="visible"
      transition={{
        staggerChildren: 0.05,
        delayChildren: delay,
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={animationVariants[type]}
          transition={{
            duration: 0.5,
            ease: [0.2, 0.65, 0.3, 0.9],
          }}
        >
          {word}
          {i < words.length - 1 && "\u00A0"}
        </motion.span>
      ))}
    </MotionComponent>
  );
}

interface TextAnimateWithDelayProps {
  texts: string[];
  type?: "popIn" | "rollIn" | "whipIn" | "flipIn";
  baseDelay?: number;
  delayIncrement?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  style?: React.CSSProperties;
}

export function TextAnimateWithDelay({
  texts,
  type = "whipIn",
  baseDelay = 0,
  delayIncrement = 0.3,
  className,
  as = "p",
  style,
}: TextAnimateWithDelayProps) {
  return (
    <>
      {texts.map((text, index) => (
        <TextAnimate
          key={index}
          text={text}
          type={type}
          delay={baseDelay + index * delayIncrement}
          className={className}
          as={as}
          style={style}
        />
      ))}
    </>
  );
}
