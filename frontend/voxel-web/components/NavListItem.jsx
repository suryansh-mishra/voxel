import Link from 'next/link';

export default function NavListItem({ children, href, className, onClick }) {
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
