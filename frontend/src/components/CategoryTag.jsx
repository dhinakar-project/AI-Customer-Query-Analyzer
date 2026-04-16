import React from "react";

export default function CategoryTag({ category }) {
  if (!category) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-600/20 px-2 py-0.5 text-xs font-medium text-indigo-200 ring-1 ring-indigo-500/30">
      {category}
    </span>
  );
}

