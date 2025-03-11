"use client";

import { ChevronDown, ChevronFirst, LogOut, MoreHorizontal, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function SidebarFunction({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    
    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/authentication");
    };
    
    return (
        <aside className="h-screen w-full">
            <nav className="h-full flex flex-col bg-white border-r shadow-sm">
                <div className="p-4 pb-2 flex justify-between items-center">
                    <img
                        src="parama.png"    
                        className="w-lg p-2 rounded-md shadow-md"
                        alt=""
                    />
                </div>

                <ul className="flex-1 px-3">
                    {children}
                </ul>
                <div className="border-t flex p-3">
                    <img
                        src={session?.user?.photoUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(session?.user?.name || "User") + "&background=c7d2fe&color=3730a3&bold=true"}
                        alt="User Avatar"
                        className="w-10 h-10 rounded-md object-cover"
                    />
                    <div className={`
                        flex justify-between items-center
                        w-64 ml-3
                    `}>
                        <div className="leading-4">
                            <h4 className="font-semibold">{session?.user?.name || "Loading..."}</h4>
                            <span className="text-xs text-gray-600">{session?.user?.email || ""}</span>
                        </div>
                        <div className="inline-flex">
                            <button
                                onClick={handleLogout}
                                className="hover:bg-gray-200 p-2 w-10 h-10 rounded-md">
                                <LogOut />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </aside>
    )
}

export function SidebarItem({ icon, text, active, alert, more, isOpen, onClick, children,
  }: { icon: React.ReactNode; text: string; active?: boolean; alert?: boolean; more?: boolean; isOpen?: boolean, onClick?: () => void; children?: React.ReactNode;
  })
  {
    return (
        <li 
            onClick={onClick}
            className={`
            relative flex items-center py-3 px-3 my-1
            font-medium rounded-md cursor-pointer
            transition-colors text-primary
            ${
                active
                ? "bg-primary text-white"
                : "hover:bg-indigo-50 text-gray-600"
            }
            `}>
            {icon}

            <span className="w-52 ml-3">{text}</span>
            {alert && <div className={`absolute right-2 w-2 h-2 rounded bg-indigo-400`} />}
            {more && <ChevronDown className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}/>}
        </li>
    )
}

export function SidebarMenu({ items, isOpen }: {
    items: { icon: React.ReactNode, text: string, active?: boolean, onClick?: () => void }[], isOpen?: boolean}) {
    return (
        <ul className={`transition-all 
            ${
                isOpen
                ? "max-h-40 opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }
            
        `}>
            {items.map((item, index) => (
                <li key={index} className={`flex items-center px-7 py-2  rounded-md cursor-pointer
                    ${item.active
                        ? "bg-indigo-100 text-blue-950"
                        : "hover:bg-indigo-50 text-gray-600"
                    }`} 
                    onClick={item.onClick}
                    >
                    {item.icon}
                    <span className="ml-3">{item.text}</span>
                </li>
            ))}
        </ul>
    );
}