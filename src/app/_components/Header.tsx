"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish } from "@fortawesome/free-solid-svg-icons";

const Header: React.FC = () => {
  return (
    <header>
      <div className="bg-slate-800 py-2 font-bold text-white">
        <FontAwesomeIcon icon={faFish} className="mr-1" />
        Header
      </div>
    </header>
  );
};

export default Header;
