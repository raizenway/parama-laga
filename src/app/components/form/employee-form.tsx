"use client"
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import StatusDropdown from "../status-dropdown";
import ProjectAssigning from "../dropdown-multiple-selection";
import { Button } from "@/components/ui/button";

const projects = ["KAI", "Apple", "PLN", "Telkomsel"];

export default function EmployeeForm({ onClose }: { onClose: () => void }) {
  const [position, setPosition] = useState("Status");
  const [image, setImage] = useState("person.png"); // Gambar default
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [multipleProjects, setMultipleProjects] = useState<string[]>([]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  return (
    <div className="w-full bg-white">
      <form className="font-poppins space-y-5">
        <div className="flex grow gap-8">
          {/* Image Upload */}
          <div
            className="relative cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <img
              src={image}
              alt="Employee"
              className="rounded-full h-32 w-32 border border-gray-300"
            />
            {/* Overlay gelap saat hover */}
            <div className="absolute inset-0 h-32 w-32 bg-opacity-50 rounded-full hidden group-hover:flex items-center justify-center hover:bg-black hover:bg-opacity-50 hover:transition">
              <span className="text-white text-xs">Change Photo</span>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="flex flex-col grow gap-2">
            {/* EMPLOYEE IDENTITY */}
            <h1 className="my-1">Employee Identity</h1>
            <Input placeholder="Employee Name" />
            <Input placeholder="Employee Role" />
            <Input placeholder="Employee ID" />
            <StatusDropdown position={position} setPosition={setPosition} />

            <h1 className="my-1">Employee Account</h1>
            <Input type="email" placeholder="Email pegawai" />
            <Input type="password" id="password" placeholder="******" />

            <h1 className="my-2">Project</h1>

            {/* EMPLOYEE PROJECTS */}
            <ProjectAssigning
              options={projects}
              selectedItems={multipleProjects}
              setSelectedItems={setMultipleProjects}
            />

            <Button className="my-2 bg-primary text-white w-1/3 hover:bg-indigo-900">
              Submit
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
