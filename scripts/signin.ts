import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';


// TODO: Check if this is correct standards for web dev
export async function signInWithGithub() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
    })
    // TODO: Proper error handling
    if (error) {
        console.error('Error during GitHub sign-in:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data.url) {
        redirect(data.url) // use the redirect API for your server framework
    }
}