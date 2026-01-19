import Link from "next/link";
import Image from "next/image";
import { Shield, Github, ChevronDown, Lock, ScanEye, Layers, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <Image 
                  src="/invisiGuard.svg" 
                  alt="InvisiGuard Logo" 
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-bold tracking-tight">InvisiGuard</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground transition-colors outline-none">
                功能與測試 <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/embed" className="cursor-pointer gap-2">
                    <Lock className="h-4 w-4" /> 嵌入浮水印
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/extract" className="cursor-pointer gap-2">
                    <ScanEye className="h-4 w-4" /> 提取浮水印
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/batch" className="cursor-pointer gap-2">
                    <Layers className="h-4 w-4" /> 批次處理
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/test" className="cursor-pointer gap-2">
                    <Zap className="h-4 w-4" /> 攻擊測試
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-4 w-px bg-border/50" />
            <Link href="/#features" className="hover:text-foreground transition-colors">功能特色</Link>
            <Link href="/#technology" className="hover:text-foreground transition-colors">核心技術</Link>
            <Link href="/#how-it-works" className="hover:text-foreground transition-colors">運作原理</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="https://github.com" 
              target="_blank" 
              className="text-muted-foreground hover:text-foreground hidden sm:block transition-colors"
              aria-label="GitHub Repository"
            >
              <Github className="h-5 w-5" />
            </Link>
            <ModeToggle />
            <Button asChild size="sm">
              <Link href="/embed">立即開始</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
