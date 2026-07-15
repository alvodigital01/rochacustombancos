import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, tokenValido } from "@/lib/admin-token";

// Protege /admin/* de forma centralizada — cobre toda página nova que for
// criada ali (e também as Server Actions chamadas a partir delas, já que
// são requisições pra essa mesma rota).
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const autenticado = await tokenValido(request.cookies.get(COOKIE_NAME)?.value);

  if (!autenticado) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
