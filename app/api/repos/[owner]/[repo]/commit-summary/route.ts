

// Import all your services
import { summarizeCommit } from '@/lib/ai-summarizer'; 
import { GithubService } from '@/lib/github-service';   
import { saveSummaryToDB } from '@/lib/db-service';     
import { create } from 'domain';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { oneWeekAgo } from "@/utils/frontend/time/one-week-ago";

// Grabs all summaries from the last week 
// And returns them as a list of commits
export async function GET(request: NextRequest, context: { params: Promise<{ owner: string, repo: string }> }){
    const { owner, repo } = await context.params;
    const supabase = await createClient();
    const lastWeekCommits = await fetch(`/api/repos/${owner}/${repo}/commits-last-week`)
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