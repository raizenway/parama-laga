// types/task.ts
export type Task = {
    id: number;
    taskName: string;
    documentType: DocumentType;
    project: Project;
    dateAdded: string;
    user: User | null; 
    progresses: Progress[];
    completedDate?: string | null;
  };
  

//Sub-types
export type DocumentType = {
  id: number;
  name: string;
};

export type Project = {
  id: number;
  projectName: string;
};

export type User = {
  id: number;
  name: string;
};

export type Progress = {
  id: number;
  checked: boolean;
};