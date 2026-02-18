import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, context: { params: Promise<{ owner: string, repo: string }> }){
    const { owner, repo } = await context.params;
    if (!owner || !repo) {
        return NextResponse.json({ error: "Missing owner or repo parameter" }, { status: 400 });
    }
    
}