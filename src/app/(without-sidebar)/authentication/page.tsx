  "use client";
  import { useState } from 'react';
  import { signIn } from 'next-auth/react';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import Image from 'next/image';
  import { useRouter } from 'next/navigation';


  export default function Authentication() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log(email,password);
      // Validasi input
      if (!email || !password) {
        setError('Email dan password wajib diisi');
        return;
      }

      const result = await signIn("credentials", {
        redirect: false, // Jangan redirect otomatis
        email,
        password,
      });
      console.log(result);
      // Cek apakah login berhasil atau tidak

      if (result?.error) {
        setError("Email atau password salah");
      } else if (result?.ok) {
        router.push("/dashboard"); // Redirect ke halaman dashboard setelah login berhasil
      }
    };

    return (
      <main className="h-screen flex items-center justify-center">
        <div className="grid w-full h-full grid-cols-1 bg-white box-anim md:grid-cols-2">
          <div className="p-48 text-white flex items-center justify-center flex-col">
            <img src="/parama.png" alt="Parama" className="" />
            <div className="mb-5 flex flex-col items-center">
              <h1 className="text-blue-950 text-3xl font-semibold">Welcome Back</h1>
              <p className="text-xs text-blue-900">Please enter your detail</p>
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
                  placeholder="jono@gmail.com"
                />
              </div>
              <div>
                <Label className="font-bold text-blue-950" htmlFor="password">Password</Label>
                <Input
                  name="password"
                  className="mt-2 mb-4 border-transparent bg-white rounded-sm text-black"
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="******"
                />
              </div>
              {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
              <p className="text-right text-sm text-blue-950 underline cursor-pointer hover:text-blue-800">
                Forgot Password?
              </p>
              <Button
                type="submit"
                className="w-full mt-6 bg-blue-950 rounded-full hover:bg-indigo-700"
              >
                Login
              </Button>
            </form>
          </div>
          <div className="relative hidden md:block">
            <Image className="object-cover" fill src="/bg.jpg" alt="bg-image" />
          </div>
        </div>
      </main>
    );
  }