import Link from "next/link";
import Image from "next/image";
import { Shield, Github } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/20 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6">
               <Image 
                 src="/invisiGuard.svg" 
                 alt="InvisiGuard Logo" 
                 fill
                 className="object-contain"
               />
            </div>
            <span className="font-bold text-lg">InvisiGuard</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 InvisiGuard. Built with Next.js, DWT & QIM.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground items-center">
            <Link href="#" className="hover:text-foreground transition-colors">隱私權政策</Link>
            <Link href="#" className="hover:text-foreground transition-colors">使用條款</Link>
            <Link 
              href="https://github.com/Laurence-R/InvisiGuard.git" 
              target="_blank" 
              className="hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
