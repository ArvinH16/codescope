import { createClient } from '@/utils/supabase/server'

export async function pullAllRepositories() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.provider_token;
    const res = await fetch("https://api.github.com/user/repos", {
    headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
    },
    });
    const repos = await res.json();
    return repos;
}