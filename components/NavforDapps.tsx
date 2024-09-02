"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  {
    title: "Swap",
    href: "/Dapps",
  },
  {
    title: "DE-Fi",
    href: "/Dapps/DE-Fi",
  },
  {
    title: "Game-Fi",
    href: "/Dapps/Game-Fi",
  },
  {
    title: "Token deployer",
    href: "/Dapps/Socials",
  },

];

const NavforDapps = () => {
  const pathName = usePathname();

  return (
    <div className="px-6 space-y-4">
      <div className="flex space-x-10 mb-4">
        {menus.map((menu) => (
          <Link
            key={menu.title}
            href={menu.href}
            className={`${
              pathName === menu.href
                ? "text-white text-xs border-b-2 border-red-500 pb-1"
                : "text-gray-400 text-xs"
            }`}
          >
            <button>{menu.title}</button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NavforDapps;
