import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = NextResponse.redirect(baseUrl);
  
  // Clear the basket cookie
  response.cookies.delete("tebex_basket");
  
  return response;
}
