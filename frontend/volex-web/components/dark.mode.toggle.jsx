'use client';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import { useTheme } from 'next-themes';
export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const toggleMode = () => {
    if (theme === 'light') setTheme('dark');
    else setTheme('light');
  };

  return (
    <button
      onClick={toggleMode}
      className="p-2 hover:bg-zinc-200 hover:dark:bg-zinc-700 duration-300 ease-in rounded-full"
    >
      <HiOutlineSun className="dark:hidden" />
      <HiOutlineMoon className="hidden dark:block" />
    </button>
  );
}
