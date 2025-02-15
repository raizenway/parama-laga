"use client"
import Link from "next/link";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export const Sidebar = () => {
    const pathName = usePathname();

    return(
        <Sidebar >
            
        </Sidebar>
    )
}