import { SupabaseClient } from '@supabase/supabase-js';

// Defines the data structure we need to save
type SummaryData = {
  user_id: string;
  repo_name: string;
  commit_sha: string;
  summary: string;
};

/**
 * Saves the AI-generated summary into the secure 'summaries' table.
 */
export async function saveSummaryToDB(supabase: SupabaseClient, data: SummaryData) {
  const { error } = await supabase
    .from('summaries')
    .insert([
      {
        user_id: data.user_id,
        repo_name: data.repo_name,
        commit_sha: data.commit_sha,
        summary: data.summary,
        // The created_at field is automatically set by the database using 'now()'
      },
    ]);

  if (error) {
    console.error('Database Error:', error);
    // Throw an error so the API route knows the save failed
    throw new Error('Failed to save summary to database.');
  }
}