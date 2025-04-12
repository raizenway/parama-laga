"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  CreditCard,
  TrafficCone,
  CalendarCheck2,
  CalendarClock,
  Clock,
  Loader2
} from "lucide-react";

// Tipe data untuk projects
type Project = {
  id: number;
  projectCode: string;
  projectName: string;
  projectOwner: string;
  createdAt: Date;
  endDate: Date;
  status: {
    statusName: string;
  };
};

export default function Page() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Hanya ambil data jika session sudah loaded
    if (status === "authenticated") {
      const fetchProjects = async () => {
        try {
          // Fetch project data dari API
          const response = await fetch("/api/projects");
          
          if (!response.ok) {
            throw new Error("Failed to fetch projects");
          }
          
          const data = await response.json();
          setProjects(data);
        } catch (err) {
          console.error("Error fetching projects:", err);
          setError("Gagal mengambil data project");
        } finally {
          setIsLoading(false);
        }
      };

      fetchProjects();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="p-8 bg-red-50 rounded-md border border-red-200">
          <h2 className="text-xl font-bold text-red-700">Akses Ditolak</h2>
          <p className="text-red-600">Silakan login untuk mengakses dashboard</p>
        </div>
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="mx-8 h-screen flex-wrap space-y-5 ">
      {/* Baris 1 */}
      <div className="mt-10 flex gap-10 h-1/3 ">
        <div className="grow flex flex-col w-full h-full ">
          <div className="flex-1/5  font-bold underline my-2">Profile User</div>
          <div className="flex-1 flex flex-wrap grow bg-gradient-primary rounded-2xl justify-start items-center">
              <img 
                src={user?.photoUrl || "/person.png"} 
                className="ml-5 min-w-[125px] w-1/5 aspect-square rounded-full object-cover" 
                alt="Profile Picture"
              />
              <div className="ml-5 space-y-3">
                <div className=" font-bold text-primary">{user?.name || "User"}</div>
                <div className="flex">
                  <div className=" font-bold text-primary">{user?.email || ""}</div>
                  <div className=" font-bold text-primary">/{user?.role || "User"}</div>
                </div>
                <div className=" font-bold text-primary">
                  {projects.length > 0 ? `${projects[0].projectName}` : "No active project"}
                </div>
              </div>              
          </div>
        </div>

        <div className="grow flex flex-col w-full h-full ">
          <div className="flex-1/5  font-bold underline my-2">Notification</div>
            <div className="p-5 flex flex-1 flex-wrap grow bg-tersier rounded-2xl justify-start items-start">
            <div className="space-y-1">
                <div className=" text-primary">1. Segera lakukan pemeriksaan kurva S</div>
                <div className="flex flex-wrap gap-1">
                  <div className=" text-primary">2. Waktu pengisian checklist aktivitas</div>
                  <div className=" text-danger font-bold">(Due: Friday 7 February 2025)</div>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Baris 2 */}
      <div className="grow">
        <div className=" font-bold underline my-3">Table Project</div>
        <div className="grow h-96 bg-white rounded-2xl flex justify-center items-start p-4 shadow-[0px_0px_13px_2px_rgba(0,_0,_0,_0.2)]">
          <div className="overflow-auto max-h-full w-full ">
            {isLoading ? (
              <div className="w-full h-64 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading project data...</span>
              </div>
            ) : error ? (
              <div className="w-full h-64 flex justify-center items-center">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <table className=" w-full table-auto justify-start">
                <thead className="bg-tersier">
                  <tr>
                    <th className="px-4 py-2 rounded-tl-lg text-left">
                      <div className="flex items-center gap-1"><CreditCard /> Project Code</div>
                    </th>
                    <th className="px-4 py-2 text-left">
                      <div className="flex items-center gap-1"><TrafficCone /> Project Name</div>
                    </th>
                    <th className="px-4 py-2 text-left">
                      <div className="flex items-center gap-1"><CalendarCheck2 /> Created Date</div>
                    </th>
                    <th className="px-4 py-2 text-left">
                      <div className="flex items-center gap-1"><CalendarClock /> Due Date</div>
                    </th>
                    <th className="px-4 py-2 rounded-tr-lg text-left">
                      <div className="flex items-center gap-1"><Clock /> Status</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <tr key={project.id} className="border-b-2 border-tersier">
                        <td className="px-4 py-3">{project.projectCode}</td>
                        <td className="px-4 py-3">{project.projectName}</td>
                        <td className="px-4 py-3">{new Date(project.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">{new Date(project.endDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3">{project.status.statusName}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8">
                        Tidak ada project untuk ditampilkan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}