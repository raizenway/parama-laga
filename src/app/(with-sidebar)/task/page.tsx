"use client";

import ProjectCard from "@/app/components/project-card";

export default function Page() {
    return (
        <div className="p-5 space-y-3">
            <h1 className="mt-5 text-xl font-bold">Select Project</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 justify-left">
                <ProjectCard />
                <ProjectCard />
                <ProjectCard />
                <ProjectCard />
                <ProjectCard />
                <ProjectCard />
                <ProjectCard />
                <ProjectCard />
                <ProjectCard />
                <ProjectCard />
            </div>
        </div>
    );
}
