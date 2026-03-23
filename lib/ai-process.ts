import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { turnJSONToMap } from '@/utils/json/json-helper';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



export interface FileEntry {
    entity_id: string;
    path: string;
    repo_id: string;
    file_content: string; // jsonb 
    author_list: Map<string, number>;
}
// This function takes in which option to execute and potential 
// parameters that are needed for some options,
// Then it executes the correspondign logic andp performs all necesarry operations
// Currently operations are contributors listing, stating author work, and file summary
// Throws errors if an invalid option is provided or if there 
// are any issues with the database or the OpenAI API
export async function processAIRequest(
    option: string,
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
    if (option != 'contributors' && option != 'author_work' && option != 'file_summary') {
        throw new Error("Invalid option provided.");
    }
    
    const file: FileEntry = {...fileData, author_list: turnJSONToMap(fileData.author_list)};

    // 1. Contributors option
    if (option === 'contributors') {
        return listContributors(file);
    } else if (option === 'author_work') {
        return await authorWork(file, targetAuthor || '');
    } else {
        return await fileSummary(file);
    }
}

function listContributors(file : FileEntry): string {
    // Determine the list of authors based on jsonb format
    if (file.author_list instanceof Map && file.author_list.size > 0) {
        return `The contributors to this file are: ${Array.from(file.author_list.keys()).join(', ')}`;
    } else {
        return "No contributors found for this file.";
    }
}

async function authorWork(file: FileEntry, targetAuthor: string): Promise<string> {
    if (!targetAuthor) {
        throw new Error("Target author is required for this option.");
    }

    if(file.author_list instanceof Map && !file.author_list.has(targetAuthor)) {
        return `Author ${targetAuthor} has not contributed to this file.`;
    }

    const prompt = `You are an expert Senior Developer and Repository Architect. I am providing you with every line of code in this file. Note that at the start of each line, there is a blame entry indicating the author.

    YOUR TASK:
    Analyze the provided code snippets and categorize this contributor's role in this specific file.
    What are the primary functional areas they touched? (e.g., core logic, UI styling, data fetching, or boilerplate).
    Based on the complexity of the lines, are they the primary architect of this logic or providing maintenance/updates?
    Provide a concise, two-sentence summary of their 'Technical Identity' for this file.

    CONSTRAINT: Do not list the line numbers in your final answer; use them only to understand the context and flow of the work.

    THE DATA:
    ${file.file_content}`;

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

async function fileSummary(file: FileEntry): Promise<string> {
    let fullBlameDataArray = '';

        if (typeof file.file_content === 'string') {
            fullBlameDataArray = file.file_content;
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