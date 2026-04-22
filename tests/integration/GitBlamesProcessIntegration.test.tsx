import { describe, it, expect } from 'vitest'
import { GithubService } from '@/lib/github/github-service'
import { Polly } from "@pollyjs/core";
import FetchAdapter from "@pollyjs/adapter-fetch";
import FSPersister from "@pollyjs/persister-fs";
import { GitBlamesProcess } from '@/lib/github/git-blames-process';
import path from "path";

Polly.register(FetchAdapter);
Polly.register(FSPersister);


describe("GitHubService integration test with PollyJS", () => {
  it("fetches repository data and saves to database", async () => {
    const polly = new Polly("github-service-integration-test", {
      adapters: ["fetch"],
      persister: "fs",
      persisterOptions: {
        fs: {
          recordingsDir: path.resolve(__dirname, "__recordings__"),
        },
      },
      // Use "record" on first run to hit the real API and save fixtures,
      // then switch to "replay" to use saved recordings.
      mode: "record",
    });

    try {
      const session = {
        data: {
          session: {
            provider_token: "test-github-token",
            provider_refresh_token: null,
            access_token: "",
            refresh_token: "",
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            token_type: "bearer" as const,
            user: {
              id: "",
              app_metadata: {},
              user_metadata: {},
              aud: "authenticated",
              created_at: new Date().toISOString(),
            },
          },
        },
        error: null,
      };

      const githubService = new GithubService(session, "octocat", "Hello-World");
      const gitBlamesProcess = new GitBlamesProcess(githubService);
      const result = await gitBlamesProcess.processRepository();

      await polly.stop();

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].getRepoId()).toBeDefined();
      expect(result[0].getPath()).toBe(".");
    } catch (error) {
      await polly.stop();
      throw error;
    }
  });
})
