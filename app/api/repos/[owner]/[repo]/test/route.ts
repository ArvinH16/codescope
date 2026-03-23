import { GitBlamesProcess } from "@/lib/github/git-blames-process";
import { GithubService } from "@/lib/github/github-service";
import { saveObjectToFile } from "@/utils/json/json-helper";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// This has been used to test miscelaneous tasks and constantly changes
// A better testing system should be made
export async function POST(request: NextRequest, context: { params: Promise<{ owner: string, repo: string }> }){
    const { owner, repo } = await context.params;
    if (!owner || !repo) {
        return NextResponse.json({ error: "Missing owner or repo parameter" }, { status: 400 });
    }
    
    const supabase = await createClient();
    const session = await supabase.auth.getSession();
    const githubService = new GithubService(session, owner, repo);
    const gitBlamesProcess = new GitBlamesProcess(githubService);
    const processedRepo = await gitBlamesProcess.processRepository();
    saveObjectToFile(`test-results/${owner}-${repo}-processed-repo.json`, processedRepo);
    const tree = await githubService.getMainBranch();
    saveObjectToFile(`test-results/${owner}-${repo}-github-tree.json`, tree);
    return NextResponse.json(tree);
}