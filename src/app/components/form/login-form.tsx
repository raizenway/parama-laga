import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface LoginFormProps {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
    isLoading: boolean;
    error: string | null;
  }

export default function({ handleSubmit, email, setEmail, password, setPassword, isLoading, error }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <>
        <div className="mb-5 flex flex-col items-center">
          <h1 className="text-blue-950 text-3xl font-semibold">Welcome Back</h1>
          <p className="text-xs text-blue-900">Please enter your details</p>
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
          <div className="relative">
            <Label className="font-bold text-blue-950" htmlFor="password">Password</Label>
            <Input
              name="password"
              className="mt-2 mb-4 border-transparent bg-white rounded-sm text-black"
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-10 text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
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
              "Login"
            )}
          </Button>
        </form>
      </>
    );
  }
  