import {author} from "./author";
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

export type GitNode = {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
}

export type RepoNode = {
  path: string;
  name: string;
  parent_path: string | null;
  type: "file" | "directory";
  sha: string;
  size: number | null;
  depth: number;
}

export type BlameRange = {
  startingline: number;
  endlingline: number;
  age: number;
  commit: {
    message: string;
    committedDate: string;
    author: author;
  }
}