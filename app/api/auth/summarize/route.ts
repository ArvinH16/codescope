import { NextResponse } from 'next/server';
import { summarizeCommit } from '@/lib/ai-summarizer';

export async function POST(request: Request) {
  try {
    // 1. Receive the data from the frontend
    const { message, files } = await request.json();

    // 2. Check if we actually got data
    if (!message || !files) {
      return NextResponse.json({ error: 'Missing commit data' }, { status: 400 });
    }

    // 3. Call the helper function we made in Step 3
    const summary = await summarizeCommit(message, files);

    // 4. Send the summary back to the frontend
    return NextResponse.json({ summary });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}