'use client';
import Login from '@/components/initial.login';
import useStore from '@/store/store';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Image from 'next/image';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function Home() {
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const setIsLoggedIn = useStore((state) => state.setisLoggedIn);
  const isLoggedInLoading = useStore((state) => state.isLoggedInLoading);
  const setIsLoggedInLoading = useStore((state) => state.setIsLoggedInLoading);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoggedInLoading(true);
    fetch('/api/isLoggedIn', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(data.isLoggedIn);
        setIsLoggedInLoading(false);
      })
      .catch((err) => {
        toast({
          title: 'Network Error',
          description: 'Could not process your profile information',
          variant: 'destructive',
        });
      });
  }, []);
  return (
    <GoogleOAuthProvider clientId="943016074848-p637kqbq05gqfam1svrjtt58evjk2et1.apps.googleusercontent.com">
      <main className="dark:bg-zinc-950 bg-zinc-50">
        {!isLoggedInLoading && !isLoggedIn && <Login />}
        <Login />
      </main>
    </GoogleOAuthProvider>
  );
}
