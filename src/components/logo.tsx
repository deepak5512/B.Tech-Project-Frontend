"use client";

import { Section } from "lucide-react";
import { motion } from "motion/react";

export const Logo = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white">
      {/* <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-neutral-400 dark:bg-white" /> */}
      <Section className="h-5 w-6 shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        Sensors Lab
      </motion.span>
    </div>
  );
};

export const LogoIcon = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white">
      <Section className="h-5 w-6 shrink-0" />
    </div>
  );
};