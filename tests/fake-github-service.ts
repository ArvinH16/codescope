import { BlameRange, GitNode } from "@/utils/types/github";

// A test double for GithubService that avoids real HTTP calls.
// Configure per-test by calling the setter methods before running the code under test.
export class FakeGithubService {
  private repoId: string = "fake-repo-id";
  private ownerName: string;
  private repoName: string;
  private tree: GitNode[] = [];
  private blames = new Map<string, BlameRange[]>();
  // Store decoded content; getFileContent() will base64-encode it before returning
  private fileContents = new Map<string, string>();

  constructor(owner: string, repo: string) {
    this.ownerName = owner;
    this.repoName = repo;
  }

  // --- Setup helpers ---

  setRepoId(id: string) {
    this.repoId = id;
  }

  setTree(tree: GitNode[]) {
    this.tree = tree;
  }

  setBlame(path: string, blames: BlameRange[]) {
    this.blames.set(path, blames);
  }

  // Pass the plain text content; the fake will base64-encode it when returned
  setFileContent(path: string, content: string) {
    this.fileContents.set(path, content);
  }

  // --- GithubService interface (methods used by GitBlamesProcess) ---

  async getRepoId(): Promise<string> {
    return this.repoId;
  }

  // Returns a fresh copy so callers can mutate via shift() without affecting the stored tree
  async getMainBranch(): Promise<GitNode[]> {
    return [...this.tree];
  }

  async getBlame(_branch: string, path: string): Promise<BlameRange[]> {
    return this.blames.get(path) ?? [];
  }

  async getFileContent(_branch: string, path: string): Promise<{ content: string }> {
    const decoded = this.fileContents.get(path) ?? "";
    return { content: Buffer.from(decoded).toString("base64") };
  }

  getOwner(): string {
    return this.ownerName;
  }

  getRepo(): string {
    return this.repoName;
  }
}
