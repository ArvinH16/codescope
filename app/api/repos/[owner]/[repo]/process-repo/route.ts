import { GitBlamesProcess } from "@/lib/github/git-blames-process";
import { GithubService } from "@/lib/github/github-service";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { saveRepository } from "@/lib/supabase/db-service";
import { saveObjectToFile, turnMapToJSON } from "@/utils/json/json-helper";
// This route is responsible for processing a repository by fetching its data from GitHub,
// running the blames process to determine which author is responsible for each line of code,
// and then saving the processed data to the database. It is triggered when the user clicks the "Process Repository" button on the frontend.
export async function POST(request: NextRequest, context: { params: Promise<{ owner: string; repo: string }> }) {
    const { owner, repo } = await context.params;

    if(!owner || !repo) {
        return NextResponse.json({ error: "Missing owner or repo parameter" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = await supabase.auth.getSession();
    const githubService = new GithubService(session, owner, repo);
    const blameProcess = new GitBlamesProcess(githubService);
    const processedRepo = await blameProcess.processRepository();
    saveObjectToFile(`test-results/${owner}-${repo}-processed-repo.json`, processedRepo);
    const error = await saveRepository(supabase, processedRepo);

    if (error) {
        return NextResponse.json({ error: "Failed to save repository to database." }, { status: 500 });
    }

    return new NextResponse("Repository processed and saved successfully", { status: 200 });

}