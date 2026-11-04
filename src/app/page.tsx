"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import LandingScreen from "@/components/landing/LandingScreen";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const session = Cookies.get("session");
    if (session) {
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return <LandingScreen />;
}
