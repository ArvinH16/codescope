import { GithubService } from "@/lib/github/github-service";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Returns the repository tree from GitHub for a given repository. 
// This is used for testing and debugging purposes to compare the 
// tree from GitHub with the tree stored in the database after processing.
export async function GET(request: NextRequest, context: { params: Promise<{ owner: string, repo: string }> }){
    const { owner, repo } = await context.params;
    if (!owner || !repo) {
        return NextResponse.json({ error: "Missing owner or repo parameter" }, { status: 400 });
    }
    
    const supabase = await createClient();
    const session = await supabase.auth.getSession();
    const githubService = new GithubService(session, owner, repo);
    const tree = await githubService.getMainBranch();
    return NextResponse.json(tree);
}