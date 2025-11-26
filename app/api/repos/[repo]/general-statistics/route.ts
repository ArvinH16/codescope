import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: { repo: string } }
) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.provider_token;
  const repoName = context.params.repo;
  const owner = session?.user?.user_metadata?.user_name;

  if (!token || !owner) {
    return NextResponse.json(
      { error: "Missing GitHub token or owner" },
      { status: 401 }
    );
  }

  // Fetch commits
  const commitsRes = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/commits?per_page=100`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const commits = await commitsRes.json();

  // Fetch contributors
  const contributorsRes = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/contributors`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const contributors = await contributorsRes.json();

  // Count files changed in recent commits
  let totalFilesChanged = 0;
  for (const commit of commits.slice(0, 20)) {
    const commitRes = await fetch(commit.url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const commitData = await commitRes.json();
    totalFilesChanged += commitData.files?.length || 0;
  }

  return NextResponse.json({
    totalCommits: commits.length,
    activeContributors: contributors.length,
    filesChanged: totalFilesChanged,
  });
}