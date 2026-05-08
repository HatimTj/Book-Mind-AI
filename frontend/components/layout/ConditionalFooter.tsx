"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

/* Chat page is full-height — no footer needed */
export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === "/chat") return null;
  return <Footer />;
}
