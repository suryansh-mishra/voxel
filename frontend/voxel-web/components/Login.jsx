'use client';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from './ui/button';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import useStore from '@/store/store';

export default function Login() {
  const setIsLoggedIn = useStore((state) => state.setIsLoggedIn);
  const setUser = useStore((state) => state.setUser);

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (res) => {
      const user = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER}/users/login`,
        {
          data: res,
        },
        { withCredentials: true }
      );
      setIsLoggedIn(true);
      setUser(user.data.data.user);
    },
    onError: (errorResponse) => console.log(errorResponse),
  });
  return (
    <>
      <div className="h-16 flex items-center justify-center">
        <Link href="/" className=" flex items-center justify-center gap-1">
          <Image
            width="500"
            height="500"
            src="voxel-logo.svg"
            alt="logo"
            className="w-10 h-10"
          />
          <h1 className="font-semibold text-lg">voxel</h1>
        </Link>
      </div>

      <div className="grid grid-rows-2 md:grid-rows-1 grid-flow-row md:grid-flow-col md:grid-cols-2">
        <section className="col-span-1 flex flex-col items-center md:border-r my-10 row-span-2 row-start-1">
          <header className="text-center pt-10 px-12 font-extralight">
            <h2 className="text-4xl">
              <span className="dark:text-accent-dark-bright  font-bold">
                Hi,&nbsp;
              </span>
              Welcome to voxel
            </h2>
            <p className="text-4xl mt-10 font-semibold text-zinc-600 font-sans dark:text-zinc-400">
              Bringing you and your loved ones closer.
            </p>
          </header>
          <Image
            src="voxel-logo.svg"
            width="500"
            height="500"
            alt="logo"
            className=""
          ></Image>
        </section>
        <section className="grid col-span-1 place-items-center pb-20 absolute md:relative bottom-0 w-full">
          <Card className="bg-transparent dark:bg-transparent backdrop-blur-xl dark:backdrop-blur-2xl">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
            </CardHeader>
            <CardContent className="-mt-2">
              <p>We use your google account for authentication.</p>
              <p className="text-sm text-slate-500 pt-2">
                Creation of account is implicitly handled.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="-mt-2" onClick={googleLogin}>
                Sign in with Google
              </Button>
            </CardFooter>
          </Card>
        </section>
      </div>
      <footer className="flex flex-col bg-accent-light-bright p-4 items-center justify-center">
        <p className="text-zinc-50 text-sm">
          A video calling platform built on&nbsp;
          <Link
            href="https://webrtc.org/"
            className="hover:text-white hover:font-semibold duration-200"
          >
            WebRTC
          </Link>
        </p>
        <span className="block mt-2 text-zinc-300 text-xs">
          &copy; copyrights no rights reserved
        </span>
      </footer>
    </>
  );
}
