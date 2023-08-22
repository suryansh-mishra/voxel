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
        className={`px-4 dark:text-zinc-300 text-zinc-700  cursor-pointer duration-100 
        hover:bg-accent-light-faded  hover:text-accent-light-bright 
        hover:dark:bg-accent-dark-faded hover:dark:text-accent-dark-bright p-1 rounded-full 
        ease-in active:font-black ${className} `}
      >
        {children}
      </Link>
    </li>
  );
}

function NavListButton({ children, onClick }) {
  return (
    <li>
      <button className="px-4 dark:text-zinc-300 text-zinc-700 cursor-pointer duration-75 hover:bg-red-600 hover:text-red-100 py-1 hover:bg-opacity-80 rounded-full ease-in">
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
    <div className="container justify-between md:justify-between flex h-14 md:h-20 md:px-14 items-center backdrop-blur-lg sticky top-0">
      <div className="flex items-center">
        <Image
          src="voxel-logo.svg"
          width="1000"
          height="1000"
          alt="logo"
          className="mr-2 w-10 h-10 rounded-full"
        ></Image>
        <h1 className="text-xl  font-medium">voxel</h1>
      </div>

      <ul className="md:flex hidden flex-row gap-2 text-sm items-baseline justify-self-end mr-20">
        <NavListItem href="/">Home</NavListItem>
        <NavListItem href="/chats">Chats</NavListItem>
        <NavListButton>Logout</NavListButton>
      </ul>
      <div className="flex items-center gap-4">
        <DarkModeToggle />
        <div className="md:hidden relative">
          <button
            onClick={toggleHamburger}
            className="hover:bg-accent-light-faded p-2 rounded-full"
          >
            <BiMenuAltRight />
          </button>
          {hamburgerOpen && (
            <nav
              className={`absolute mt-2 right-0 border dark:border-zinc-700 border-zinc-200 rounded-lg backdrop-blur-lg`}
            >
              <ul className="px-1 py-1 flex flex-col text-sm">
                <NavListItem
                  href="/"
                  onClick={toggleHamburger}
                  className={'block rounded-lg px-8 py-2'}
                >
                  Home
                </NavListItem>
                <NavListItem
                  href="/chats"
                  onClick={toggleHamburger}
                  className={'block rounded-lg px-8 py-2'}
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
