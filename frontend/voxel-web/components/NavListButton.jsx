export default function NavListButton({ children, onClick }) {
  return (
    <li>
      <button
        className="px-4 dark:text-zinc-300 text-zinc-700 cursor-pointer duration-75 hover:bg-red-600 hover:text-red-100 py-1 hover:bg-opacity-80 rounded-full ease-in"
        onClick={onClick}
      >
        {children}
      </button>
    </li>
  );
}
