import { createClient } from '@supabase/supabase-js';

// Define the shape of the data we want from GitHub
interface CommitFile {
  filename: string;
  status: string;
  patch?: string; // The code diff the AI needs
}

export class GithubService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  /**
   * 1. Fetches the user's token from the secure 'profiles' table
   */
  static async forUser(supabaseClient: any, userId: string) {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('github_access_token')
      .eq('id', userId)
      .single();

    if (error || !data?.github_access_token) {
      throw new Error("User has no GitHub token connected");
    }

    return new GithubService(data.github_access_token);
  }

  /**
   * 2. Helper to make authenticated requests to GitHub
   */
  private async fetchGithub(endpoint: string) {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 3. Get the detailed files/changes for a specific commit
   */
  async getCommitDiff(owner: string, repo: string, sha: string) {
    const data = await this.fetchGithub(`/repos/${owner}/${repo}/commits/${sha}`);
    
    const files: CommitFile[] = data.files.map((f: any) => ({
      filename: f.filename,
      status: f.status,
      patch: f.patch,
    }));

    return {
      message: data.commit.message,
      files: files
    };
  }
}