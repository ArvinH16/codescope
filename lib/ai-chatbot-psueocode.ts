// RECEIVE: file, what chatbot option was selected
// TODO: sort out UI, this will only include logic for once a prompt has been selected by the chatbot and 
//       the file is given
// TODO: link selected prompt and receieved file

// START
// Import file, what chatbot option was selected


// Contributors option:
// Query author_list and pull names
// if <= 10, use Prompt: "The contributors to this file are: [list of unique names]"
// if > 10, 
//    Access blame_data 
//    Create a temporary list of every unique author and their most recent timestamp found in blame_data
//    Sort this list by the timestamp (Newest to Oldest)
//    Select the top 10 names from this sorted list
//    Return Prompt: "There are [total] contributors. The 10 most recent are: [list of 10 names]"
// OR update author_list to include a timestamp for each author's last commit. this is doable, but 
//    honestly lets just leave it as is for now since it wont negatively impact efficiency in a major way



// What has [author] worked on in this file? 
// Query blame_data and pull all commits by [author]
// Send selected blames data to AI by using API and with prompt: 

// "You are an expert Senior Developer and Repository Architect. I am providing you with every line of code authored by [target_author_name] within the file [file_path].

// YOUR TASK:
// Analyze the provided code snippets and categorize this contributor's role in this specific file.
//    What are the primary functional areas they touched? (e.g., core logic, UI styling, data fetching, or boilerplate).
//    Based on the complexity of the lines, are they the primary architect of this logic or providing maintenance/updates?
//    Provide a concise, two-sentence summary of their 'Technical Identity' for this file.

// CONSTRAINT: Do not list the line numbers in your final answer; use them only to understand the context and flow of the work."

// THE DATA:
// [author_snippet_collection (Full list of line numbers and code content)]

// Return the AI response to the user


// Summary of file
// Pull all blame_data for the file
// Using AI API, use the following prompt:

//"You are an expert software architect. I am providing you with the complete git blame history for the file located at: [file_path].

// YOUR TASK:
// Analyze the logic, code patterns, and the evolution of the authors in this dataset. In three concise sentences, provide a technical summary of exactly what this file's primary architectural responsibility is.

// THE DATASET:
// [full_blame_data_array]

// Return AI response to user
