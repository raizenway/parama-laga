"use client";
import "../globals.css";
import SidebarFunction, { SidebarMenu } from "./sidebar-function";
import { SidebarItem } from "./sidebar-function";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // Add this import
import {
  CircleCheckBig,
  TrafficCone,
  Settings2,
  UserCircle,
  FileCheck2,
  LayoutDashboard,
  Activity,
  LayoutList
} from "lucide-react";

const Sidebar = () => {
    const router = useRouter();  
    const [isPMOpen, setIsPMOpen] = useState(false);
    const [isTaskActivityOpen, setIsTaskActivityOpen] = useState(false);
    const [activeItem, setActiveItem] = useState("Dashboard");
    const [activeSubItem, setActiveSubItem] = useState("");
    const { data: session } = useSession(); // Get session data
    
    // Check if user is admin or project manager
    const user = session?.user as { role?: string };

    const isPMOrAdmin = user?.role === "admin" || user?.role === "project_manager";

    
    const handleItemClick = (menu: string, path: string) => {
      if (menu === "PM Options") setIsPMOpen(!isPMOpen);
      if (menu === "Task/Activity") setIsTaskActivityOpen(!isTaskActivityOpen);
      setActiveItem(menu);
      
      if(path) {
        setActiveSubItem("");
        router.push(path);
      }
    };
    
    const handleSubItemClick = (submenu: string, path: string) => {
      setActiveSubItem(submenu);
      router.push(path);
    };

    return (
        <div className="md: w-72 bg-white h-screen flex-1 fixed border-r">
            <SidebarFunction>
                <SidebarItem
                  icon={<LayoutDashboard size={20} />}
                  text="Dashboard"
                  active={activeItem === "Dashboard"}
                  onClick={() => handleItemClick("Dashboard", "/dashboard")}
                />
                <SidebarItem
                  icon={<LayoutList size={20} />}
                  text="Task/Activity"
                  more
                  active={activeItem === "Task/Activity"}
                  isOpen={isTaskActivityOpen}
                  onClick={() => handleItemClick("Task/Activity", "")}
                />
                <SidebarMenu
                  isOpen={isTaskActivityOpen}
                  items={[
                    {
                      icon: <CircleCheckBig size={16} />,
                      text: "Task",
                      active: activeSubItem === "Task",
                      onClick: () => handleSubItemClick("Task", "/task"),
                    },
                    {
                      icon: <Activity size={16} />,
                      text: "Activity",
                      active: activeSubItem === "Activity",
                      onClick: () => handleSubItemClick("Activity", "/activity"),
                    }
                  ]}
                />
                {/* <SidebarItem
                  icon={<ChartSpline size={20} />}
                  text="Performance Report"
                  active={activeItem === "Performance Report"}
                  onClick={() => handleItemClick("Performance Report", "#")}
                /> */}
                
                {/* Only render PM Options if user is admin or project manager */}
                {isPMOrAdmin && (
                  <>
                    <SidebarItem
                      icon={<Settings2 size={20} />}
                      text="PM Options"
                      more
                      active={activeItem === "PM Options"}
                      isOpen={isPMOpen}
                      onClick={() => handleItemClick("PM Options", "")}
                    />
                    <SidebarMenu
                      isOpen={isPMOpen}
                      items={[
                        {
                          icon: <UserCircle size={16} />,
                          text: "Employees",
                          active: activeSubItem === "Employees",
                          onClick: () => handleSubItemClick("Employees", "/employees"),
                        },
                        {
                          icon: <TrafficCone size={16} />,
                          text: "Projects",
                          active: activeSubItem === "Projects",
                          onClick: () => handleSubItemClick("Projects", "/projects"),
                        },
                        {
                          icon: <FileCheck2 size={16} />,
                          text: "Template Maker",
                          active: activeSubItem === "Template Maker",
                          onClick: () => handleSubItemClick("Template Maker", "/template-maker"),
                        },
                      ]}
                    />
                  </>
                )}
            </SidebarFunction>
        </div>
    )
};

export default Sidebar;