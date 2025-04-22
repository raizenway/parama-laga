"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import LoginForm from '@/app/components/form/login-form';
import PasswordRecovery from '@/app/components/form/password-recovery';

export default function Authentication() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const toggleForm = () => setIsRecovering(!isRecovering);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset error state dan aktifkan loading state
    setError(null);
    setIsLoading(true);
    
    // Validasi input
    if (!email || !password) {
      setError('Email dan password wajib diisi');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        setError("Email atau password salah");
      } else if (result?.ok) {
        await signIn("credentials", {
          email,
          password,
          redirect: true,
          callbackUrl: "/dashboard",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen flex items-center justify-center">
      <div className="grid w-full h-full grid-cols-2 box-anim">
        {/* Form */}
        <div className='flex items-center justify-center'>
          <div className="w-full max-w-sm text-white flex flex-col items-center">
            <Image src="/parama.png" width={300} height={73} alt="Parama" unoptimized />

            {isRecovering? (
              <PasswordRecovery 
              email={email}
              setEmail={setEmail}
              error={error}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            />
            ) :

            <LoginForm 
              email={email}
              error={error}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              password={password}
              setEmail={setEmail}
              setPassword={setPassword}
            />
            }

          <button 
              onClick={toggleForm}
              className="w-full mt-2 text-right text-sm text-blue-950 underline cursor-pointer hover:text-blue-800">
              {isRecovering ? "Login" : "Forgot Password?"}
          </button>
          
          </div>
        </div>

        {/* Background */}
        <div className="relative hidden md:block">
          <Image className="object-cover" unoptimized fill src="/bg.jpg" alt="bg-image" />
        </div>
      </div>
    </main>
  );
}