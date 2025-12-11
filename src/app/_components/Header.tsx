"use client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish } from "@fortawesome/free-solid-svg-icons";

const Header: React.FC = () => {
  return (
    <header>
      <div className="bg-slate-800 py-2 font-bold text-white">
        <div>
          <Link href="/">
            <FontAwesomeIcon icon={faFish} className="mr-1" />
            Header
          </Link>
        </div>
        <div>
          <Link href="/about">About</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
