import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getUserProfile } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "BreakBread",
  description: "Private pooled participation tracking"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, profile } = await getUserProfile();

  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/85 backdrop-blur-xl">
          <nav className="mx-auto grid max-w-5xl grid-cols-[198px_1fr] items-center gap-4 px-4 py-4 sm:grid-cols-[260px_1fr]">
            <Link href="/" className="flex h-12 w-[198px] items-center overflow-hidden sm:w-[260px]">
              <Image
                src="/breakbread-logo-header.png"
                alt="BreakBread"
                width={2048}
                height={768}
                priority
                className="h-11 w-[192px] object-contain object-left sm:w-[252px]"
              />
            </Link>
            <div className="flex items-center justify-end gap-3 text-sm">
              {user ? (
                <>
                  <Link href="/dashboard" className="text-stone-700 hover:text-stone-950">
                    Dashboard
                  </Link>
                  {profile?.is_admin ? (
                    <Link href="/admin" className="text-stone-700 hover:text-stone-950">
                      Admin
                    </Link>
                  ) : null}
                  <form action="/auth/signout" method="post">
                    <button
                      aria-label="Sign out"
                      title="Sign out"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 text-stone-700 hover:bg-stone-50"
                    >
                      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <path d="M16 17l5-5-5-5" />
                        <path d="M21 12H9" />
                      </svg>
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-stone-700 hover:text-stone-950">
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-md bg-stone-950 px-3 py-1.5 text-white hover:bg-stone-800"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
