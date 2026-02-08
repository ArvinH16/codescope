import { GithubService } from "@/lib/github-service";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest, context: { params: Promise<{ owner: string, repo: string }> }){
    const { owner, repo } = await context.params;
    if (!owner || !repo) {
        return NextResponse.json({ error: "Missing owner or repo parameter" }, { status: 400 });
    }
    
    const supabase = await createClient();
    const session = await supabase.auth.getSession();
    const githubService = new GithubService(session, owner, repo);
    const tree = await githubService.getMainBranch();
    const exampleBlames = await githubService.getBlame("main", "lib/ai.summarizer.ts");
    console.log(exampleBlames);
    return NextResponse.json(tree);
}