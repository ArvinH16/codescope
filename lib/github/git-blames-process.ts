import { BlameRange } from "@/utils/types/github";
import { GithubService } from "./github-service";

export class GitBlamesProcess {
    private githubService: GithubService;

    constructor(githubService: GithubService) {
        this.githubService = githubService;
    }

    public async produceBlame(fileContent : string, blames : BlameRange[]) {
        
    }

}