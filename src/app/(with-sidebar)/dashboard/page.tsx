"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  CreditCard,
  TrafficCone,
  CalendarCheck2,
  CalendarClock,
  Clock,
  Loader2,
  CloudMoon,
  MonitorCheck,
  LaptopMinimalCheck
} from "lucide-react";
import Image from "next/image";

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
type UserWithRole = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

export default function Page() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = session?.user as UserWithRole;
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

  return (
    <div className="mx-8 my-8 flex flex-col ">
      <div className="flex flex-row gap-8 h-96">
        {/* Profile */}
        <div className="w-1/3 flex flex-col">
          <h2 className="w-full font-bold underline mb-2">Profile User</h2>
          <div className="w-full h-full bg-gradient-primary rounded-2xl shadow-lg p-6 flex flex-col justify-center items-center space-y-4">
            <Image
              src={user?.image || "/person.png"}
              alt="Profile Picture"
              width={125}
              height={125}
              className="rounded-full object-cover w-32 h-32"
            />
            <div className="text-center space-y-1">
              <p className="font-bold text-primary text-lg">
                {user?.name || "User"}
              </p>
              <p className="text-primary">
                <span className="font-medium">{user?.email || ""}</span>
                <span className="font-medium"> / {user?.role || "User"}</span>
              </p>
              <p className="font-bold text-primary">
                {projects.length > 0 ? projects[0].projectName : "No active project"}
              </p>
            </div>
          </div>
        </div>

        {/* Notification */}
        <div className="w-2/3 flex flex-col h-full">
          <div className="font-bold underline my-2">Notification</div>
          <div className="p-5 flex flex-1 bg-tersier rounded-2xl justify-center items-center">
            {/* No job */}
            <div className="flex flex-col gap-2 font-poppins font-bold text-primary text-lg items-center justify-center">
              <LaptopMinimalCheck size={92} />
              There's nothing to do now
            </div>
          </div>
        </div>
      </div>


      {/* Table Project */}
      <div className="w-full bg-white rounded-2xl shadow-lg p-6">
        <h2 className="font-bold underline mb-4">Table Project</h2>
        <div className="overflow-auto">
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
            <table className="min-w-full table-auto">
              <thead className="bg-tersier sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">
                    <div className="flex items-center gap-1">
                      <CreditCard /> Project Code
                    </div>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <div className="flex items-center gap-1">
                      <TrafficCone /> Project Name
                    </div>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <div className="flex items-center gap-1">
                      <CalendarCheck2 /> Created Date
                    </div>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <div className="flex items-center gap-1">
                      <CalendarClock /> Due Date
                    </div>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <div className="flex items-center gap-1">
                      <Clock /> Status
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{project.projectCode}</td>
                      <td className="px-4 py-3">{project.projectName}</td>
                      <td className="px-4 py-3">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(project.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {project.status.statusName}
                      </td>
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
  );
}