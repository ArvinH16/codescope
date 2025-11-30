import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Import all your services
import { summarizeCommit } from '@/lib/ai-summarizer'; 
import { GithubService } from '@/lib/github-service';   
import { saveSummaryToDB } from '@/lib/db-service';     

export async function POST(request: Request) {
  try {
    // 1. Get the simple request from the frontend: (owner, repo, sha)
    const { owner, repo, sha } = await request.json();
    if (!owner || !repo || !sha) {
      return NextResponse.json({ error: 'Missing owner, repo, or commit SHA.' }, { status: 400 });
    }

    // 2. Initialize Supabase to get the User ID from the session
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
          remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }) },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Fetch data from GitHub using the user's stored token
    const github = await GithubService.forUser(supabase, user.id);
    const commitData = await github.getCommitDiff(owner, repo, sha);

    // 4. Summarize the changes using the AI core
    const summaryText = await summarizeCommit(commitData.message, commitData.files);

    // 5. Save the result to the secure 'summaries' table
    await saveSummaryToDB(supabase, {
      user_id: user.id,
      repo_name: `${owner}/${repo}`,
      commit_sha: sha, // <-- FIX: Added commit_sha field
      summary: summaryText,
    });

    // 6. Return the summary to the frontend
    return NextResponse.json({ summary: summaryText });

  } catch (error: any) {
    console.error("Backend Pipeline Failure:", error.message);
    
    // Provide a user-friendly error if the token is bad or the repo is missing
    if (error.message.includes('404')) {
      return NextResponse.json({ error: 'Repository or commit not found on GitHub.' }, { status: 404 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}