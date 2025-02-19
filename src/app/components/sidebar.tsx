"use client";
import "../globals.css";
import SidebarFunction, { SidebarMenu } from "./sidebar-function";
import { SidebarItem } from "./sidebar-function";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LifeBuoy,
  ClipboardList,
  ChartSpline,
  Settings2,
  UserCircle,
  Briefcase,
  FileText,
  LayoutDashboard,
} from "lucide-react";

const Sidebar = () => {
    
    const [isPMOpen, setIsPMOpen] = useState(false);
    const [activeItem, setActiveItem] = useState("Dashboard");
    const [activeSubItem, setActiveSubItem] = useState("");
    const handleItemClick = (menu: string) => {
      if (menu === "PM Options") setIsPMOpen(!isPMOpen);
      setActiveItem(menu);
      setActiveSubItem("");
    };
    const handleSubItemClick = (submenu: string) => {
      setActiveSubItem(submenu);
    };
    const pathname = usePathname();
    const isAuthenticationPage = pathname.startsWith("/authentication");

    return (
        <div className="md: w-72 bg-white h-screen flex-1 fixed border-r">
            <SidebarFunction>
                <SidebarItem
                  icon={<LayoutDashboard size={20} />}
                  text="Dashboard"
                  active={activeItem === "Dashboard"}
                  onClick={() => handleItemClick("Dashboard")}
                />
                <SidebarItem
                  icon={<ClipboardList size={20} />}
                  text="Task/Activity"
                  active={activeItem === "Task/Activity"}
                  onClick={() => handleItemClick("Task/Activity")}
                />
                <SidebarItem
                  icon={<ChartSpline size={20} />}
                  text="Performance Report"
                  active={activeItem === "Performance Report"}
                  onClick={() => handleItemClick("Performance Report")}
                />
                <SidebarItem
                  icon={<Settings2 size={20} />}
                  text="PM Options"
                  more
                  active={activeItem === "PM Options"}
                  isOpen={isPMOpen}
                  onClick={() => handleItemClick("PM Options")}
                />
                <SidebarMenu
                  isOpen={isPMOpen}
                  items={[
                    {
                      icon: <UserCircle size={16} />,
                      text: "Employees",
                      active: activeSubItem === "Employees",
                      onClick: () => handleSubItemClick("Employees"),
                    },
                    {
                      icon: <Briefcase size={16} />,
                      text: "Projects",
                      active: activeSubItem === "Projects",
                      onClick: () => handleSubItemClick("Projects"),
                    },
                    {
                      icon: <FileText size={16} />,
                      text: "Template Maker",
                      active: activeSubItem === "Template Maker",
                      onClick: () => handleSubItemClick("Template Maker"),
                    },
                  ]}
                />
            </SidebarFunction>
        </div>
    )
};

export default Sidebar;
