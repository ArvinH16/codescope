import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  const accessToken = session?.provider_token;
  console.log("GitHub access token:", accessToken);
  if (error || !accessToken) {
    return NextResponse.json({ error: "Unauthorized or missing GitHub token" }, { status: 401 });
  }

  const res = await fetch("https://api.github.com/user/repos?per_page=100", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch GitHub repositories" }, { status: res.status });
  }

  const repos = await res.json();
  return NextResponse.json(repos);
}