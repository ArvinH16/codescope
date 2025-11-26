// components/SignOutButton.tsx
'use client';
import { useState } from 'react'
import { LogOut } from 'lucide-react'; // or wherever your icon comes from
import { Button } from '@/components/ui/button'; // adjust import path to your Button component
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const handleSignOut = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/signout', {
        method: 'POST',
        credentials: 'include', // 👈 ensures cookies are sent
        });


      if (!response.ok) {
        const data = await response.json();
        console.error('Error signing out:', data.error);
      } else {
        router.push('/login'); // redirect after successful sign-out
      }
    } catch (err) {
      console.error('Unexpected error signing out:', err);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      className="text-slate-400 hover:text-white hover:bg-slate-800"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign Out
    </Button>
  );
}
