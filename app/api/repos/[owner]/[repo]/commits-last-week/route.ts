import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { oneWeekAgo } from "@/utils/frontend/time/one-week-ago";

// Grabs all summaries from the last week 
// And returns them as a list of commits
export async function GET(request: NextRequest, context: { params: Promise<{ owner: string, repo: string }> }){
  const { owner, repo } = await context.params;

  if (!repo || typeof repo !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid repo parameter" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.provider_token;

  if (!token || !owner) {
    return NextResponse.json(
      { error: "Missing GitHub token or owner" },
      { status: 401 }
    );
  }

  const headers = { Authorization: `Bearer ${token}` };

  const oneWeekAgoISO = oneWeekAgo();
  // Fire all requests at once
   const lastWeekCommitsRes = fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?since=${oneWeekAgoISO}`,
        { headers });


    
  // Parse JSON in parallel too
  const lastWeekCommits = (await lastWeekCommitsRes).json
  return lastWeekCommits;
}