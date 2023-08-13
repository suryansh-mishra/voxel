'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DarkModeToggle from './dark.mode.toggle';
import { BiMenuAltRight } from 'react-icons/bi';

function NavListItem({ children, href, className, onClick }) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className={`px-4 dark:text-zinc-300 text-zinc-700  cursor-pointer duration-100 hover:bg-accent-light-faded bg-opacity-30 hover:text-accent-light-bright hover:dark:bg-accent-dark-faded hover:dark:text-accent-dark-bright p-1 rounded-full ease-in border-accent-dark-bright active:font-black ${className} `}
      >
        {children}
      </Link>
    </li>
  );
}

function NavListButton({ children, onClick }) {
  return (
    <li>
      <button className="px-4 dark:text-zinc-300 text-zinc-700  cursor-pointer duration-75 hover:bg-zinc-900 hover:text-zinc-50 hover:dark:bg-zinc-50 hover:dark:text-zinc-900 p-2 rounded-lg ease-in">
        {children}
      </button>
    </li>
  );
}

export default function Nav() {
  const [hamburgerOpen, setHamburgerOpen] = useState(false);

  const toggleHamburger = () => {
    setHamburgerOpen(!hamburgerOpen);
  };

  return (
    <div className="container justify-between md:justify-between flex h-14 md:h-20 md:px-14 items-center  sticky top-0">
      <div className="flex items-center">
        <Image
          src="/volex-logo.svg"
          width="1000"
          height="1000"
          alt="logo"
          className="mr-2 w-10 h-10 rounded-full"
        ></Image>
        <h1 className="text-xl  font-medium">volex</h1>
      </div>

      <ul className="md:flex hidden flex-row gap-2 text-sm items-baseline justify-self-end mr-20">
        <NavListItem href="/">Home</NavListItem>
        <NavListItem href="/chats">Chats</NavListItem>
        <NavListButton>Logout</NavListButton>
      </ul>
      <div className="flex items-center gap-4">
        <DarkModeToggle />
        <div className="md:hidden relative ">
          <button
            onClick={toggleHamburger}
            className="hover:bg-accent-light-faded p-2 rounded-full"
          >
            <BiMenuAltRight />
          </button>
          {hamburgerOpen && (
            <nav
              className={`absolute mt-2 right-0 border dark:border-zinc-700 border-zinc-200 rounded-md backdrop-blur-lg`}
            >
              <ul className="relative px-2 py-3 flex flex-col text-sm gap-2">
                <NavListItem
                  href="/"
                  onClick={toggleHamburger}
                  className={'rounded-sm'}
                >
                  Home
                </NavListItem>
                <NavListItem
                  href="/chats"
                  onClick={toggleHamburger}
                  className={'border-none rounded-none'}
                >
                  Chats
                </NavListItem>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
