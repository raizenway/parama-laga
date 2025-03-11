
interface AddButtonProps {
  text: string;
  onClick: () => void;
}

export default function AddButton({ text, onClick }: AddButtonProps) {
  return (
    <button
      className="w-48 h-9 rounded-md bg-secondary text-primary font-bold my-3 flex justify-center items-center hover:bg-emerald-600"
      onClick={onClick}
    >
      {text}
    </button>
  );
}