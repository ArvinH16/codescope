import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { oneWeekAgo } from "@/utils/frontend/time/one-week-ago";

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
  const [commitsRes, weeklyCommitsRes, contributorsRes, starGazersRes] =
    await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}/commits`, {
        headers,
      }),
      fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?since=${oneWeekAgoISO}`,
        { headers }
      ),
      fetch(`https://api.github.com/repos/${owner}/${repo}/contributors`, {
        headers,
      }),
      fetch(
        `https://api.github.com/repos/${owner}/${repo}/stargazers`,
        { headers }
      ),
    ]);

    
  // Parse JSON in parallel too
  const [totalCommits, weeklyCommits, contributors, starGazers] =
    await Promise.all([
      commitsRes.json(),
      weeklyCommitsRes.json(),
      contributorsRes.json(),
      starGazersRes.json(),
    ]);
  return NextResponse.json({
    totalCommits: totalCommits.length,
    weeklyCommits: weeklyCommits.length,
    contributors: contributors.length,
    starGazers: starGazers.length,
  });
}