"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type HomeHashLinkProps = {
  hash: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  role?: string;
};

export function HomeHashLink({
  hash,
  className,
  children,
  onClick,
  role,
}: HomeHashLinkProps) {
  const pathname = usePathname();
  const fragment = `#${hash}`;

  if (pathname === "/") {
    return (
      <a href={fragment} className={className} onClick={onClick} role={role}>
        {children}
      </a>
    );
  }

  return (
    <Link href={`/${fragment}`} className={className} onClick={onClick} role={role}>
      {children}
    </Link>
  );
}
