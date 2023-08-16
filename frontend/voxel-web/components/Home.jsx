'use client';

import { React } from 'react';
import Nav from '@/components/Nav';
import useStore from '@/store/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RiLoader5Fill } from 'react-icons/ri';
import { FaUser } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function Home() {
  const setUser = useStore((state) => state.setUser);
  const user = useStore((state) => state.user);

  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [nickName, setNickName] = useState(null);

  const [changeButton, setChangeButton] = useState(false);
  const [submitSpinner, setSubmitSpinner] = useState(false);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const nickNameRef = useRef(null);

  useEffect(() => {
    if (!nickName && !firstName && !lastName) setChangeButton(false);
    else if (firstName !== '' || lastName !== '' || nickName !== '')
      setChangeButton(true);
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    setSubmitSpinner(true);
    firstNameRef.current.value = '';
    lastNameRef.current.value = '';
    nickNameRef.current.value = '';

    const resp = await axios(`${process.env.NEXT_PUBLIC_SERVER}/users/edit`, {
      method: 'PATCH',
      data: { lastName, firstName, nickName },
    });
    if (resp) setSubmitSpinner(false);
    setUser(resp.data.data.user);
    console.log(user);
    // TODO : Patch the user profile with first and last name as indicated
    // await userResp setSubmitSpinner(false);
  };

  const testHandler = async (e) => {
    e.preventDefault();
    try {
      const resp = await axios(`${process.env.NEXT_PUBLIC_SERVER}/users/test`, {
        withCredentials: true,
      });
      console.log(resp.data);
    } catch (e) {}
  };

  return (
    <>
      <Nav />
      <main className="md:mx-32 md:py-8 px-8 pt-4">
        {/* <div className="px-8 py"> */}
        <h1 className="font-semibold text-3xl pb-6 border-b dark:border-zinc-700 border-zinc-300">
          Home
        </h1>
        {/* </div> */}
        <section className="px-4 py-4 md:flex flex-row-reverse gap-4 justify-around">
          <div className="md:w-full py-4 md:pl-4">
            <h2 className="text-2xl pb-4 dark:text-zinc-400">Quick Dials</h2>
            <p>Dial more so we can process some data</p>
            <pre className="dark:text-zinc-500">
              This feature is under construction.
            </pre>
          </div>
          <div className="md:w-full py-4 md:border-r md:dark:border-zinc-800 md:border-zinc-200 leading-relaxed md:pr-4">
            <h2 className="text-2xl dark:text-zinc-300">You</h2>
            <Avatar className="my-3 hover:cursor-not-allowed">
              <AvatarImage></AvatarImage>
              <AvatarFallback>
                <FaUser />
              </AvatarFallback>
            </Avatar>
            <p className="text-sm dark:text-zinc-400 mb-2">
              Currently not supporting changes to avatar image
            </p>
            <form method="POST" className="mt-4">
              <label htmlFor="email" className="text-zinc-400">
                Email
              </label>
              <Input
                type="text"
                id="email"
                value={`${user.email}`}
                disabled
                className="w-max my-2"
              />
              <label htmlFor="firstName">First Name</label>
              <Input
                type="text"
                name="firstName"
                id="firstName"
                placeholder={`${user.firstName}`}
                className="w-max my-2"
                onChange={(e) => {
                  setFirstName(e.target.value);
                }}
                ref={firstNameRef}
              />
              <label htmlFor="lastName">Last Name</label>
              <Input
                type="text"
                name="lastName"
                id="lastName"
                placeholder={`${user.lastName}`}
                className="w-max my-2"
                onChange={(e) => {
                  setLastName(e.target.value);
                }}
                ref={lastNameRef}
              />
              <label htmlFor="nickname">Nickname</label>
              <Input
                type="text"
                name="nickname"
                id="nickname"
                placeholder={`${user.nickname}`}
                className="w-max my-2"
                onChange={(e) => {
                  setNickName(e.target.value);
                }}
                ref={nickNameRef}
              />

              <h2 className="text-xl mt-4 font-extralight">XP</h2>
              <p className="text-sm dark:text-zinc-400">
                Tip : Talk more to increase XP
              </p>
              <p>
                Your current XP is <span>{user.xp || 0}</span> XP
              </p>
              <Button
                className="mt-4 h-8"
                type="submit"
                onClick={submitHandler}
                disabled={!changeButton}
              >
                {submitSpinner && (
                  <RiLoader5Fill className="animate-spin mr-3" size={15} />
                )}
                Save Changes
              </Button>
              {/* <Button onClick={testHandler}>Test</Button> */}
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
