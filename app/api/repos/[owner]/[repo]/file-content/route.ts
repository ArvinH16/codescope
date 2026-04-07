import { GithubService } from "@/lib/github/github-service";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await context.params;
  const path = request.nextUrl.searchParams.get("path");

  if (!owner || !repo || !path) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
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
    .select("file_content")
    .eq("repo_id", repoId)
    .eq("path", path)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return NextResponse.json({ content: data.file_content });
}
