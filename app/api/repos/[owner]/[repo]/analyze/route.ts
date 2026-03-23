import { processChatbotRequest } from "@/lib/ai-chatbot";
import { GithubService } from "@/lib/github/github-service";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await context.params;

  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing owner or repo parameter" }, { status: 400 });
  }

  const body = await request.json();
  const { path, option, targetAuthor } = body as {
    path: string;
    option: string;
    targetAuthor?: string;
  };

  if (!path || !option) {
    return NextResponse.json({ error: "Missing path or option" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Resolve the numeric GitHub repo ID
  const session = await supabase.auth.getSession();
  const githubService = new GithubService(session, owner, repo);
  const repoId = await githubService.getRepoId();

  // Look up the entity_id for this path in the repos table
  const { data: row, error: lookupError } = await supabase
    .from("repos")
    .select("entity_id")
    .eq("repo_id", repoId)
    .eq("path", path)
    .limit(1)
    .single();

  if (lookupError || !row) {
    return NextResponse.json(
      { error: "File not found in database. Make sure the repository has been processed." },
      { status: 404 }
    );
  }

  try {
    const result = await processChatbotRequest(
      option,
      row.entity_id,
      targetAuthor
    );
    return NextResponse.json({ result });
  } catch (err: any) {
    console.error("[analyze] processChatbotRequest error:", err);
    return NextResponse.json({ error: err.message || "Analysis failed" }, { status: 500 });
  }
}
