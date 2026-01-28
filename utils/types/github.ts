export type GitHubCommit = {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  html_url: string;
};

export type GithubFile = {
  filename: string;
  status: string;
  patch?: string;
};

export type GitHubCommitFile = {
  filename: string;
  status: "added" | "modified" | "removed";
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
};

export type CommitFile = {
  filename: string;
  status: string;
  patch?: string;
};