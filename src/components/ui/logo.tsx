import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The Jarz Digital logo. The original artwork is a teal (#00AFB9) PNG; on
 * dark surfaces we render the "JD" mark from the file and set the wordmark
 * in type so it stays crisp and legible.
 */
export function Logo({
  tone = "dark",
  className,
  href = "/",
  compact,
}: {
  tone?: "dark" | "light";
  className?: string;
  href?: string | null;
  compact?: boolean;
}) {
  const content =
    tone === "dark" ? (
      <span className="flex items-center gap-2.5">
        <Image src="/images/brand/mark.png" alt="" width={270} height={270} className="size-8" />
        {!compact && <span className="font-display text-[1.2rem] font-semibold tracking-tight text-white">Jarz Digital</span>}
      </span>
    ) : (
      <Image src="/images/brand/logo.png" alt="" width={1000} height={300} className={cn("h-8 w-auto", compact && "h-7")} />
    );

  if (href === null) return <span className={cn("inline-flex items-center", className)}>{content}<span className="sr-only">Jarz Digital</span></span>;
  return (
    <Link href={href} className={cn("inline-flex items-center rounded-md", className)} aria-label="Jarz Digital — home">
      {content}
    </Link>
  );
}
