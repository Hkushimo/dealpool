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
                  {profile?.is_admin ? (
                    <Link href="/admin" className="text-stone-700 hover:text-stone-950">
                      Admin
                    </Link>
                  ) : (
                    <Link href="/dashboard" className="text-stone-700 hover:text-stone-950">
                      Dashboard
                    </Link>
                  )}
                  <form action="/auth/signout" method="post">
                    <button className="rounded-md border border-stone-300 px-3 py-1.5 text-stone-700 hover:bg-stone-50">
                      Sign out
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
