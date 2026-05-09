"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Car, LogOut, User, Menu, Bell } from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/Button";

export default function Header() {
  const router = useRouter();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Cookies.remove("session");
      router.push("/login");
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  return (
    <header className="h-20 bg-card/50 backdrop-blur-xl border-b border-border sticky top-0 z-40 px-6">
      <div className="container mx-auto h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Car className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">
              Carro Máximo
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Veículos</Link>
            <Link href="/dashboard/profile" className="text-sm font-medium hover:text-primary transition-colors">Perfil</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
          </button>
          
          <div className="h-8 w-[1px] bg-border mx-2"></div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">{user?.displayName || "Usuário"}</p>
              <p className="text-[10px] text-foreground/40">{user?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
              {user?.photoURL ? (
                <Image 
                  src={user.photoURL} 
                  alt={user.displayName || "Perfil"} 
                  width={40} 
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-foreground/40 hover:text-red-500"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
