"use client"
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SingleSelection from "../dropdown-single-selection";


const template = ["Template A", "Template B", "Template C"];
const project = ["Project A", "Project B", "Project C"];
const docType = ["Document A", "Document B", "Document C"];
export default function DocumentForm({onClose} : {onClose: () => void}) {
  const [selectedProject, setselectedProject] = useState<string|null>(null);
  const [selectedTemplate, setselectedTemplate] = useState<string|null>(null);
  const [selectedDocType, setselectedDocType] = useState<string|null>(null);
  
  return (
    <div className="w-full bg-white">
      <form className="font-poppins space-y-5">
        <div className="flex grow gap-8">
          <div className="flex flex-col grow gap-2">
            {/* DOCUMENT IDENTITY */}
            <h1 className="my-1">Task Name</h1>
              <Input className="border-slate-500" placeholder="Insert task name"/>
            
            {/* DETAIL TASK */}
            <div className="grid grow grid-cols-3 gap-2">
              <div>
                <h1 className="my-1">Template</h1>
                <div className="">
                  <SingleSelection options={template}
                                    selectedItem={selectedTemplate}
                                    setSelectedItem={setselectedTemplate}/>
                </div>
              </div>
              <div>
                <h1 className="my-1">Project</h1>
                <div className="">
                  <SingleSelection options={project}
                                    selectedItem={selectedProject}
                                    setSelectedItem={setselectedProject}/>
                </div>
              </div>
              <div>
                <h1 className="my-1">Document Type</h1>
                <div className="">
                  <SingleSelection options={docType}
                                    selectedItem={selectedDocType}
                                    setSelectedItem={setselectedDocType}/>
                </div>
              </div>
            </div>
            <div className=" flex justify-end items-end mt-5">
              <Button className="bg-primary text-white w-1/3 hover:bg-indigo-900">Submit</Button>
            </div>
          </div>

        </div> 
      </form>
    </div>
  )
  
}
