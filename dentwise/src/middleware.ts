import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { LOCALE_COOKIE, getLocaleFromAcceptLanguage, normalizeLocale } from "@/lib/i18n";

export default clerkMiddleware((auth, req) => {
  const response = NextResponse.next();
  const existing = normalizeLocale(req.cookies.get(LOCALE_COOKIE)?.value);
  const detected = existing || getLocaleFromAcceptLanguage(req.headers.get("accept-language"));

  if (!existing || existing !== detected) {
    response.cookies.set(LOCALE_COOKIE, detected, {
      path: "/",
      sameSite: "lax",
    });
  }

  response.headers.set("x-dw-locale", detected);
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
