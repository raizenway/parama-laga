import { LucideIcon } from "lucide-react";

interface ButtonProps {
  text: string;
  onClick: () => void;
  color?: string;
  hoverColor?: string;
  textColor?: string;
  hoverText?: string;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  width?: string;
  height?: string;
}

export default function Button({
  text,
  onClick,
  color = "bg-secondary",
  hoverColor = "hover:bg-emerald-400",
  textColor = "text-primary",
  hoverText,
  icon: Icon,
  iconPosition = "left",
  width="w-48",
  height="h-9",
}: ButtonProps) {
  return (
    <button
      className={`rounded-md ${color} ${textColor} font-bold my-3 flex justify-center items-center gap-2 ${hoverColor} ${hoverText} ${width} ${height}`}
      onClick={onClick}
    >
      {Icon && iconPosition === "left" && <Icon size={20} />}
      {text}
      {Icon && iconPosition === "right" && <Icon size={20} />}
    </button>
  );
}
