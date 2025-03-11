"use client";
import "../globals.css";
import SidebarFunction, { SidebarMenu } from "./sidebar-function";
import { SidebarItem } from "./sidebar-function";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  CircleCheckBig,
  TrafficCone,
  ChartSpline,
  Settings2,
  UserCircle,
  FileText,
  LayoutDashboard,
  Activity
} from "lucide-react";

const Sidebar = () => {
    const router = useRouter();  
    const [isPMOpen, setIsPMOpen] = useState(false);
    const [isTaskActivityOpen, setIsTaskActivityOpen] = useState(false);
    const [activeItem, setActiveItem] = useState("Dashboard");
    const [activeSubItem, setActiveSubItem] = useState("");
    const handleItemClick = (menu: string, path: string) => {
      if (menu === "PM Options") setIsPMOpen(!isPMOpen);
      if (menu === "Task/Activity") setIsTaskActivityOpen(!isTaskActivityOpen);
      setActiveItem(menu);
      setActiveSubItem("");
      router.push(path);
    };
    const handleSubItemClick = (submenu: string, path: string) => {
      setActiveSubItem(submenu);
      router.push(path);
    };
    const pathname = usePathname();
    const isAuthenticationPage = pathname?.startsWith("/authentication");

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
                  icon={<Settings2 size={20} />}
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
                      text: "Activiy",
                      active: activeSubItem === "Activity",
                      onClick: () => handleSubItemClick("Activity", "/activity"),
                    }
                  ]}
                />
                <SidebarItem
                  icon={<ChartSpline size={20} />}
                  text="Performance Report"
                  active={activeItem === "Performance Report"}
                  onClick={() => handleItemClick("Performance Report", "#")}
                />
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
                      icon: <FileText size={16} />,
                      text: "Template Maker",
                      active: activeSubItem === "Template Maker",
                      onClick: () => handleSubItemClick("Template Maker", "template-maker"),
                    },
                  ]}
                />
            </SidebarFunction>
        </div>
    )
};

export default Sidebar;
