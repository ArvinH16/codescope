import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export type ChatbotOption = 'contributors' | 'author_work' | 'file_summary';

export interface FileEntry {
    entity_id: string;
    path: string;
    repo_id: string;
    author_list: any; // jsonb (Array or Record<string, number>)
    file_content: any; // jsonb (string with blames data or array of strings)
}

export async function processChatbotRequest(
    option: ChatbotOption,
    entity_id: string,
    targetAuthor?: string
): Promise<string> {
    // Fetch the file entry from the Supabase database
    const supabase = await createClient();
    const { data: fileData, error } = await supabase
        .from('repos') // Replace 'files' with your actual table name if different
        .select('*')
        .eq('entity_id', entity_id)
        .single();

    if (error || !fileData) {
        throw new Error(`Failed to fetch file from database: ${error?.message || 'File not found'}`);
    }

    const file: FileEntry = fileData as FileEntry;

    // 1. Contributors option
    if (option === 'contributors') {
        // Determine the list of authors based on jsonb format
        let authors: string[] = [];
        if (Array.isArray(file.author_list)) {
            authors = typeof file.author_list[0] === 'string'
                ? file.author_list
                : file.author_list.map((a: any) => a.name || JSON.stringify(a));
        } else if (typeof file.author_list === 'object' && file.author_list !== null) {
            authors = Object.keys(file.author_list);
        }

        if (authors.length <= 10) {
            return `The contributors to this file are: ${authors.join(', ')}`;
        } else {
            // Access blame data to find 10 most recent
            let lines: string[] = [];
            if (typeof file.file_content === 'string') {
                lines = file.file_content.split('\n');
            } else if (Array.isArray(file.file_content)) {
                lines = typeof file.file_content[0] === 'string'
                    ? file.file_content
                    : file.file_content.map((c: any) => JSON.stringify(c));
            }

            const authorTimestamps = new Map<string, number>();
            // blame format from git-blames-process: "(<author name> - <committed date>) <line number>) <line content>"
            const blameRegex = /^\((.+?) - (.+?)\) \d+\)/;

            for (const line of lines) {
                if (line.startsWith('No blame info')) continue;
                const match = line.match(blameRegex);
                if (match) {
                    const author = match[1];
                    const dateStr = match[2];
                    const timestamp = new Date(dateStr).getTime();
                    if (!isNaN(timestamp)) {
                        const existing = authorTimestamps.get(author) || 0;
                        if (timestamp > existing) {
                            authorTimestamps.set(author, timestamp);
                        }
                    }
                }
            }

            if (authorTimestamps.size === 0) {
                return `There are ${authors.length} contributors. (Could not parse timestamps to find the 10 most recent)`;
            }

            const sortedAuthors = Array.from(authorTimestamps.entries())
                .sort((a, b) => b[1] - a[1]) // Newest to oldest
                .slice(0, 10)
                .map(entry => entry[0]);

            return `There are ${authors.length} contributors. The 10 most recent are: ${sortedAuthors.join(', ')}`;
        }
    }

    // 2. What has [author] worked on in this file?
    if (option === 'author_work') {
        if (!targetAuthor) {
            throw new Error("Target author is required for this option.");
        }

        let lines: string[] = [];
        if (typeof file.file_content === 'string') {
            lines = file.file_content.split('\n');
        } else if (Array.isArray(file.file_content)) {
            lines = typeof file.file_content[0] === 'string'
                ? file.file_content
                : file.file_content.map((c: any) => JSON.stringify(c));
        }

        // Match exactly the author in the blame pattern to avoid substring issues
        const prefixMatch = `(${targetAuthor} - `;
        const authorLines = lines.filter(line => line.startsWith(prefixMatch));

        if (authorLines.length === 0) {
            return `No work found for ${targetAuthor} in this file.`;
        }

        const snippetCollection = authorLines.join('\n');

        const prompt = `You are an expert Senior Developer and Repository Architect. I am providing you with every line of code authored by ${targetAuthor} within the file ${file.path}.

YOUR TASK:
Analyze the provided code snippets and categorize this contributor's role in this specific file.
   What are the primary functional areas they touched? (e.g., core logic, UI styling, data fetching, or boilerplate).
   Based on the complexity of the lines, are they the primary architect of this logic or providing maintenance/updates?
   Provide a concise, two-sentence summary of their 'Technical Identity' for this file.

CONSTRAINT: Do not list the line numbers in your final answer; use them only to understand the context and flow of the work.

THE DATA:
${snippetCollection}`;

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are an expert Senior Developer and Repository Architect." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.4,
            });
            return completion.choices[0]?.message?.content || "No response generated.";
        } catch (error: any) {
            console.error("OpenAI API Error:", error);
            throw new Error(`Failed to generate response: ${error.message}`);
        }
    }

    // 3. Summary of file
    if (option === 'file_summary') {
        let fullBlameDataArray = '';

        if (typeof file.file_content === 'string') {
            fullBlameDataArray = file.file_content;
        } else if (Array.isArray(file.file_content)) {
            fullBlameDataArray = typeof file.file_content[0] === 'string'
                ? file.file_content.join('\n')
                : JSON.stringify(file.file_content, null, 2);
        } else {
            fullBlameDataArray = JSON.stringify(file.file_content, null, 2);
        }

        const prompt = `You are an expert software architect. I am providing you with the complete git blame history for the file located at: ${file.path}.

YOUR TASK:
Analyze the logic, code patterns, and the evolution of the authors in this dataset. In three concise sentences, provide a technical summary of exactly what this file's primary architectural responsibility is.

THE DATASET:
${fullBlameDataArray}`;

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are an expert software architect." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.4,
            });
            return completion.choices[0]?.message?.content || "No response generated.";
        } catch (error: any) {
            console.error("OpenAI API Error:", error);
            throw new Error(`Failed to generate summary: ${error.message}`);
        }
    }

    throw new Error("Invalid chatbot option selected.");
}
