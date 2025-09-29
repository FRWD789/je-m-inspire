import React from "react";

const colors = [
  "#4C5643", // dark green
  "#D4D0C8", // beige/grey
  "#7C6579", // muted purple
  "#5FA543", // green
];

export default function AvatarStack() {
  return (
    <div className="flex items-center">
      {colors.map((color, index) => (
        <div
          key={index}
          className="w-10 h-10 rounded-full border-2 border-white -ml-3 first:ml-0"
          style={{ backgroundColor: color }}
        />
      ))}

      {/* +1K circle */}
      <div className="w-10 h-10 rounded-full border-2 border-white -ml-3 flex items-center justify-center bg-gray-300 text-sm font-medium text-gray-700">
        +1K
      </div>
    </div>
  );
}
