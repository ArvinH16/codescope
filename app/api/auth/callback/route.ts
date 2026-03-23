import { NextResponse } from 'next/server';
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'; 

// This route is the callback URL that GitHub redirects to after the user authorizes the app.
// It exchanges the authorization code for an access token, creates a session, and then redirects the user to the frontend.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/repositories'; // Redirect to a page that lists repositories

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.session) {
      const { session } = data;
      const { user } = session;
      
      // 1. EXTRACT CRITICAL DATA
      const githubToken = session.provider_token; 
      const username = user.user_metadata.user_name || user.user_metadata.name;

      // 2. UPSERT INTO PROFILES TABLE (Save Token & Metadata)
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, // Supabase UUID
          github_access_token: githubToken, // ESSENTIAL for GitHub API calls
          username: username,
          last_active: new Date().toISOString(),
        }, { onConflict: 'id' }); // Use onConflict to ensure update instead of insert failure

      if (dbError) {
        console.error('Error saving profile on login:', dbError);
        // We log the error but still proceed with the login redirect.
      }
      
      // 3. Successful Redirect
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Fallback Redirect (Authentication Error)
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}