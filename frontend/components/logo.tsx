import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean; // If true, we might render text separately, but the logo has text.
                      // Actually, let's just render the image.
}

export function Logo({ className, width = 180, height = 180 }: LogoProps) {
  return (
    <div className={cn("relative", className)} style={{ width, height }}>
      <Image
        src="/logo.svg"
        alt="StackleVest Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
