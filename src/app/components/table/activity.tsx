"use client";

import { useState, useEffect } from "react";
import { Loader2, PlusCircle, Save, CheckCircle2, NotebookPen, Trash2, ListTodo, LayoutGrid, Paperclip, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DeleteConfirmation from"@/app/components/modal/delete-confirmation";

type ActivityTableProps = {
  projectId: number | null;
  weekId: number | null;
  employeeId: number | null;
  refreshTrigger: number;
  userRole: string | null;
};

type ActivityCategory = {
  id: number;
  name: string;
  user: {
    id: number;
    name: string;
    personnelId: string;
  };
  items: ActivityItem[];
};

type ActivityItem = {
  id: number;
  name: string;
  results: ActivityResult[];
};

type ActivityResult = {
  id: number;
  result: string | null;
  comment: string | null;
  updatedAt: string | null;
};

export default function ActivityTable({ 
  projectId, 
  weekId, 
  employeeId, 
  refreshTrigger,
  userRole
}: ActivityTableProps) {
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEmployee = userRole === 'employee';
  
  // State for new category and item forms
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  
  // State for editing results
  const [editingItems, setEditingItems] = useState<Record<number, { result: string, comment: string }>>({});
  
  // State to delete 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
    type: 'category' | 'item';
  } | null>(null);

  const fetchActivities = async () => {
    // ... existing fetch implementation ...
    setIsLoading(true);
    setError(null);
    try {
      let url = `/api/activities?projectId=${projectId}&weekId=${weekId}`;
      if (employeeId) url += `&employeeId=${employeeId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
    // Fetch activities
    useEffect(() => {
      if (projectId && weekId) {
        fetchActivities();
      }
    }, [projectId, weekId, employeeId, refreshTrigger, fetchActivities]);
  
// Add a new category
const addCategory = async () => {
  if (!newCategoryName.trim()) {
    toast.error('Category name cannot be empty');
    return;
  }
  
  try {
    // Create the request body
    const requestBody: any = {
      projectId,
      weekId,
      name: newCategoryName.trim()
    };
    
    // If we're viewing a specific employee's activities and user is PM/admin,
    // pass that employee's ID to create the category for them
    if (employeeId && userRole && (userRole === 'admin' || userRole === 'project_manager')) {
      requestBody.userId = employeeId;
    }
    
    const response = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create category');
    }
    
    const newCategory = await response.json();    
    // Update categories with the newly created one
    setCategories(prev => [...prev, newCategory]);
    
    // Reset the input and active category
    setCategories(prev => [...prev, newCategory]);
    setNewCategoryName("");
    toast.success('Category added successfully');
    fetchActivities();
  } catch (error) {
    console.error('Error adding category:', error);
    toast.error('Failed to add category');
  }
};
  
  // Add a new item to a category
  const addItem = async (categoryId: number) => {
    // ... existing addItem implementation ...
    if (!newItemName.trim()) {
      toast.error('Item name cannot be empty');
      return;
    }
    
    try {
      const response = await fetch('/api/activities/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          name: newItemName.trim()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create item');
      }
      
      const newItem = await response.json();
      
      // Update the categories state with the new item
      setCategories(prev => prev.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            items: [...category.items, {
              ...newItem,
              results: []
            }]
          };
        }
        return category;
      }));
      
      setNewItemName("");
      toast.success('Activity item added successfully');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add activity item');
    }
  };
  
  // Start editing an item's result
const startEditing = (itemId: number, result: ActivityResult | null) => {
  setEditingItems((prev) => ({
    ...prev,
    [itemId]: {
      result: result?.result || '',
      comment: result?.comment || '',
    },
  }));
};
  
  // Save result for an item
  const saveResult = async (itemId: number, existingResultId: number | null) => {
    // ... existing saveResult implementation ...
    const resultData = editingItems[itemId];
    if (!resultData) return;
    
    try {
      let response;
      if (existingResultId) {
        // Update existing result
        response = await fetch('/api/activities/results', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: existingResultId,
            result: resultData.result,
            comment: resultData.comment
          })
        });
      } else {
        // Create new result
        response = await fetch('/api/activities/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId,
            result: resultData.result,
            comment: resultData.comment
          })
        });
      }
      
      if (!response.ok) {
        throw new Error('Failed to save result');
      }
      
      const savedResult = await response.json();
      
      // Update categories state with the new/updated result
      setCategories(prev => prev.map(category => ({
        ...category,
        items: category.items.map(item => {
          if (item.id === itemId) {
            if (existingResultId) {
              // Update existing result
              return {
                ...item,
                results: item.results.map(r => 
                  r.id === existingResultId ? savedResult : r
                )
              };
            } else {
              // Add new result
              return {
                ...item,
                results: [...item.results, savedResult]
              };
            }
          }
          return item;
        })
      })));
      
      // Clear editing state
      const newEditingItems = { ...editingItems };
      delete newEditingItems[itemId];
      setEditingItems(newEditingItems);
      
      toast.success('Result saved successfully');
    } catch (error) {
      console.error('Error saving result:', error);
      toast.error('Failed to save result');
    }
  };
  
  const deleteCategory = async (categoryId: number) => {
    try {
      const response = await fetch(`/api/activities/category/${categoryId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete category');
      toast.success('Category deleted successfully');
      // Refresh the activities after deletion
      fetchActivities();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };
  
  const deleteItem = async (itemId: number) => {
    try {
      const response = await fetch(`/api/activities/items/${itemId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete item');
      toast.success('Item deleted successfully');
      fetchActivities();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading activities...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

// Replace your current tableRows generation logic with this:

const tableRows: {
  categoryId: number;
  categoryName: string;
  userName: string;
  itemId: number | null;
  itemName: string | null;
  result: string | null;
  resultId: number | null;
  comment: string | null;
  updatedAt: string | null;
}[] = [];

categories.forEach(category => {
  // If the category has no items, add a placeholder row for the category
  if (category.items.length === 0) {
    tableRows.push({
      categoryId: category.id,
      categoryName: category.name,
      userName: category.user.name,
      itemId: null,
      itemName: null,
      result: null,
      resultId: null,
      comment: null,
      updatedAt: null
    });
  } else {
    // Otherwise add rows for each item as before
    category.items.forEach(item => {
      const latestResult = item.results.length > 0 
        ? item.results[item.results.length - 1] 
        : null;
      
      tableRows.push({
        categoryId: category.id,
        categoryName: category.name,
        userName: category.user.name,
        itemId: item.id,
        itemName: item.name,
        result: latestResult?.result || null,
        resultId: latestResult?.id || null,
        comment: latestResult?.comment || null,
        updatedAt: latestResult?.updatedAt || null
      });
    });
  }
});
  
  return (
    <div className="space-y-6">
      {/* Add new category form */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex gap-2">
          <Input 
            placeholder="New activity category..." 
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1"
          />
          <Button onClick={addCategory} className="bg-primary text-white hover:bg-primary/90">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>
      
      {tableRows.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <NotebookPen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No activities found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Create a new activity category and add items to get started
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className=" table-fixed w-full border-collapse">
            <thead>
              <tr className="bg-tersier">
                <th className="w-[20%] px-4 py-3 text-left font-bold border-b">
                  <div className="flex gap-2">
                    <LayoutGrid /> Category
                  </div>
                </th>
                <th className="w-[25%] px-4 py-3 text-left font-bold border-b">
                  <div className="flex gap-2">
                    <ListTodo /> Item
                  </div>
                </th>
                <th className="w-[25%] px-4 py-3 text-left font-bold border-b">
                  <div className="flex gap-2">
                    <Paperclip /> Result
                  </div>
                </th>
                <th className="w-[25%] px-4 py-3 text-left font-bold border-b">
                  <div className="flex gap-2">
                    <MessageSquareText /> Comment
                  </div>
                </th>
                <th className="w-[5%] px-4 py-3 text-center font-bold border-b"></th>
              </tr>
            </thead>
            <tbody>
            {tableRows.map((row, index) => {
              const isEditing = row.itemId ? editingItems[row.itemId] !== undefined : false;

              // Group rows by category
              const isFirstInCategory = index === 0 || tableRows[index - 1].categoryId !== row.categoryId;

              // Count how many rows this category spans
              let categoryRowSpan = 1;
              if (isFirstInCategory) {
              for (let i = index + 1; i < tableRows.length; i++) {
                if (tableRows[i].categoryId === row.categoryId) {
                  categoryRowSpan++;
                } else {
                  break;
                }
              }
              }

              return (
              <tr key={`${row.categoryId}-${row.itemId || 'empty'}`} className="border-b hover:bg-gray-50">
                {isFirstInCategory && (
                  <td className="px-3 py-3 space-y-5 border-r" rowSpan={categoryRowSpan}>
                    <div className="flex justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold">{row.categoryName}</p>
                        <p className="text-xs text-gray-500">By: {row.userName}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          title="Delete Category"
                          onClick={() => {
                            setDeleteTarget({
                              id: row.categoryId,
                              name: row.categoryName,
                              type: 'category'
                            });
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="text-red-500 hover:text-red-600"/>
                        </button>

                        <button
                          type="button"
                          title="Add Item"
                          onClick={() => setActiveCategory(row.categoryId)}
                        >
                          <PlusCircle className="text-primary hover:text-primary/75" />
                        </button>
                      </div>
                    </div>

                    {activeCategory === row.categoryId ? (
                            <div className="flex gap-2 mt-2">
                              <Input 
                                size="sm"
                                placeholder="New category item..." 
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="text-sm py-1"
                              />
                              <Button 
                                size="sm"
                                onClick={() => {
                                  addItem(row.categoryId);
                                  setActiveCategory(null);
                                }}
                                className="bg-primary text-white hover:bg-primary/90 text-xs"
                              >
                                Add
                              </Button>
                            </div>
                          ) : ( <div> </div>)}
                  </td>
                )}
                
                {/* Handle empty item cases */}
                {row.itemId === null ? (
                  <>
                    <td className="px-4 py-3 text-gray-400 border-r">No items yet. Add an item to this category.</td>
                    <td className="border-r"></td>
                    <td className="border-r"></td>
                    <td className="border-r"></td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 border-r">{row.itemName}</td>
                    
                    {isEditing ? (
                      <>
                        <td className="px-4 py-3 border-r">
                          <Textarea 
                            placeholder="Result..."
                            value={editingItems[row.itemId].result}
                            onChange={(e) => setEditingItems({
                              ...editingItems,
                              [row.itemId]: {
                                ...editingItems[row.itemId],
                                result: e.target.value
                              }
                            })}
                            className="w-full h-20"
                          />
                        </td>
                        <td className="px-4 py-3 border-r">
                          <Textarea 
                          placeholder="Comment..."
                          value={editingItems[row.itemId].comment}
                          onChange={(e) => setEditingItems({
                            ...editingItems,
                            [row.itemId]: {
                            ...editingItems[row.itemId],
                            comment: e.target.value
                            }
                          })}
                          className={`w-full h-20 text-sm ${isEmployee ? 'bg-gray-100' : ''}`}
                          readOnly={isEmployee}
                          disabled={isEmployee}
                          />
                        </td>
                        <td className="px-4 py-3 text-center border-r">
                            <button
                              type="button"
                              title="Save"
                              className="text-emerald-500 hover:text-emerald-600" 
                              onClick={() => saveResult(row.itemId, row.resultId)}
                            >
                              <Save/>
                            </button>
                        </td>
                      </>
                      ) : (
                      <>
                        <td className="hover:bg-slate-100">
                            <div
                              title="Click to edit"
                              className="flex items-top gap-3 px-4 py-3 border-r "
                              onClick={() => startEditing(row.itemId, row.resultId ? {
                                id: row.resultId,
                                result: row.result,
                                comment: row.comment,
                                updatedAt: row.updatedAt
                              } : null)}
                            >
                            {row.result ? (
                              <>
                                <div className="min-w-[20px]">
                                  <CheckCircle2 className="text-green-600" />
                                </div>
                                <span>{row.result}</span>
                              </>
                              ):(
                                <span className="text-gray-400">No result yet</span>
                              )}
                            </div>
                        </td>
                        <td className="py-3 border-r hover:bg-slate-100">
                          <div
                              title="Click to edit"
                              className="flex items-top gap-3 px-4 py-3 border-r "
                              onClick={() => startEditing(row.itemId, row.resultId ? {
                                id: row.resultId,
                                result: row.result,
                                comment: row.comment,
                                updatedAt: row.updatedAt
                              } : null)}
                          >
                            {row.comment || <span className="text-gray-400">No comment</span>}
                          </div>
                        </td>
                        <td>
                          <div className="flex justify-center" title="Delete Item">
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-600" 
                              onClick={() => {
                                setDeleteTarget({
                                  id: row.itemId!, // non-null assertion because row.itemId exists here
                                  name: row.itemName || '',
                                  type: 'item'
                                });
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <Trash2/>
                            </button>
                          </div>
                        </td>
                        
                      </>
                    )}
                  </>
                )}
              </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      )}
      {/* This goes after the table */}
      {isDeleteModalOpen && (
          <DeleteConfirmation 
            open={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setDeleteTarget(null);
            }}
            onConfirm={() => {
              if (deleteTarget) {
                if (deleteTarget.type === 'category') {
                  deleteCategory(deleteTarget.id);
                } else {
                  deleteItem(deleteTarget.id);
                }
              }
              setIsDeleteModalOpen(false);
              setDeleteTarget(null);
            }}
            entityType="category"
            name={deleteTarget ? deleteTarget.name : ""}
            title="Confirm Delete"
            description="This action cannot be undone."
            isLoading={false}
          />
        )}
    </div>
  );
}
