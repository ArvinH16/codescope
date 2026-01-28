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
 * Also updates the user's last_summarized_time in the profiles table.
 * TODO: Make this function require authentication to prevent misues
 */
export async function saveSummaryToDB(supabase: SupabaseClient, data: SummaryData) {
  // 1. Insert the summary into the summaries table
  const { error: summaryError } = await supabase
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

  if (summaryError) {
    console.error('Database Error saving summary:', summaryError);
    throw new Error('Failed to save summary to database.');
  }

  // 2. Update the user's last_summarized_time in the profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ last_summarized_time: new Date().toISOString() })
    .eq('id', data.user_id);

  if (profileError) {
    console.error('Database Error updating profile:', profileError);
    // Don't throw here - the summary was saved successfully, this is just metadata
  }
}