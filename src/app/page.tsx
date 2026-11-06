"use client";

import { useEffect } from "react";
import LandingScreen from "@/components/landing/LandingScreen";

export default function Home() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return <LandingScreen />;
}
