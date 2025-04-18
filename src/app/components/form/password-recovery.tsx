import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordRecoveryProps {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    email: string;
    setEmail: (email: string) => void;
    isLoading: boolean;
    error: string | null;
  }

export default function PasswordRecovery({ handleSubmit, email, setEmail, isLoading, error }: PasswordRecoveryProps) {
    return (
      <>
        <div className="mb-5 flex flex-col items-center">
          <h1 className="text-blue-950 text-3xl font-semibold">Password Recovery</h1>
          <p className="text-xs text-blue-900">Please enter your email</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full p-6 bg-gradient-primary rounded-lg">
          <div>
            <Label className="text-blue-950 font-bold" htmlFor="email">Email</Label>
            <Input
              name="email"
              className="mt-2 mb-4 border-transparent bg-white rounded-sm text-black"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full mt-6 bg-blue-950 rounded-full hover:bg-indigo-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              "Send Password Recovery"
            )}
          </Button>
        </form>
      </>
    );
  }
  