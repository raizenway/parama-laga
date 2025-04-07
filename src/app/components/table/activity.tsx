"use client";

import { useState, useEffect } from "react";
import { Loader2, PlusCircle, Save, CalendarClock, User, CheckCircle2, Pencil, NotebookPen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  
  // State for new category and item forms
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  
  // State for editing results
  const [editingItems, setEditingItems] = useState<Record<number, { result: string, comment: string }>>({});
  
  // Fetch activities
  useEffect(() => {
    if (projectId && weekId) {
      fetchActivities();
    }
  }, [projectId, weekId, employeeId, refreshTrigger]);
  
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
  
// Add a new category
const addCategory = async () => {
  if (!newCategoryName.trim()) {
    toast.error('Category name cannot be empty');
    return;
  }
  
  try {
    const response = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        weekId,
        name: newCategoryName.trim()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create category');
    }
    
    const newCategory = await response.json();
    
    // Update categories with the newly created one
    setCategories(prev => [...prev, newCategory]);
    
    // Reset the input and active category
    setNewCategoryName("");
    // Set active category to the newly created one so user can add items
    setActiveCategory(newCategory.id);
    toast.success('Category added successfully');
    
    // Refresh data to ensure everything is in sync
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
    setEditingItems({
      ...editingItems,
      [itemId]: {
        result: result?.result || '',
        comment: result?.comment || ''
      }
    });
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
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-tersier">
                <th className="px-4 py-3 text-left font-medium border-b">Category</th>
                <th className="px-4 py-3 text-left font-medium border-b">Item</th>
                <th className="px-4 py-3 text-left font-medium border-b">Result</th>
                <th className="px-4 py-3 text-left font-medium border-b">Comment</th>
                <th className="px-4 py-3 text-center font-medium border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
            {tableRows.map((row, index) => {
              const isEditing = row.itemId ? editingItems[row.itemId] !== undefined : false;

              // Group rows by category
              const isFirstInCategory = index === 0 || tableRows[index - 1].categoryId !== row.categoryId;
              const isCategorySpanned = index < tableRows.length - 1 && tableRows[index + 1].categoryId === row.categoryId;

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
                  <td className="px-4 py-3 border-r" rowSpan={categoryRowSpan}>
                    <div>
                      <p className="font-semibold">{row.categoryName}</p>
                      <p className="text-xs text-gray-500">By: {row.userName}</p>
                    </div>
                    
                    {/* Add item button */}
                    <div className="mt-2">
                      {activeCategory === row.categoryId ? (
                        <div className="flex gap-2 mt-2">
                          <Input 
                            size="sm"
                            placeholder="New activity item..." 
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className="text-sm py-1"
                          />
                          <Button 
                            size="sm"
                            onClick={() => addItem(row.categoryId)}
                            className="bg-primary text-white hover:bg-primary/90 text-xs"
                          >
                            Add
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setActiveCategory(row.categoryId)}
                          className="text-xs"
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Add Item
                        </Button>
                      )}
                    </div>
                  </td>
                )}
                
                {/* Handle empty item cases */}
                {row.itemId === null ? (
                  <>
                    <td className="px-4 py-3 text-gray-400" colSpan={4}>No items yet. Add an item to this category.</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">{row.itemName}</td>
                    
                    {isEditing ? (
                      <>
                        <td className="px-4 py-3">
                          <Input 
                            placeholder="Result..."
                            value={editingItems[row.itemId].result}
                            onChange={(e) => setEditingItems({
                              ...editingItems,
                              [row.itemId]: {
                                ...editingItems[row.itemId],
                                result: e.target.value
                              }
                            })}
                            className="w-full"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Textarea 
                            placeholder="Comments..."
                            value={editingItems[row.itemId].comment}
                            onChange={(e) => setEditingItems({
                              ...editingItems,
                              [row.itemId]: {
                                ...editingItems[row.itemId],
                                comment: e.target.value
                              }
                            })}
                            className="w-full h-20 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => saveResult(row.itemId, row.resultId)}
                            className="bg-primary text-white hover:bg-primary/90"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          {row.result ? (
                            <div className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                              <span>{row.result}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">No result yet</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {row.comment || <span className="text-gray-400">No comment</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(row.itemId, row.resultId ? {
                              id: row.resultId,
                              result: row.result,
                              comment: row.comment,
                              updatedAt: row.updatedAt
                            } : null)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            {row.result ? 'Update' : 'Add Result'}
                          </Button>
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
    </div>
  );
}