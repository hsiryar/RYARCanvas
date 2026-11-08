import Link from "next/link";
import { sitePath } from "@/lib/site";

export default function BrandLogo() {
  return (
    <Link href="/" className="brand-lockup" aria-label="RYAR Gaming home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="brand-lockup-image"
        src={sitePath("/images/ryarcanvas-logo.webp")}
        alt="RYAR Canvas"
        width={132}
        height={42}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
      <span className="brand-lockup-divider" aria-hidden="true" />
      <span className="brand-lockup-name">Gaming</span>
    </Link>
  );
}
