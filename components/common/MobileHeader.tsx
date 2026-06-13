"use client";
import { Menu } from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";

const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden flex  items-center justify-between py-3 border-b px-6 border-b-primary-light bg-primary/70 backdrop-blur-2xl">
      <Logo />
      <div>
        <button>
          <Menu />
        </button>
      </div>
    </div>
  );
};

export default MobileHeader;
