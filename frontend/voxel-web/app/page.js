'use client';

import Login from '@/components/Login';
import useStore from '@/store/store';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useToast } from '@/components/ui/use-toast';
import Home from '@/components/Home';
import SplashScreen from '@/components/SplashScreen';
import axios from 'axios';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

axios.defaults.withCredentials = true;

export default function HomePage() {
  const isLoggedInLoading = useStore((state) => state.isLoggedInLoading);
  const setIsLoggedInLoading = useStore((state) => state.setIsLoggedInLoading);
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const setIsLoggedIn = useStore((state) => state.setIsLoggedIn);
  const setUser = useStore((state) => state.setUser);
  const socket = useStore((state) => state.socket);
  const setSocket = useStore((state) => state.setSocket);
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoggedInLoading(true);
      axios(`${process.env.NEXT_PUBLIC_SERVER}/users/isLoggedIn`, {
        method: 'GET',
      })
        .then((user) => {
          if (user.data.data.user) {
            setIsLoggedIn(true);
            setUser(user.data.data.user);
            setIsLoggedInLoading(false);
          }
        })
        .catch((err) => {
          toast({
            title: 'Please sign in to voxel',
            variant: 'destructive',
          });
          setIsLoggedInLoading(false);
          console.log('Login Error : ', err);
        });
    }
  }, []);

  useEffect(() => {
    if (!socket && isLoggedIn) {
      const socket = new io(`${process.env.NEXT_PUBLIC_SERVER_URI_BASE}`, {
        withCredentials: true,
      });
      if (socket) setSocket(socket);
    }
  }, [isLoggedIn]);

  return (
    <GoogleOAuthProvider clientId="943016074848-p637kqbq05gqfam1svrjtt58evjk2et1.apps.googleusercontent.com">
      {isLoggedInLoading && !isLoggedIn && <SplashScreen />}
      <main className="dark:bg-zinc-950 bg-zinc-50">
        {!isLoggedInLoading && !isLoggedIn && <Login />}
        {!isLoggedInLoading && isLoggedIn && <Home />}
      </main>
    </GoogleOAuthProvider>
  );
}
