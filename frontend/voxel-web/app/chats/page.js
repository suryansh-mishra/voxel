'use client';

import Nav from '@/components/Nav';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import useStore from '@/store/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function SkeletonChats() {
  return (
    <div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </div>
  );
}

export default function Chats() {
  const router = useRouter();
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) router.push('/');
  }, [isLoggedIn]);

  return (
    <>
      {isLoggedIn && (
        <>
          <Nav />
          <main className="flex flex-col md:flex-row justify-center md:mx-12 p-2 md:p-4 gap-4">
            <div className="flex md:min-w-fit md:max-w-lg flex-col  gap-2 col-span-1">
              <Card className={''}>
                <CardHeader className="pb-4">
                  <CardTitle>Join a chat</CardTitle>
                  <CardDescription>
                    Please enter the link and press join
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input className="my-2 mt-0"></Input>
                  <Button className="mt-2 w-full">Join</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>Create a new chat</CardTitle>
                  <CardDescription>
                    Creating a new chat takes a fluke
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input disabled className="my-2 mt-0 w-full"></Input>
                  <Button className="my-2 w-full">Create</Button>
                  <Button className="my-2 w-full hidden bg-blue-900 hover:bg-blue-950 active:opacity-90 dark:bg-cyan-100 hover:dark:bg-cyan-200 duration-200">
                    Copy
                  </Button>
                </CardContent>
              </Card>
            </div>
            <Card className="grow w-full p-4 flex flex-col">
              <SkeletonChats />
              {/* TODO : Add no previous chats available or loading */}
              {/* <div className="grid place-items-center h-full">
          <h2 className="text-xl font-bold">No Previous Chats Available</h2>
        </div> */}
            </Card>
          </main>
        </>
      )}
    </>
  );
}
