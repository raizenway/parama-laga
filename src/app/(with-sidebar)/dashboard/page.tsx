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
  LaptopMinimalCheck,
  CircleCheckBig,
  Activity
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation"
import { Task } from "@/app/types/task";

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
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

type ActivityResult = {
  id: number;
  itemId: number;
  result?: string;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type ActivityItem = {
  id: number;
  categoryId: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  results: ActivityResult[];
};

type ActivityCategory = {
  id: number;
  userId: number;
  projectId: number;
  weekId: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  items: ActivityItem[];
};

type ActivityWeek = {
  id: number;
  projectId: number;
  weekNum: number;
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
  project:Project;
  categories: ActivityCategory[];
};

type EmployeeActivity = ActivityWeek[];


export default function Page() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [task, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [activity, setActivity] = useState<EmployeeActivity>([]);
  const router = useRouter();

  const user = session?.user as UserWithRole;
  const employeeId = Number(user?.id);
  useEffect(() => {
    // Fetch user photo dari database
    if (user?.id) {
      fetch(`/api/employee/${user.id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.photoUrl) {
            setUserPhotoUrl(data.photoUrl);
          }
        })
        .catch(err => console.error("Error fetching user photo:", err));
    }
  }, [user?.id]);

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

      const fetchTasks = async () => {
        try {
          const response = await fetch("/api/tasks");

          if (!response.ok){
            throw new Error("Failed to fetch task");
          }

          const data = await response.json();
          setTasks(data);
        } catch (err) {
          console.error("Error fetching tasks:", err);
          setError("Gagal mengambil data task");
        } finally {
          setIsLoading(false);
        }
      }

      const fetchActivity = async () => {
        try{
          const response = await fetch(`/api/activities?employeeId=${employeeId}`, {
            cache: "no-store"
          });
          if (!response.ok)
          {
            throw new Error("Failed to fetch activity");
          }
          const data = await response.json();
          setActivity(data);
        }catch (err) {
          console.error("Error fetching activity:", err);
          setError("Gagal mengambil data activity");
        } finally { 
          setIsLoading(false);
        }
      }
      fetchActivity();
      fetchProjects();
      fetchTasks();
    }
  }, [status, employeeId]);

  useEffect(() => {
    console.log("Activity telah diperbarui", activity);
  }, [activity]);

  const avatarSrc = userPhotoUrl || user?.image || "/person.png";

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

  const getTaskStatusStyles = (status: string) => {
    switch(status) {
      case "Done": 
        return "bg-green-100 text-green-800";
      case "OnGoing": 
        return "bg-blue-100 text-blue-800";
      case "ToDo": 
        return "bg-yellow-100 text-yellow-800";
      case "NotStarted":
        return "bg-red-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleView = (task: Task) => {
    router.push(`/task/detail-task/${task.id}`);
  };

  const handleWeek = () => {
    router.push(`/activity`);
  };

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-EN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  function checkDoneWeekActivityWeek(week: ActivityWeek) {
    return week.categories.every(category => category.items.every(item => item.results.length > 0));
  }

  // function checkDoneWeekActivity(weeks: ActivityWeek[]) { 
  //   return weeks.every(week => checkDoneWeekActivityWeek(week));
  // }

  const unfinishedWeeks = activity.filter(week => !checkDoneWeekActivityWeek(week));

  return (
    <div className="mx-8 my-8 gap-3 flex flex-col">
      <div className="flex flex-row gap-8 h-96">
        {/* Profile */}
        <div className="w-1/3 flex flex-col">
          <div className="flex flex-col h-full bg-gradient-primary rounded-2xl">
          <h2 className="w-full pt-5 px-5 font-bold underline mb-2">Profile User</h2>
            <div className="w-full h-full shadow-lg p-6 flex flex-col justify-center items-center space-y-4">
              <Image
                src={avatarSrc || "/person.png"}
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
        </div>

        {/* Notification */}
        <div className="w-2/3 flex flex-col h-full">
          <div className="p-5 flex flex-1 h-full bg-tersier rounded-2xl gap-4">

            {/* Show Task */}
            <div className="flex flex-col w-3/4 h-full">
              <h2 className="flex gap-2 font-bold p-1 px-3 rounded-full mb-4 bg-white w-fit select-none">
                <CircleCheckBig className="text-sky-500"/> Tasks
              </h2>
              {task.filter((t) => t.taskStatus !== "Done").length > 0 ? (
                <div className="flex-1 overflow-y-auto rounded-lg outline outline-2 outline-[#BCB1DB] bg-white p-1 px-3 shadow-[inset_0_-2px_4px_rgba(211,205,232,0.5)]">
                  <ul>
                    {task
                      .filter((t) => t.taskStatus !== "Done")
                      .map((t, index) => (
                        <li key={t.id} className="flex gap-3 items-center">
                          <div
                            className="flex w-full select-none gap-1 py-3 px-4 my-2 outline outline-1 outline-slate-300 justify-between items-center rounded-full bg-slate-50 hover:bg-tersier/45 hover:outline-primary/40 transition-colors duration-200 shadow-md"
                            onClick={() => handleView(t)}
                            title="View task details"
                          >
                            {/* Left */}
                            <div className="flex gap-2 items-center flex-1 min-w-0">
                              <div className="flex justify-center items-center rounded-full outline outline-1 w-8 h-8">
                                <span className="text-sm">{index + 1}</span>
                              </div>
                              <span className="text-base break-words">{t.taskName}</span>
                            </div>
                      
                            {/* Right */}
                            <div className="flex gap-1 flex-shrink-0">
                              <span className="text-base text-primary">
                                ({t.project.projectCode})
                              </span>
                              <span className="px-2 py-1 rounded-full text-sm bg-green-200 whitespace-nowrap">
                                {formatDate(t.dateAdded)}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-sm whitespace-nowrap ${getTaskStatusStyles(
                                  t.taskStatus
                                )}`}
                              >
                                {t.taskStatus.replace(/([a-z])([A-Z])/g, '$1 $2')}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              ) : (
                <div className="flex-1 flex flex-col rounded-lg outline outline-2 outline-[#BCB1DB] bg-white p-1 px-3 shadow-[inset_0_-2px_4px_rgba(211,205,232,0.5)] items-center justify-center text-center">
                  <LaptopMinimalCheck size={92} />
                  <p>There`s no task left</p>
                </div>
              )}
            </div>
            
            {/* Show Activity */}
            <div className="flex flex-col w-1/4 h-full">
              <h2 className="font-bold flex gap-2 p-1 px-3 rounded-full mb-4 bg-white w-fit select-none">
                <Activity className="text-emerald-500"/>Activity
              </h2>
              {unfinishedWeeks.length > 0 ? (
                <div className="flex-1 overflow-y-auto rounded-lg outline outline-2 outline-[#BCB1DB] bg-white p-1 px-3 shadow-[inset_0_-2px_4px_rgba(211,205,232,0.5)]">
                  <ul>
                    {unfinishedWeeks.map((week) => (
                      <li key={week.id} className="flex mt-2 gap-3 items-center">
                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <div className="bg-amber-400 rounded-lg">
                              <div className="flex gap-1 items-center text-orange-800 break-words w-full p-1 py-3 px-3 ml-2 bg-yellow-100 hover:bg-amber-100 rounded-r-lg text-center"
                                    onClick={() =>handleWeek()}
                              >
                                <span className="select-none">
                                  Week {week.weekNum}
                                </span>
                                <span className="select-none">
                                  ({week.project.projectCode})
                                </span>
                              </div>
                            </div>
                          </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex-1 flex flex-col rounded-lg outline outline-2 outline-[#BCB1DB] bg-white p-1 px-3 shadow-[inset_0_-2px_4px_rgba(211,205,232,0.5)] items-center justify-center text-center">
                  <LaptopMinimalCheck size={92} />
                  <p>There&apos;s no activity</p>
                </div>
              )}
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