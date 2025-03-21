"use client"
import SubmitButton from "@/app/components/button/button";
import DropdownMultipleSelection from "@/app/components/dropdown-multiple-selection";
import SingleSelection from "@/app/components/dropdown-single-selection";
import CheckListTable from "@/app/components/table/check-list";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const statuses = ["Done", "On Going", "To Do"];

export default function(){
    const [status, setStatus] = useState("To Do");
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [assignees, setAssignees] = useState<string[]>([]);
    
    return(
            <div className="m-8 h-screen flex-wrap">
                <div className="space-y-5 grow p-7 py-8 rounded-lg bg-zinc-50 shadow-[0px_0px_13px_2px_rgba(0,_0,_0,_0.15)]">
                    <div className="font-poppins font-bold text-2xl">Task Name</div>
                        <div className="grid grow gap-2 mt-5 w-1/2">                               
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-2">
                                    Document Type
                                    <Input className="border-black bg-slate-300" value="Document A" disabled></Input>
                                </div>
                                <div className="flex flex-col gap-2">
                                    Project
                                    <Input className="border-black bg-slate-300" value="Project A" disabled></Input>
                                </div>
                                <div className="flex flex-col col-span-3 gap-2">
                                    Status
                                    <SingleSelection 
                                        options={statuses}
                                        selectedItem={selectedStatus}
                                        setSelectedItem={setSelectedStatus}

                                    />
                                </div>
                                { selectedStatus === "To Do" && (
                                    <div className="flex flex-col col-span-3 gap-2">
                                        Assign to Employee
                                      <DropdownMultipleSelection
                                        options={["John Doe", "Jane Smith", "Alice Brown"]}
                                        selectedItems={assignees}
                                        setSelectedItems={setAssignees}
                                      />
                                    </div>
                                )}
                            </div>
                            <div className="font-bold text-emerald-500">Iterasi ke-n</div>                  
                        </div>
                    <CheckListTable/>
                    <div className="justify-items-end pt-2">
                        <SubmitButton   text="Submit"
                                        onClick={() => console.log('submit')}
                                        color='bg-primary'
                                        hoverColor='hover:bg-indigo-900'
                                        textColor="text-zinc-100"
                                        width="w-1/5"
                                        height="h-12"/>
                    </div>
                </div>
            </div>
    );
    
}