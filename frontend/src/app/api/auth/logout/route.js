// import { NextResponse } from "next/server";

// export async function POST() {
//   const response = NextResponse.json({ message: "Logout berhasil" });
//   response.cookies.set("token", "", { maxAge: 0, path: "/" });
//   return response;
// }

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();

  // Hapus cookie token
  cookieStore.set('token', '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  // Redirect ke homepage
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}
