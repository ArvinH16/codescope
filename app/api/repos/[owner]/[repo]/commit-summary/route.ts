

// Import all your services
import { summarizeCommit } from '@/lib/ai-summarizer'; 
import { GithubService } from '@/lib/github/github-service';   
import { saveSummaryToDB } from '@/lib/db-service';     
import { create } from 'domain';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { oneWeekAgo } from "@/utils/frontend/time/one-week-ago";
import type { GitHubCommit } from '@/utils/types/github';

// Grabs all summaries from the last week 
// And returns them as a list of commits
export async function GET(request: NextRequest, context: { params: Promise<{ owner: string, repo: string }> }){
    const { owner, repo } = await context.params;
    const supabase = await createClient();
    const session = await supabase.auth.getSession();
    const githubService = new GithubService(session, owner, repo);
    const lastWeekCommits = await githubService.lastWeekCommits() as GitHubCommit[];
    // This is like really horrid code 
    // It might end up being really slow if there are a lot of commits
    // TODO: We can optimize later though
    if (Array.isArray(lastWeekCommits)) {
      for (let i = 0; i < lastWeekCommits.length; i++) {
        const commit = lastWeekCommits[i];
        const commitMessage = commit.commit.message;
        const sha = commit.sha;
        const files = await githubService.getCommitDiff(sha);
        for (const file of files) {
          console.log(file);
        }
        // const summaryText = await summarizeCommit(commitMessage, files);
        // console.log(summaryText);
        // For each commit, call the summary endpoint
      }
  } else {
        console.log("Not an array");
  }
    // 5. Save the result to the secure 'summaries' table
    // This is a security hazard for sure
    // People could reference our endpoints and then save information to our database
    // We need to have some sort of authentication process
    // await saveSummaryToDB(supabase, {
    //   user_id: user.id,
    //   repo_name: `${owner}/${repo}`,
    //   commit_sha: sha, // <-- FIX: Added commit_sha field
    //   summary: summaryText,
    // });

    // 6. Return the summary to the frontend
    // TEMPORARY COMMENT OUT FOR TESTING
    return NextResponse.json({ summary: "Temp" });

  // } catch (error: any) {
  //   console.error("Backend Pipeline Failure:", error.message);
    
  //   // Provide a user-friendly error if the token is bad or the repo is missing
  //   if (error.message.includes('404')) {
  //     return NextResponse.json({ error: 'Repository or commit not found on GitHub.' }, { status: 404 });
  //   }
    
  //   return NextResponse.json({ error: error.message }, { status: 500 });
  // }
}