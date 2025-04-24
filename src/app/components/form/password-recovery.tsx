
import { Label } from "@/components/ui/label";

interface PasswordRecoveryProps {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    email: string;
    setEmail: (email: string) => void;
    isLoading: boolean;
    error: string | null;
  }

export default function PasswordRecovery({ handleSubmit }: PasswordRecoveryProps) {
    return (
      <>
        <div className="mb-5 flex flex-col items-center">
          <h1 className="text-blue-950 text-3xl font-semibold">Password Recovery</h1>
        </div>
        <form onSubmit={handleSubmit} className="w-full p-6 bg-gradient-primary rounded-lg">
          <div className="w-full bg-white text-center py-4 px-2 rounded-md">
            <Label className="text-blue-950 font-bold" htmlFor="email">Silahkan hubungi PM Anda.</Label>
          </div>
        </form>
      </>
    );
  }
  