import { NextRequest, NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const origin = new URL(request.url).origin;
  const redirectTo = `${origin}/api/auth/callback?prompt=login`; // 👈 callback route
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo },
  });
  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/api/auth/auth-code-error`);
  }
  
  return NextResponse.redirect(data.url); // sends user to GitHub
}