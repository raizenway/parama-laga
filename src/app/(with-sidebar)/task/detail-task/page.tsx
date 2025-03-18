"use client"
import SingleSelection from "@/app/components/dropdown-single-selection";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const project = ["KAI", "Apple", "PLN", "Telkomsel"];
const document = ["Doc1", "Doc2", "Doc3"];
const status = ["Done", "On Going", "Delayed"];

export default function(){
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    
    return(
            <div className="m-8 h-screen flex-wrap">
              {/* Baris 2 */}
                <div className="grow p-7 py-8 rounded-lg bg-zinc-50 shadow-[0px_0px_13px_2px_rgba(0,_0,_0,_0.2)]">
                    <div className="font-poppins font-bold text-2xl">Template Name</div>
                        <div className="grid grow gap-2 mt-5 w-3/5">   
                            <div className="flex flex-col gap-2">
                                Task Name
                                <Input placeholder="Entry Task Name"></Input>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col gap-2">
                                    Select Document
                                    <SingleSelection 
                                        options={document}
                                        selectedItem={selectedDoc}
                                        setSelectedItem={setSelectedDoc}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    Select Project
                                    <SingleSelection 
                                        options={project}
                                        selectedItem={selectedProject}
                                        setSelectedItem={setSelectedProject}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    Status
                                    <SingleSelection 
                                        options={status}
                                        selectedItem={selectedStatus}
                                        setSelectedItem={setSelectedStatus}
                                    />
                                </div>
                            </div>
                    </div>
                </div>
            </div>
            
    );
    
}