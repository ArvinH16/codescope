import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ owner: string; repo: string }> }
) {
    const { owner, repo } = await context.params;

    if (!repo || typeof repo !== "string") {
        return NextResponse.json(
            { error: "Missing or invalid repo parameter" },
            { status: 400 }
        );
    }

    const supabase = await createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const token = session?.provider_token;

    if (!token || !owner) {
        return NextResponse.json(
            { error: "Missing GitHub token or owner" },
            { status: 401 }
        );
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
        const res = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/stats/contributors`,
            { headers }
        );

        if (res.status === 202) {
            // GitHub is still calculating stats. Return an empty list or a specific code so frontend can retry or show loading.
            // For now, let's return a 202 implementation on our end too, or just empty list with a warning.
            return NextResponse.json({ contributors: [], status: "calculating" }, { status: 202 });
        }

        if (!res.ok) {
            // Handle other errors
            return NextResponse.json({ error: `GitHub API error: ${res.statusText}` }, { status: res.status });
        }

        const data = await res.json();

        // Data is an array of objects:
        // {
        //   total: number (total commits),
        //   weeks: [{ w, a, d, c }],
        //   author: { login, avatar_url, ... }
        // }

        // Check if it is an array
        if (!Array.isArray(data)) {
            return NextResponse.json({ contributors: [] });
        }

        const formattedData = data.map((item: any) => {
            const weeks = item.weeks || [];
            const additions = weeks.reduce((acc: number, w: any) => acc + w.a, 0);
            const deletions = weeks.reduce((acc: number, w: any) => acc + w.d, 0);

            // Calculate basic trend.
            // Compare last week's commits to the average of the last 4 weeks (excluding last week if possible? or just simple comparison).
            // Let's take the last week vs the 2nd to last week for a simple "up/down".
            const lastWeek = weeks[weeks.length - 1];
            const prevWeek = weeks[weeks.length - 2];

            let trend = 'stable';
            let trendValue = '0%';

            if (lastWeek && prevWeek) {
                const current = lastWeek.c;
                const previous = prevWeek.c;

                if (current > previous) {
                    trend = 'up';
                    // Avoid division by zero
                    const percent = previous === 0 ? 100 : Math.round(((current - previous) / previous) * 100);
                    trendValue = `+${percent}%`;
                } else if (current < previous) {
                    trend = 'down';
                    const percent = previous === 0 ? 0 : Math.round(((previous - current) / previous) * 100);
                    trendValue = `-${percent}%`;
                }
            }

            return {
                name: item.author.login,
                avatar: item.author.avatar_url,
                commits: item.total,
                additions,
                deletions,
                trend,
                trendValue,
                // Expertise will be handled in frontend or we can randomize here.
                // Let's randomize here to ensure stability per request if we wanted, 
                // but frontend is fine too. Let's send raw data or processed data.
                // Given the plan says "Keep the 'Expertise' chips/badges with randomized filler data for now (e.g., picking from a list of skills)."
                // I'll leave it to the frontend to pick random skills to key it consistent for the session or just randomize every render (which might be jittery).
                // Better: Hash the username to pick skills deterministically.
            };
        });

        // Sort by commits descending
        formattedData.sort((a: any, b: any) => b.commits - a.commits);

        return NextResponse.json({ contributors: formattedData });

    } catch (error) {
        console.error("Error fetching contributors:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
