import { createClient } from '@supabase/supabase-js';
import type { SessionResult } from '@/utils/types/supabase';
import { Session } from 'inspector';
import { oneWeekAgo } from '@/utils/frontend/time/one-week-ago';
// Define the shape of the data we want from GitHub
interface CommitFile {
  filename: string;
  status: string;
  patch?: string; // The code diff the AI needs
}

export class GithubService {
  private provider_token: string;
  private owner: string;
  private repo: string;

  // The session is what you get from
  // supbase.auth.getSession()
  constructor(session : SessionResult, owner: string, repo: string) {
    const token = session.data.session?.provider_token;
    if (!token) {
    throw new Error("Missing GitHub token");
    }
    this.provider_token = token;
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * 2. Helper to make authenticated requests to GitHub
   * Returns the json object 
   */
  public async fetchGithub(endpoint: string) {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.provider_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Fetches and returns all commits made to the main branch in the last week
  public async lastWeekCommits() {
    const oneWeekAgoISO = oneWeekAgo();
      // const lastWeekCommitsRes = githubService.fetchGithub(`${owner}/${repo}/commits?since=${oneWeekAgoISO}`);
      // THIS IS FOR TESTING:
      return this.fetchGithub(`/repos/${this.owner}/${this.repo}/commits?per_page=1`);
  }
  /**
   * 3. Get the detailed files/changes for a specific commit
   */
  public async getCommitDiff(sha: string) {
    const data = await this.fetchGithub(`/repos/${this.owner}/${this.repo}/commits/${sha}`)
    return data.files as CommitFile[];
  }
}