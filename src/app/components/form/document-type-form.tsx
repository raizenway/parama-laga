"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

type documentType = {
  id: number;
  name: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default function documentTypeForm({ onClose }: { onClose: () => void }) {
  const [documentTypes, setdocumentTypes] = useState<documentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtereddocumentTypes, setFilteredDocumentTypes] = useState<documentType[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newType, setnewType] = useState("");

  // Fetch documentTypes
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const response = await fetch('/api/document-types');
        
        if (!response.ok) {
          throw new Error("Failed to fetch document types");
        }
        
        const data = await response.json();
        setdocumentTypes(data);
        setFilteredDocumentTypes(data);
      } catch (error) {
        console.error("Error fetching document types:", error);
        toast.error("Failed to load document types");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocumentTypes();
  }, []);
  
  // Filter documentTypes when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDocumentTypes(documentTypes);
      return;
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = documentTypes.filter(
      documentType => documentType.name.toLowerCase().includes(lowerCaseSearch)
    );
    
    setFilteredDocumentTypes(filtered);
  }, [searchTerm, documentTypes]);

  // Add new documentType
  const addNewType = async () => {
    if (!newType.trim()) {
      toast.error("Please enter a document type");
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/document-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newType
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to create document type");
      }
      
      const newdocumentType = await response.json();
      setdocumentTypes([...documentTypes, newdocumentType]);
      setFilteredDocumentTypes([...filtereddocumentTypes, newdocumentType]);
      setnewType("");
      toast.success("Document type added successfully");
    } catch (error) {
      console.error("Error adding documentType:", error);
      toast.error("Failed to add documentType");
    } finally {
      setIsSaving(false);
    }
  };

  // Update documentType
  const updatename = async (documentType: documentType, newValue: string) => {
    if (!newValue.trim()) {
      toast.error("Document type cannot be empty");
      return;
    }
    
    if (newValue === documentType.name) {
      setEditingIndex(null);
      return;
    }
    
    try {
      const response = await fetch(`/api/document-types/${documentType.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newValue
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to update document type");
      }
      
      const updatedDocumentType = await response.json();
      
      setdocumentTypes(documentTypes.map(cl => 
        cl.id === updatedDocumentType.id ? updatedDocumentType : cl
      ));
      
      setFilteredDocumentTypes(filtereddocumentTypes.map(cl => 
        cl.id === updatedDocumentType.id ? updatedDocumentType : cl
      ));
      
      setEditingIndex(null);
      toast.success("Document type updated successfully");
    } catch (error) {
      console.error("Error updating documentType:", error);
      toast.error("Failed to update documentType");
    }
  };

  // Delete documentType
  const removedocumentType = async (id: number) => {
    try {
      const response = await fetch(`/api/document-types/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete documentType");
      }
      
      setdocumentTypes(documentTypes.filter(cl => cl.id !== id));
      setFilteredDocumentTypes(filtereddocumentTypes.filter(cl => cl.id !== id));
      toast.success("Document type deleted successfully");
    } catch (error: any) {
      console.error("Error deleting documentType:", error);
      toast.error(error.message || "Failed to delete document type");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading document types...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-5 rounded-lg shadow-md space-y-3">
      <Input 
        type="search" 
        placeholder="Search document type" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <div className="font-poppins space-y-4">
        {/* Container with height limit and overflow */}
        <div className="max-h-80 overflow-y-auto border border-gray-300 p-2 rounded-lg">
          {filtereddocumentTypes.length > 0 ? (
            filtereddocumentTypes.map((documentType) => (
              <div key={documentType.id} className="flex items-center gap-3 mb-2">
                <Input
                  type="text"
                  value={editingIndex === documentType.id ? newType : documentType.name}
                  placeholder="Check name"
                  onChange={(e) => {
                    if (editingIndex === documentType.id) {
                      setnewType(e.target.value);
                    }
                  }}
                  onFocus={() => {
                    if (editingIndex !== documentType.id) {
                      setEditingIndex(documentType.id);
                      setnewType(documentType.name);
                    }
                  }}
                  className="flex-grow"
                />
                
                {/* Edit confirmation button */}
                {editingIndex === documentType.id && (
                  <button
                    type="button"
                    onClick={() => updatename(documentType, newType)}
                    className="p-1 rounded-md bg-green-500 text-white hover:bg-green-700"
                    title="Save changes"
                  >
                    <Check size={16} />
                  </button>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removedocumentType(documentType.id)}
                  className="p-1 rounded-md bg-red-500 text-white hover:bg-red-700"
                  title="Delete documentType"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              {searchTerm ? "No documentTypes match your search" : "No document types available"}
            </div>
          )}
        </div>

        {/* Add new documentType */}
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="New document type"
            value={newType}
            onChange={(e) => setnewType(e.target.value)}
            className="flex-grow"
          />
          <Button
            type="button"
            onClick={addNewType}
            className="bg-blue-600 text-white hover:bg-blue-800"
            disabled={isSaving || !newType.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "+ Add"
            )}
          </Button>
        </div>

        <Button 
          type="button" 
          onClick={onClose} 
          className="mt-2 bg-primary text-white hover:bg-indigo-900 w-full"
        >
          Done
        </Button>
      </div>
    </div>
  );
}