// utils/filter-utils.ts
import { Task } from "../types/task";
import { Project } from "../types/project";

export const getUniqueOptions = <T,>(
  items: T[],
  getValue: (item: T) => string,
  getLabel: (item: T) => string
) => {
  const uniqueMap = new Map<string, string>();
  items.forEach(item => {
    const value = getValue(item);
    if (value && !uniqueMap.has(value)) {
      uniqueMap.set(value, getLabel(item));
    }
  });
  
  return Array.from(uniqueMap.entries()).map(([value, label]) => ({
    value,
    label
  }));
};

export const getDocumentTypeOptions = (tasks: Task[]) => {
  return getUniqueOptions(
    tasks,
    task => task.documentType.id.toString(),
    task => task.documentType.name
  );
};

export const getProjectOptions = (tasks: Task[]) => {
  return getUniqueOptions(
    tasks,
    task => task.project.id.toString(),
    task => task.project.projectName
  );
};

export const getAssigneeOptions = (tasks: Task[]) => {
  const options = getUniqueOptions(
    tasks.filter(task => task.user),
    task => task.user?.id.toString() ?? "",
    task => task.user?.name ?? ""
  );
  
  // Add unassigned option if any tasks are unassigned
  if (tasks.some(task => !task.user)) {
    options.unshift({ value: "unassigned", label: "Unassigned" });
  }
  
  return options;
};

export const statusOptions = [
  { value: "Done", label: "Done" },
  { value: "OnGoing", label: "On Going" },
  { value: "ToDo", label: "To Do" },
  { value: "NotStarted", label: "Not Started" },
];
  

export const getProjectStatusOptions = (projects: Project[]) => {
    const uniqueStatuses = getUniqueOptions(
      projects,
      project => project.status.statusName,
      project => project.status.statusName
    );
    return [...uniqueStatuses];
  };