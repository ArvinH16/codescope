import { createClient } from '@supabase/supabase-js';
import type { SessionResult } from '@/utils/types/supabase';
import { Session } from 'inspector';
import { oneWeekAgo } from '@/utils/frontend/time/one-week-ago';
import { BlameRange, GitNode } from '@/utils/types/github';
// Define the shape of the data we want from GitHub
interface CommitFile {
  filename: string;
  status: string;
  patch?: string; // The code diff the AI needs
}
// Pass information for a repository and then this object works as a way to interact with the 
// GitHub API in an authenticated way (using the provider token from Supabase) easily
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
  
  public async getFileContent(branch: string, filePath: string) {
    const data = await this.fetchGithub(`/repos/${this.owner}/${this.repo}/contents/${filePath}?ref=${branch}`);
    return data;
  }
  /*
    * 4. Get the tree structure of the repository (for context)
      * This is useful for the AI to understand the file structure and where changes are happening
      * This method takes from the main branch
  */
  public async getMainBranch() {
      const data =  await this.fetchGithub(`/repos/${this.owner}/${this.repo}/git/trees/main?recursive=1`)
      return data.tree as GitNode[];
    }
  
  /*
    * 4. Get the tree structure of the repository (for context)
      * This is useful for the AI to understand the file structure and where changes are happening
      * This method takes from the provided branch
  */
    public async getTreeBranch(branch : string) {
      const data = await this.fetchGithub(`/repos/${this.owner}/${this.repo}/git/trees/${branch}?recursive=1`)
      return data.tree as GitNode[];
    }
    
    public async getRepoId() {
      const data = await this.fetchGithub(`/repos/${this.owner}/${this.repo}`);
      return data.id;
    }

    public async getBlame(branch: string, filePath: string) {
      //
      // 2. If it's not a Blob, return null (directories, binaries, submodules, etc.)
      //
      const typename = await this.getFileType(branch, filePath);
      if (typename !== "Blob") {
        return [] as BlameRange[];
      }

      //
      // 3. Second query: safe blame query (only runs if Blob)
      //
      const blameQuery = `query {
      repositoryOwner(login: "${this.owner}") {
        repository(name: "${this.repo}") {
          object(expression: "${branch}") {
            ... on Commit {
              blame(path: "${filePath}") {
                ranges {
                  startingLine
                  endingLine
                  age
                  commit {
                    oid
                    message
                    committedDate
                    author {
                    name
                    email
                  }
                }
              }
            }
          }
        }
      }
    }
    }
      `;

      const blameResponse = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.provider_token}`,
        },
        body: JSON.stringify({
          query: blameQuery,
        }),
      });

      if (!blameResponse.ok) {
        throw new Error(`GitHub GraphQL API Error: ${blameResponse.statusText}`);
      }

      const blameResult = await blameResponse.json();
      return blameResult.data.repositoryOwner.repository.object.blame.ranges as BlameRange[];

  }

  private async getFileType(branch: string, filePath: string) {
    //
    // 1. First query: ask GitHub what type this object actually is
    //
    const typeQuery = `
      query ($owner: String!, $repo: String!, $expression: String!) {
        repository(owner: $owner, name: $repo) {
          object(expression: $expression) {
            __typename
          }
        }
      }
    `;

    const expression = `${branch}:${filePath}`;

    const typeResponse = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.provider_token}`,
      },
      body: JSON.stringify({
        query: typeQuery,
        variables: {
          owner: this.owner,
          repo: this.repo,
          expression,
        },
      }),
    });

    if (!typeResponse.ok) {
      throw new Error(`GitHub GraphQL API Error: ${typeResponse.statusText}`);
    }

    const typeResult = await typeResponse.json();
    const typename = typeResult.data.repository.object?.__typename;
    return typename;
  }

  public getRepo() {
    return this.repo;
  }

  public getOwner() {
    return this.owner;
  }
}