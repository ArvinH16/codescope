import { GithubService } from "@/lib/github/github-service";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Returns the repository tree that is stored in the database for a given repository, 
// which is used to determine if the repository has been processed 
// and to display the file tree on the frontend
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await context.params;

  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing owner or repo parameter" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await supabase.auth.getSession();
  const githubService = new GithubService(session, owner, repo);
  const repoId = await githubService.getRepoId();

  const { data, error } = await supabase
    .from("repos")
    .select("path, is_file")
    .eq("repo_id", repoId);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch file tree" }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ processed: false });
  }

  return NextResponse.json({ processed: true, files: data });
}
