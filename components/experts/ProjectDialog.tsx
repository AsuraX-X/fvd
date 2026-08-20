"use client";
import { ArrowUpRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

const ProjectDialog = ({
  url,
  image,
  title,
}: {
  url: string;
  image: string;
  title: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="relative w-full h-full aspect-4/3 bg-primary-light rounded-2xl overflow-hidden block group"
      >
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, 300px"
          className="object-cover group-hover:scale-105 transition-all"
        />
        <p className="absolute bottom-0 left-0 right-0 bg-primary/50 backdrop-blur-2xl text-xs font-bold px-3 py-2">
          {title}
        </p>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed z-10 flex justify-center space-y-12 flex-col items-center bg-black/10 backdrop-blur-2xl inset-0"
          >
            <button
              className="absolute top-10 right-10"
              onClick={() => setIsOpen(false)}
            >
              <X />
            </button>
            <div
              className="flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={title}
                className="max-h-[80vh] rounded-2xl inset-0 h-full w-full object-cover group-hover:scale-105 transition-all"
              />
              <p className="text-xs text-center mt-2 font-bold">{title}</p>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="button-primary flex items-center gap-1">
                Visit Project <ArrowUpRight size={16} />
              </button>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectDialog;
