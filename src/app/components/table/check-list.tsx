import { useState, useEffect } from "react";
import { Check, CircleCheckBig, ListChecks, NotebookPen, PlusCircle, Trash2, Loader2, Info } from "lucide-react";
import { toast } from "sonner";

type ChecklistTableProps = {
  taskId: number;
  userRole?:string | null;
};

type TaskProgress = {
  id: number;
  taskId: number;
  checklistId: number;
  checked: boolean;
  comment: string | null;
  updatedAt: Date | null;
  checklist: {
    id: number;
    criteria: string;
    hint?: string;
  };
};

export default function ChecklistTable({ taskId,userRole = null  }: ChecklistTableProps) {
  const [progressItems, setProgressItems] = useState<TaskProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newCriteria, setNewCriteria] = useState("");
  const [newHint, setNewHint] = useState("");

  const isManagerOrAdmin = userRole === 'admin' || userRole === 'project_manager';

  // Fetch task progress for this task
  useEffect(() => {
    if (!taskId) return;
    
    const fetchTaskProgress = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/task-progress/${taskId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch checklist items");
        }
        
        const data = await response.json();
        setProgressItems(data);
      } catch (error) {
        console.error("Error fetching task progress:", error);
        toast.error("Failed to load checklist items");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTaskProgress();
  }, [taskId]);

  const toggleCheck = async (item: TaskProgress) => {
    try {
      // Optimistic update
      setProgressItems(prev => prev.map(p => 
        p.id === item.id ? { ...p, checked: !p.checked } : p
      ));
      
      const response = await fetch(`/api/task-progress/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{
          ...item,
          checked: !item.checked,
          updatedAt: new Date()
        }])
      });
      
      if (!response.ok) {
        throw new Error("Failed to update checklist item");
      }
    } catch (error) {
      // Revert optimistic update on error
      setProgressItems(prev => prev.map(p => 
        p.id === item.id ? item : p
      ));
      toast.error("Failed to update checklist item");
    }
  };

  const handleNoteChange = (item: TaskProgress, newComment: string) => {
    setProgressItems(prev => prev.map(p => 
      p.id === item.id ? { ...p, comment: newComment } : p
    ));
  };
  
  const saveNote = async (item: TaskProgress) => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/task-progress/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{
          ...item,
          updatedAt: new Date()
        }])
      });
      
      if (!response.ok) {
        throw new Error("Failed to save note");
      }
    } catch (error) {
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTask = async () => {
    if (newCriteria.trim() === "") return;
    
    try {
      setIsSaving(true);
      
      // First create a new checklist
      const checklistResponse = await fetch('/api/checklists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ criteria: newCriteria.trim(), hint: newHint.trim() })
      });
      
      if (!checklistResponse.ok) {
        throw new Error("Failed to create checklist");
      }
      
      const checklist = await checklistResponse.json();
      
      // Then create task progress with the new checklist
      const progressResponse = await fetch(`/api/task-progress/${taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checklistId: checklist.id,
          checked: false,
          comment: ""
        })
      });
      
      if (!progressResponse.ok) {
        throw new Error("Failed to create task progress");
      }
      
      const newProgress = await progressResponse.json();
      setProgressItems(prev => [...prev, newProgress]);
      setNewCriteria("");
      setNewHint("");
      toast.success("New checklist item added");
    } catch (error) {
      toast.error("Failed to add checklist item");
    } finally {
      setIsSaving(false);
    }
  };
  
  const deleteItem = async (item: TaskProgress) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      setIsSaving(true);
      const response = await fetch(`/api/task-progress/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progressId: item.id })
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
      
      setProgressItems(prev => prev.filter(p => p.id !== item.id));
      toast.success("Item deleted successfully");
    } catch (error) {
      toast.error("Failed to delete item");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading checklist...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <table className="font-poppins w-full table-auto justify-start border-collapse">
        <thead className="bg-tersier">
          <tr>
            <th className="px-4 py-2 w-3/12 rounded-tl-lg text-left">
              <div className="flex items-center gap-1"><ListChecks /> Check List</div>
            </th>
            <th className="px-4 py-2 w-4/12 text-left">
              <div className="flex items-center gap-1"><Info /> Hint </div>
            </th>
            <th className="px-4 py-2 w-3/12 text-left">
              <div className="flex items-center gap-1"><NotebookPen /> Notes</div>
            </th>
            <th className="px-4 py-2 w-1/12 text-center">
              <div className="flex items-center justify-center gap-1"><CircleCheckBig /></div>
            </th>
            {isManagerOrAdmin && (
              <th className="px-4 py-2 w-1/12 text-center rounded-tr-lg">
                <div className="flex items-center justify-center gap-1">Actions</div>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {progressItems.length > 0 ? (
            progressItems.map((item) => (
              <tr key={item.id} className="border-b-2 border-tersier">
                <td className="py-4 px-4 border-r-2 border-l-2 border-tersier">
                  {item.checklist.criteria}
                </td>
                <td className="py-4 px-4 border-r-2 border-l-2 border-tersier">
                  {item.checklist.hint}
                </td>
                <td className="py-4 px-4 border-r-2 border-l-2">
                  <input
                    type="text"
                    value={item.comment || ""}
                    onChange={(e) => handleNoteChange(item, e.target.value)}
                    onBlur={() => saveNote(item)}
                    className="w-full bg-transparent outline-none border-b border-gray-300 focus:border-primary"
                    placeholder="Add a note..."
                    disabled={isSaving}
                  />
                </td>
                  <td className="py-4 px-4 border-r-2 border-l-2 text-center">
                    <button
                      onClick={() => toggleCheck(item)}
                      className={
                        item.checked
                          ? "text-green-500 hover:text-green-700"
                          : "text-gray-300 hover:text-gray-400"
                      }
                      disabled={isSaving}
                    >
                      <Check size={20} strokeWidth={4} />
                    </button>
                  </td>
                  {isManagerOrAdmin && (
                    <td className="py-4 px-4 border-r-2 border-l-2 text-center">
                      <button 
                        onClick={() => deleteItem(item)}
                        className="text-red-500 hover:text-red-700"
                        disabled={isSaving}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-4 px-4 text-center border-2 border-tersier">
                No checklist items yet. Add one below.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Input for new checklist item */}
      <div className="w-full mt-4 flex gap-2">
        <div className="space-y-2 w-full">
          <input
            type="text"
            value={newCriteria}
            onChange={(e) => setNewCriteria(e.target.value)}
            className="w-full p-2 border border-tersier rounded-md outline-none focus:border-indigo-400"
            placeholder="Add a new checklist item..."
            disabled={isSaving}
          />
          <div className="flex items-center gap-2">
            <Info className="text-gray-400" size={25} />
            <input
              type="text"
              value={newHint}
              onChange={(e) => setNewHint(e.target.value)}
              className="w-full p-2 border border-tersier rounded-md outline-none focus:border-indigo-400"
              placeholder="Hint"
              disabled={isSaving}
            />
          </div>
        </div>
        <button
          onClick={handleAddTask}
          disabled={isSaving || newCriteria.trim() === ""}
          className="text-tersier hover:text-indigo-400"
        >
          {isSaving ? (
            <Loader2 size={30} className="animate-spin" />
          ) : (
            <PlusCircle size={30} />
          )}
        </button>
      </div>
    </div>
  );
}