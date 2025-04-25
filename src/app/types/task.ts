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
    projectCode: string;
  };
  dateAdded: string;
  completedDate?: string | null;
  taskStatus: string;
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