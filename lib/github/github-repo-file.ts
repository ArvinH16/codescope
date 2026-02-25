interface Comparable<T> {
  compareTo(other: T): number;
}

export class GitHubRepoFile implements Comparable<GitHubRepoFile> {
    private repositoryName: string;
    private filepath: string;
    private fileContent: string;
    private authors: Map<string, number>;
    private isFile: boolean;
    private totalLines: number;
    private contributionPercentages: Map<string, number>;
    // This constructs a GitHubRepoFile and fills in all necesarry information
    // The totalLines is used to calculate the contribution percentage of each author
    // If this file is a blob it should be the number of lines in the file
    // If it is a tree it should be the total number of lines in all the files in that tree
    // fileContent should be the post-blames processed file
    // The authors array should have the contribution percentage of each author for that file
    constructor(repositoryName: string, filepath: string, fileContent: string, authors: Map<string, number>, isFile: boolean, totalLines: number) {
        this.repositoryName = repositoryName;
        this.filepath = filepath;
        this.fileContent = fileContent;
        this.authors = authors;
        this.isFile = isFile;
        this.totalLines = totalLines;
        this.contributionPercentages = this.percentAuthorContributions(authors, totalLines);
    }

    // calculates the percent of lines written by each author in the authorContributions map
    // Returns a new map where each author is mapped to their percentage contribution
    private percentAuthorContributions(authorContributions : Map<string, number>, totalLines: number) {
        let percentContributions = new Map<string, number>();
        for (let [author, contribution] of authorContributions.entries()) {
            percentContributions.set(author, contribution / totalLines);
        }

        return percentContributions;
    }
    
    public static compare(a: GitHubRepoFile, b: GitHubRepoFile): number {
        return a.compareTo(b);
    }

    // Allows for sorting of the githubrepo files by their file paths
    // So that files in the same directory are grouped together and the files are in a consistent order
    public compareTo(other: GitHubRepoFile): number {
        return this.filepath.localeCompare(other.filepath);
    }
    
    public getFilepath() {
        return this.filepath;
    }

    public getFileContent() {
        return this.fileContent;
    }

    public getAuthors() {
        return this.authors;
    }

    public getIsFile() {
        return this.isFile;
    }

    public getTotalLines() {
        return this.totalLines;
    }

    public getContributionPercentages() {
        return this.contributionPercentages;
    }
}
