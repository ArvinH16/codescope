import { BlameRange, GitNode } from "@/utils/types/github";
import { GithubService } from "./github-service";
import { GitHubRepoFile } from "./github-repo-file";
// TODO: Figure out a way to work around github API limiting the number of tree entries to 100k
// Generally attempt to solve large repos

// This class is responsible for processing a repository and producing a list of GitHubRepoFile objects
export class GitBlamesProcess {
    private githubService: GithubService;
    private gitId: string;

    constructor(githubService: GithubService) {
        this.githubService = githubService;
        this.gitId = "";
    }

    // Processes the repository associated with the github service 
    // Returns a list of GitHubRepoFiles that represent the processed repository
    public async processRepository(): Promise<GitHubRepoFile[]> {
        this.gitId = await this.githubService.getRepoId();
        const tree = await this.githubService.getMainBranch();
        let processedRepo : GitHubRepoFile[] = []; 
        let children : GitHubRepoFile[] = []; 
        const isImmediateChild = new RegExp(`^[^/]+$`);
        // This assume githubtree returns it sorted in a way that all the children 
        // of a directory are grouped together, which is what I have observed 
        // but I don't know if it is guaranteed
        while (tree.length > 0 && tree[0] && isImmediateChild.test(tree[0].path)) {
            const child = await this.processRepositoryHelper(tree, processedRepo);
            if (child) {
                children.push(child);
            }
        }
        let authorContributions = new Map<string, number>();
        let totalLines = 0;
        for (let child of children) {
            totalLines += child.getTotalLines();
            authorContributions = this.mergeAuthorContributions(authorContributions, child.getAuthors());
        }

        const repoFile: GitHubRepoFile = new GitHubRepoFile(
            this.githubService.getRepo(),
            this.githubService.getOwner(),
            this.gitId,
            ".",
            "",
            authorContributions,
            false,
            totalLines);
        processedRepo.push(repoFile);
        return processedRepo;
    }

    // The helper method that processes the repository recursively
    // Takes the remaining unprocessed part of the tree as a list of Gitnodes
    // And the list of already processed GitHubRepoFiles, then continues to process the tree
    // Proccesses a single file, adds it to the processedRepo, and returns that file.
    private async processRepositoryHelper(tree : GitNode[], 
                                          processedRepo : GitHubRepoFile[]) : 
                                          Promise<GitHubRepoFile | null>{
        const file = tree.shift(); 
        if (!file) {
            return null;
        } else if (file.type === "blob") {
            const blames = await this.githubService.getBlame("main", file.path);
            const fileContent = await this.githubService.getFileContent("main", file.path);
            const decoded = Buffer.from(fileContent.content, "base64").toString("utf8");
            const {blamedFile, authorContributions, totalLines} = await this.produceBlame(decoded, blames);
            const repoFile: GitHubRepoFile = new GitHubRepoFile(
                this.githubService.getRepo(),
                this.githubService.getOwner(),
                this.gitId,
                file.path,
                blamedFile,
                authorContributions,
                true,
                totalLines);
                
            processedRepo.push(repoFile);
            return repoFile;
        // If it is not a blob it's a tree
        } else {
            let path = file.path;
            let children : GitHubRepoFile[] = []; 
            const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const isImmediateChild = new RegExp(`^${escaped}/[^/]+$`);
            // This assume githubtree returns it sorted in a way that all the children 
            // of a directory are grouped together, which is what I have observed 
            // but I don't know if it is guaranteed
            while (tree.length > 0 && tree[0] && isImmediateChild.test(tree[0].path)) {
                const child = await this.processRepositoryHelper(tree, processedRepo);
                if (child) {
                    children.push(child);
                }
            }
            let authorContributions = new Map<string, number>();
            let totalLines = 0;
            for (let child of children) {
                totalLines += child.getTotalLines();
                authorContributions = this.mergeAuthorContributions(authorContributions, child.getAuthors());
            }

            const repoFile: GitHubRepoFile = new GitHubRepoFile(
                this.githubService.getRepo(),
                this.githubService.getOwner(),
                this.gitId,
                path,
                "",
                authorContributions,
                false,
                totalLines);
            processedRepo.push(repoFile);
            return repoFile;
        }
    }

    // This method takes in the decoded file content as a string and the blames for that file
    // It then produces a new string that has the blame information attached to the beginning of each line
    // Line format is as follow:
    // <commit sha> (<author name> - <committed date>) <line number>) <line content>
    // Then returns this new string
    private async produceBlame(fileContent : string, blames : BlameRange[]) {
        if (blames == null || blames.length === 0) {
            return this.nullBlame(fileContent);
        }

        let lines = fileContent.split("\n");
        let blamedFile = "";
        let blameIndex = 0;
        let authorContributions = new Map<string, number>();
        let blame = blames[blameIndex];
        for (let line = 1; line <= lines.length; line++) {
            if (blame && line > blame.endingLine) {
                for (let i = blameIndex + 1; i < blames.length; i++) {
                    if (line >= blames[i].startingLine && line <= blames[i].endingLine) {
                        blameIndex = i;
                        blame = blames[blameIndex];
                        break;
                    }
                }
            }
            const lineContent = lines[line - 1];
            if (blame && line >= blame.startingLine && line <= blame.endingLine) {
                try {
                    const { author, message, committedDate, oid } = blame.commit;
                    authorContributions.set(author.name, 
                                            (authorContributions.get(author.name) ?? 0) + 1);
                    blamedFile += `(${author.name} - ${committedDate}) ${line}) ${lineContent}\n`;
                } catch (error) {
                    console.error("Error processing blame for line", line, error);
                    blamedFile += `No blame info available ${line}) ${lineContent}\n`;
                }
            } else {
                // If no blame for this line, just output the line content without blame info
                blamedFile += `No blame info available ${line}) ${lineContent}\n`;
            }
        }
        const cleanBlamedFile = blamedFile.replace(/\u0000/g, "\\0");
        return { blamedFile : cleanBlamedFile, 
                authorContributions : authorContributions, 
                totalLines : lines.length, };

        
    }

    // In case the blame query fails and returns null or an empty blames
    // Then it returns the file content but with a note that there is no blame info
    // Takes the file content as a string and returns a new string with the same content
    // But with a note at the beggining of each line that there is no blame info available
    private nullBlame(fileContent : string) {
        let lines = fileContent.split("\n");
        let blamedFile = "";
        let authorContributions = new Map<string, number>();
        for (let line = 1; line <= lines.length; line++) {
            const lineContent = lines[line - 1];
            blamedFile += `No blame info available ${line}) ${lineContent}\n`;
        }
        return { blamedFile : blamedFile, authorContributions : authorContributions, totalLines : lines.length };
    }

    private mergeAuthorContributions(map1 : Map<string, number>, map2 : Map<string, number>) {
        let merged = new Map<string, number>(map1);
        for (let [author, contribution] of map2.entries()) {
            merged.set(author, (merged.get(author) ?? 0) + contribution);
        }
        return merged;
    }
}
