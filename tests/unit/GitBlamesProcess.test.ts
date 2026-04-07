import { describe, it, expect, vi, beforeEach } from "vitest";
import { GitBlamesProcess } from "@/lib/github/git-blames-process";
import { GithubService } from "@/lib/github/github-service";
import { FakeGithubService } from "@/tests/fake-github-service";
import { BlameRange, GitNode } from "@/utils/types/github";

// Prevent tests from writing to test-results/ on disk
vi.mock("@/utils/json/json-helper", () => ({
  saveObjectToFile: vi.fn(),
}));

function makeBlob(path: string): GitNode {
  return { path, mode: "100644", type: "blob", sha: `sha-${path}` };
}

function makeTree(path: string): GitNode {
  return { path, mode: "040000", type: "tree", sha: `sha-${path}` };
}

function makeBlameRange(
  startingLine: number,
  endingLine: number,
  authorName: string
): BlameRange {
  return {
    startingLine,
    endingLine,
    age: 0,
    commit: {
      oid: "abc123",
      message: "commit message",
      committedDate: "2024-01-01T00:00:00Z",
      author: { name: authorName, email: `${authorName}@example.com` },
    },
  };
}

function buildProcess(fake: FakeGithubService): GitBlamesProcess {
  return new GitBlamesProcess(fake as unknown as GithubService);
}

describe("GitBlamesProcess.processRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("empty repo returns only the root node", async () => {
    const fake = new FakeGithubService("octocat", "Hello-World");
    fake.setTree([]);

    const result = await buildProcess(fake).processRepository();

    expect(result).toHaveLength(1);
    const root = result[0];
    expect(root.getPath()).toBe(".");
    expect(root.getIsFile()).toBe(false);
    expect(root.getTotalLines()).toBe(0);
    expect(root.getAuthors().size).toBe(0);
  });

  it("single blob with blame produces correct author map and file content", async () => {
    const fake = new FakeGithubService("octocat", "Hello-World");
    fake.setTree([makeBlob("README.md")]);
    fake.setFileContent("README.md", "line one\nline two");
    fake.setBlame("README.md", [makeBlameRange(1, 2, "Alice")]);

    const result = await buildProcess(fake).processRepository();

    // Result: [README.md blob, root]
    expect(result).toHaveLength(2);

    const file = result.find((f) => f.getPath() === "README.md")!;
    expect(file.getIsFile()).toBe(true);
    expect(file.getTotalLines()).toBe(2);
    expect(file.getAuthors().get("Alice")).toBe(2);

    // Verify blamed content format: (Author - date) lineNum) content
    const content = file.getFileContent();
    expect(content).toContain("(Alice - 2024-01-01T00:00:00Z) 1) line one");
    expect(content).toContain("(Alice - 2024-01-01T00:00:00Z) 2) line two");
  });

  it("blob with no blame falls back to nullBlame format", async () => {
    const fake = new FakeGithubService("octocat", "Hello-World");
    fake.setTree([makeBlob("index.ts")]);
    fake.setFileContent("index.ts", "const x = 1;\nconst y = 2;");
    fake.setBlame("index.ts", []); // empty blame

    const result = await buildProcess(fake).processRepository();

    const file = result.find((f) => f.getPath() === "index.ts")!;
    expect(file.getIsFile()).toBe(true);
    expect(file.getTotalLines()).toBe(2);

    const content = file.getFileContent();
    expect(content).toContain("No blame info available 1) const x = 1;");
    expect(content).toContain("No blame info available 2) const y = 2;");

  });

  it("directory with two blob children aggregates author contributions and line counts", async () => {
    const fake = new FakeGithubService("octocat", "Hello-World");
    fake.setTree([
      makeTree("src"),
      makeBlob("src/a.ts"),
      makeBlob("src/b.ts"),
    ]);
    fake.setFileContent("src/a.ts", "a1\na2\na3"); // 3 lines
    fake.setFileContent("src/b.ts", "b1\nb2");     // 2 lines
    fake.setBlame("src/a.ts", [makeBlameRange(1, 3, "Alice")]);
    fake.setBlame("src/b.ts", [makeBlameRange(1, 2, "Bob")]);

    const result = await buildProcess(fake).processRepository();

    // Result: [src/a.ts, src/b.ts, src dir, root]
    expect(result).toHaveLength(4);

    const dir = result.find((f) => f.getPath() === "src")!;
    expect(dir.getIsFile()).toBe(false);
    expect(dir.getTotalLines()).toBe(5);
    expect(dir.getAuthors().get("Alice")).toBe(3);
    expect(dir.getAuthors().get("Bob")).toBe(2);

    const root = result.find((f) => f.getPath() === ".")!;
    expect(root.getTotalLines()).toBe(5);
    expect(root.getAuthors().get("Alice")).toBe(3);
    expect(root.getAuthors().get("Bob")).toBe(2);
  });

  it("nested directories aggregate recursively", async () => {
    const fake = new FakeGithubService("octocat", "Hello-World");
    fake.setTree([
      makeTree("src"),
      makeTree("src/utils"),
      makeBlob("src/utils/helper.ts"),
    ]);
    fake.setFileContent("src/utils/helper.ts", "line1\nline2\nline3"); // 3 lines
    fake.setBlame("src/utils/helper.ts", [makeBlameRange(1, 3, "Charlie")]);

    const result = await buildProcess(fake).processRepository();

    // Result: [helper.ts, utils dir, src dir, root]
    expect(result).toHaveLength(4);

    const utils = result.find((f) => f.getPath() === "src/utils")!;
    expect(utils.getTotalLines()).toBe(3);
    expect(utils.getAuthors().get("Charlie")).toBe(3);

    const src = result.find((f) => f.getPath() === "src")!;
    expect(src.getTotalLines()).toBe(3);
    expect(src.getAuthors().get("Charlie")).toBe(3);
  });

  it("multiple authors on same file are counted correctly", async () => {
    const fake = new FakeGithubService("octocat", "Hello-World");
    fake.setTree([makeBlob("main.ts")]);
    // 6-line file: lines 1-4 by Alice, lines 5-6 by Bob
    fake.setFileContent("main.ts", "l1\nl2\nl3\nl4\nl5\nl6");
    fake.setBlame("main.ts", [
      makeBlameRange(1, 4, "Alice"),
      makeBlameRange(5, 6, "Bob"),
    ]);

    const result = await buildProcess(fake).processRepository();

    const file = result.find((f) => f.getPath() === "main.ts")!;
    expect(file.getTotalLines()).toBe(6);
    expect(file.getAuthors().get("Alice")).toBe(4);
    expect(file.getAuthors().get("Bob")).toBe(2);

    const percentages = file.getContributionPercentages();
    expect(percentages.get("Alice")).toBeCloseTo(4 / 6);
    expect(percentages.get("Bob")).toBeCloseTo(2 / 6);
  });
});
