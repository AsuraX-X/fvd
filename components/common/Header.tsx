import { links } from "@/constants";
import Link from "next/link";
import Logo from "./Logo";

const Header = () => {
  return (
    <nav className="absolute top-0 left-0 right-0 flex items-center justify-between py-3 border-b px-30 border-b-primary-light bg-primary/70 backdrop-blur-2xl">
      <Logo />
      <div>
        <ul className="flex gap-8">
          {links.map(({ label, link }) => (
            <li key={label}>
              <Link className="link" href={link}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-x-4">
        <button>Sign In</button>
        <button className="button-primary">Work with us</button>
      </div>
    </nav>
  );
};

export default Header;
