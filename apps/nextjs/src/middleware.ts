import { NextRequest, NextResponse } from "next/server";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { getToken } from "next-auth/jwt";
import { env } from "./env.mjs";
import { i18n } from "~/config/i18n-config";

const noNeedProcessRoute = [".*\\.png", ".*\\.jpg", ".*\\.opengraph-image.png"];
const noRedirectRoute = ["/api(.*)", "/trpc(.*)", "/admin"];

// 公共路由，不需要认证
const publicRoutes = [
  "/",
  new RegExp("/(\\w{2}/)?signin(.*)"),
  new RegExp("/(\\w{2}/)?login(.*)"), // Login page
  new RegExp("/(\\w{2}/)?register(.*)"), // Register page
  new RegExp("/(\\w{2}/)?terms(.*)"),
  new RegExp("/(\\w{2}/)?privacy(.*)"),
  new RegExp("/(\\w{2}/)?docs(.*)"),
  new RegExp("/(\\w{2}/)?blog(.*)"),
  new RegExp("/(\\w{2}/)?pricing(.*)"),
  new RegExp("/(\\w{2}/)?ai-image(.*)"), // AI image landing page
  new RegExp("^/(\\w{2}/)?image-to-prompt.*"), // Image to prompt generator page
  new RegExp("^/\\w{2}$"), // root with locale
  new RegExp("^/\\w{2}/$"), // root with locale and trailing slash
];

function isPublicRoute(req: NextRequest): boolean {
  const pathname = req.nextUrl.pathname;
  return publicRoutes.some((route) => {
    if (typeof route === 'string') {
      return pathname === route;
    }
    return route.test(pathname);
  });
}

function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  const locales = Array.from(i18n.locales);
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales);
  return matchLocale(languages, locales, i18n.defaultLocale);
}

function isNoRedirect(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  return noRedirectRoute.some((route) => new RegExp(route).test(pathname));
}

function isNoNeedProcess(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  return noNeedProcessRoute.some((route) => new RegExp(route).test(pathname));
}

export default async function middleware(req: NextRequest) {
  if (isNoNeedProcess(req)) {
    return null;
  }

  const isWebhooksRoute = req.nextUrl.pathname.startsWith("/api/webhooks/");
  if (isWebhooksRoute) {
    return NextResponse.next();
  }

  // Skip NextAuth API routes - let NextAuth handle them
  if (req.nextUrl.pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }
  
  const pathname = req.nextUrl.pathname;
  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );
  
  // Redirect if there is no locale
  if (!isNoRedirect(req) && pathnameIsMissingLocale) {
    const locale = getLocale(req);
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
        req.url,
      ),
    );
  }

  if (isPublicRoute(req)) {
    return null;
  }

  // Use NextAuth JWT token for authentication
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  let isAdmin = false;
  
  if (env.ADMIN_EMAIL && token?.email) {
    const adminEmails = env.ADMIN_EMAIL.split(",");
    isAdmin = adminEmails.includes(token.email);
  }

  const isAuthPage = /^\/[a-zA-Z]{2,}\/(login|register)/.test(
    req.nextUrl.pathname,
  );
  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/trpc/");
  const locale = getLocale(req);
  
  if (isAuthRoute) {
    if (isAuth) {
      return NextResponse.next();
    }
    if (req.nextUrl.pathname.includes("/coze.")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(
      new URL(`/${locale}/login?from=${encodeURIComponent(req.nextUrl.pathname + (req.nextUrl.search || ""))}`, req.url),
    );
  }
  
  if (req.nextUrl.pathname.startsWith("/admin/dashboard")) {
    if (!isAuth || !isAdmin)
      return NextResponse.redirect(new URL(`/admin/login`, req.url));
    return NextResponse.next();
  }
  
  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }
    return null;
  }
  
  if (!isAuth) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    return NextResponse.redirect(
      new URL(`/${locale}/login?from=${encodeURIComponent(from)}`, req.url),
    );
  }
}

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"
  ],
};
