import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gold-500 hover:bg-gold-400 text-felt-900 border-gold-600 shadow-tile",
  secondary:
    "bg-felt-700 hover:bg-felt-800 text-ivory border-felt-900 shadow-tile",
  ghost: "bg-transparent hover:bg-felt-800/60 text-ivory border-ivory/20",
  danger:
    "bg-crimson hover:bg-red-700 text-ivory border-red-900 shadow-tile",
  success:
    "bg-emerald-600 hover:bg-emerald-500 text-ivory border-emerald-900 shadow-tile",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { y: 1, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      disabled={disabled}
      className={[
        "relative rounded-xl border-2 font-semibold uppercase tracking-wider",
        "transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-felt-900",
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(" ")}
      {...(rest as Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonProps>)}
    >
      {children}
    </motion.button>
  );
}
