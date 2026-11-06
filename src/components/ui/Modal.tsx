"use client";

import { useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  variant?: "default" | "balloon";
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, subtitle, icon, variant = "default", children, className }: ModalProps) {
  const isBalloon = variant === "balloon";
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "w-full max-w-lg relative pointer-events-auto",
                isBalloon
                  ? "overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-white/5 p-8 shadow-[0_25px_60px_-20px_rgba(255,255,255,0.15)] backdrop-blur"
                  : "bg-zinc-950 border border-zinc-800 shadow-2xl p-8",
                className
              )}
            >
              {isBalloon && (
                <>
                  <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-white/60 via-white/30 to-white/10" />
                  <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                </>
              )}
              <div className={cn("flex items-center justify-between", isBalloon ? "relative mb-6" : "mb-6")}>
                {isBalloon && icon ? (
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] border border-white/20 bg-white text-zinc-950 shadow-lg shadow-white/10">
                      {icon}
                    </div>
                    <div className="min-w-0">
                      {title && <h3 className="text-2xl font-black uppercase tracking-tight text-white">{title}</h3>}
                      {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
                    </div>
                  </div>
                ) : (
                  title && (
                    <h3 className={cn("text-xl font-black uppercase tracking-tight", isBalloon && "text-white")}>
                      {title}
                    </h3>
                  )
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-500 transition-colors hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
