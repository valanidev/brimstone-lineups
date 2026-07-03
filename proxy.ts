import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const session = request.cookies.get("app_session")
  const isLoginPage = request.nextUrl.pathname === "/login"

  // Si l'utilisateur n'est pas connecté et n'est pas sur la page login -> redirection
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si l'utilisateur est déjà connecté et tente d'aller sur /login -> redirection vers l'accueil
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// On configure le middleware pour qu'il ignore les fichiers statiques, images et l'API Next
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
