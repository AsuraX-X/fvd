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
        className="relative w-full h-full aspect-4/3 bg-primary-light rounded-2xl overflow-hidden block group cursor-pointer"
      >
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
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
            className="fixed z-10 flex justify-center gap-6 sm:gap-12 flex-col items-center bg-black/10 backdrop-blur-2xl inset-0 p-4 sm:p-8"
          >
            <button
              className="absolute top-4 right-4 sm:top-10 sm:right-10 p-2"
              aria-label="Close"
              onClick={() => setIsOpen(false)}
            >
              <X />
            </button>
            <div className="flex flex-col max-w-full min-h-0" onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={title}
                className="max-h-[65vh] sm:max-h-[80vh] max-w-full w-auto rounded-2xl object-contain"
              />
              <p className="text-xs text-center mt-2 font-bold wrap-break-word">{title}</p>
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
