import React from "react";

export default function CategoryTag({ category }) {
  if (!category) return null;
  return (
    <span className="inline-flex items-center rounded-r-full rounded-l-md bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium tracking-wide text-indigo-300 border border-white/[0.05] border-l-[3px] border-l-indigo-500 backdrop-blur-md">
      {category}
    </span>
  );
}

