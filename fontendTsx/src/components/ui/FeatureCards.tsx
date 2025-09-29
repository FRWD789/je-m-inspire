import React from "react";
import { Smartphone, Eye, Users } from "lucide-react"; // icons

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
  bg: string;
};

const features: Feature[] = [
  {
    icon: <Smartphone size={28} />,
    title: "Rayonnez vos ateliers",
    description: "Rejoignez, partagez vos événements holistiques facilement.",
    bg: "bg-[#D4CDC2]", // beige
  },
  {
    icon: <Eye size={28} />,
    title: "Atteignez votre public",
    description: "Touchez une audience ciblée et passionnée.",
    bg: "bg-[#B7D3A8]", // green
  },
  {
    icon: <Users size={28} />,
    title: "Bâtissez votre réseau",
    description: "Connectez, partagez et faites grandir votre réseau.",
    bg: "bg-[#C7B7BE]", // mauve
  },
];

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-1 h-full md:grid-cols-3 gap-8">
      {features.map((f, i) => (
        <div
          key={i}
          className={`${f.bg} rounded-[8px] p-6 shadow-md flex flex-col justify-between gap-4`}
        >
          <div className="text-gray-800">{f.icon}</div>
         <div>
            <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
            <p className="text-sm text-gray-700">{f.description}</p>
         </div>
        </div>
      ))}
    </div>
  );
}
