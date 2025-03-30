export type Task = {
  id: number;
  taskName: string;
  documentType: {
    id: number;
    name: string;
  };
  project: {
    id: number;
    projectName: string;
  };
  dateAdded: string;
  completedDate?: string | null;
  taskStatus: string; // Gunakan taskStatus dari database
  user: {
    id: number;
    name: string;
  } | null;
  template: {
    id: number;
    templateName: string;
  };
  progresses: {
    id: number;
    checked: boolean;
    comment?: string | null;
  }[];
};