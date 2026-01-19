import Link from "next/link";
import Image from "next/image";
import { Shield, Github, ChevronDown, Lock, ScanEye, Layers, Zap, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteHeader() {
  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="rounded-2xl border border-white/20 bg-background/70 backdrop-blur-xl shadow-sm supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
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
                <span className="text-xl font-bold tracking-tight hidden sm:inline-block">InvisiGuard</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground transition-colors outline-none cursor-pointer">
                  功能與測試 <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
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

            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                href="https://github.com/Laurence-R/InvisiGuard.git" 
                target="_blank" 
                className="text-muted-foreground hover:text-foreground hidden sm:block transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="h-5 w-5" />
              </Link>
              <ModeToggle />
              
              <div className="hidden sm:block">
                <Button asChild size="sm">
                  <Link href="/embed">立即開始</Link>
                </Button>
              </div>

              {/* Mobile Navigation */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mr-2">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Toggle Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle className="text-left flex items-center gap-2">
                        <div className="relative h-6 w-6">
                           <Image 
                            src="/invisiGuard.svg" 
                            alt="Logo" 
                            fill
                            className="object-contain"
                          />
                        </div>
                        InvisiGuard
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-6 mt-8">
                       <div className="flex flex-col gap-2">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">功能</h4>
                          <Button variant="ghost" className="justify-start gap-2" asChild>
                            <Link href="/embed"><Lock className="h-4 w-4" /> 嵌入浮水印</Link>
                          </Button>
                          <Button variant="ghost" className="justify-start gap-2" asChild>
                            <Link href="/extract"><ScanEye className="h-4 w-4" /> 提取浮水印</Link>
                          </Button>
                          <Button variant="ghost" className="justify-start gap-2" asChild>
                            <Link href="/batch"><Layers className="h-4 w-4" /> 批次處理</Link>
                          </Button>
                          <Button variant="ghost" className="justify-start gap-2" asChild>
                            <Link href="/test"><Zap className="h-4 w-4" /> 攻擊測試</Link>
                          </Button>
                       </div>
                       
                       <div className="h-px bg-border my-2" />

                       <div className="flex flex-col gap-2">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">關於</h4>
                          <Link href="/#features" className="px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors">
                            功能特色
                          </Link>
                          <Link href="/#technology" className="px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors">
                            核心技術
                          </Link>
                          <Link href="/#how-it-works" className="px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors">
                            運作原理
                          </Link>
                       </div>

                       <div className="mt-auto">
                          <Button className="w-full" asChild>
                            <Link href="/embed">立即開始</Link>
                          </Button>
                          <div className="flex justify-center mt-4 text-muted-foreground">
                             <Link href="https://github.com/Laurence-R/InvisiGuard.git" target="_blank">
                               <Github className="h-5 w-5" />
                             </Link>
                          </div>
                       </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
