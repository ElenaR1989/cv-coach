import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })

  // Refresh Supabase session so server-side API routes can read it
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
  await supabase.auth.getUser()

  const hostname = request.headers.get("host") || ""
  const url = request.nextUrl.clone()

  const mainDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "hire-flow.app"

  // Only rewrite if it's clearly a subdomain (not www, not main domain, not localhost, not Vercel preview)
  const isMainDomain =
    hostname === mainDomain ||
    hostname === `www.${mainDomain}` ||
    hostname.includes("localhost") ||
    hostname.includes("vercel.app") ||
    hostname.includes("127.0.0.1")

  if (!isMainDomain && hostname.endsWith(`.${mainDomain}`)) {
    const slug = hostname.replace(`.${mainDomain}`, "")
    if (slug && slug !== "www" && slug.length > 0) {
      url.pathname = `/agency/${slug}${url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
