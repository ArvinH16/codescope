import OpenAI from 'openai';

// 1. Initialize OpenAI with the key you just saved
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. Define the shape of the file data based on your teammate's PDF [cite: 31]
type GithubFile = {
  filename: string; // [cite: 32]
  status: string;   // "modified", "added", etc. [cite: 33]
  patch?: string;   // The actual code changes 
};

// 3. The function that talks to the AI
export async function summarizeCommit(commitMessage: string, files: GithubFile[]) {
  
  // Build the prompt: "Here is the message, here are the files."
  let prompt = `You are an expert developer. Summarize the following code changes into a clear, non-technical explanation.\n\n`;
  
  // Add the commit message [cite: 11]
  prompt += `Commit Message: ${commitMessage}\n\n`;

  // Loop through files and add their changes (patches)
  files.forEach(file => {
    if (file.patch) {
      prompt += `File: ${file.filename} (${file.status})\n`;
      prompt += `Code Changes:\n${file.patch}\n\n`;
    }
  });

  try {
    // Send the prompt to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and cheap model
      messages: [
        { role: "system", content: "You are a helpful coding assistant." },
        { role: "user", content: prompt }
      ],
    });

    // Return the AI's answer
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error connecting to OpenAI:", error);
    return "Failed to generate summary.";
  }
}