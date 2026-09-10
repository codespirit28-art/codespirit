import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // CENTRAL CREDENTIAL STORAGE: 
    // Best practice fallback variables, or pull dynamically via process.env properties
    const ASSIGNED_ADMIN_USER = process.env.ADMIN_USER || "admin";
    const ASSIGNED_ADMIN_PASS = process.env.ADMIN_PASS || "admin123456789";

    if (username === ASSIGNED_ADMIN_USER && password === ASSIGNED_ADMIN_PASS) {
      const response = NextResponse.json(
        { message: 'Authentication verified.' }, 
        { status: 200 }
      );

      // Save operational verification token down to safe HTTP-Only state cookie 
      response.cookies.set('admin_session', 'authenticated_token_active', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 4, // Valid for 4 hours
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ message: 'Invalid admin credentials provided.' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal processing fault.' }, { status: 500 });
  }
}
