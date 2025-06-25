import { cn } from "@/lib/utils";
import Image from "next/image";

import LogoImage from "@/public/logo-removebg.png";

type LogoProps = {
  width?: number;
  height?: number;
  className?: string;
  [key: string]: unknown | undefined;
};

export function Logo({ width, height, className, ...args }: LogoProps) {
  return (
    <Image
      {...args}
      width={width ?? 32}
      height={height ?? 32}
      className={cn(`text-primary ${className}`)}
      src={LogoImage}
      alt="Logo"
    />
  );
}
