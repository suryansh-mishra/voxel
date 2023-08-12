'use client';
import Login from '@/components/initial.login';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Image from 'next/image';

export default function Home() {
  return (
    <GoogleOAuthProvider clientId="943016074848-p637kqbq05gqfam1svrjtt58evjk2et1.apps.googleusercontent.com">
      <main>
        <Login></Login>
      </main>
    </GoogleOAuthProvider>
  );
}
