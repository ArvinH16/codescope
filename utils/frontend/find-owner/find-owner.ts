export function findOwner(git_url : string) {
    return git_url.substring(git_url.indexOf("github.com/") + 11, git_url.lastIndexOf("/"));
}