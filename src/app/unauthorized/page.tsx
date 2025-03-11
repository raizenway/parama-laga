"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const router = useRouter();
  
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
        <p className="mb-6 text-gray-700">
          Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator
          jika Anda memerlukan akses.
        </p>
        <div className="flex gap-4">
          <Button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}