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
  const MAX_PATCH_LENGTH = 500;  // Per file
  const MAX_FILES = 20;           // Total files
  const MAX_TOTAL_LENGTH = 8000;  // Safety cap
  
  let changes = "";
  const filesToProcess = files.slice(0, MAX_FILES);
  
  for (const file of filesToProcess) {
    if (file.patch) {
      changes += `File: ${file.filename} (${file.status})\n`;
      
      const truncatedPatch = file.patch.length > MAX_PATCH_LENGTH
        ? file.patch.substring(0, MAX_PATCH_LENGTH) + '\n... (patch truncated)'
        : file.patch;
      
      changes += `Changes:\n${truncatedPatch}\n\n`;
    }
  }
  
  // Add note if files were skipped
  if (files.length > MAX_FILES) {
    changes += `\n(Note: ${files.length - MAX_FILES} additional files were modified)\n`;
  }
  
  // Final safety truncation
  if (changes.length > MAX_TOTAL_LENGTH) {
    changes = changes.substring(0, MAX_TOTAL_LENGTH) + "\n...[Truncated for length]...";
  }
  
  const prompt = `You are an expert developer analyzing a Git commit.

**Commit Message:** ${commitMessage}

**Files Changed:**
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
      temperature: 0.4, // Slightly lower for more consistent summaries
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