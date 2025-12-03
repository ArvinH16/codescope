import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GithubFile = {
  filename: string;
  status: string;
  patch?: string;
};

export async function summarizeCommit(commitMessage: string, files: GithubFile[]) {
  
  // NOTE: REMOVED ALL MAX_LENGTH AND MAX_FILES CONSTANTS AND LOGIC
  
  let changes = "";
  
  // Loop over ALL files and include the entire patch string
  for (const file of files) {
    if (file.patch) {
      changes += `File: ${file.filename} (${file.status})\n`;
      changes += `Changes:\n${file.patch}\n\n`; // Sending the full, untruncated patch
    }
  }

  const prompt = `You are an expert developer analyzing a Git commit.

**Commit Message:** ${commitMessage}

**Files Changed (Full Content):**
${changes}

**Task:** Provide a concise summary (under 150 words) that explains:
1. What was changed
2. Why these changes were likely made
3. Key files affected`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful coding assistant that explains code changes clearly." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.4,
    });
    
    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("OpenAI returned an empty response");
    }
    
    return content;
    
  } catch (error) {
    console.error("OpenAI API Error:", error);
    
    if (error instanceof Error) {
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
    
    throw new Error("Failed to generate summary due to an unknown error");
  }
}