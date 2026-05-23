import Image from "next/image";
import { APP_NAME, LOGO_SRC } from "@/lib/brand";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  className?: string;
  size?: number;
  priority?: boolean;
};

export function AppLogo({
  className,
  size = 44,
  priority = false,
}: AppLogoProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt={`Logo ${APP_NAME}`}
      width={size}
      height={size}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}
