import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { X } from "lucide-react";

const employees = [
  "Cek Header",
  "Cek Kop Surat",
  "Cek Tanggal Pengesahan",
  "Cek Nama Mahasiswa",
  "Cek NIM Mahasiswa",
  "Cek Program Studi",
  "Cek Judul Tugas Akhir",
  "Cek Nama Dosen Pembimbing",
  "Cek Nama Dosen Penguji",
  "Cek Tanda Tangan Dosen",
  "Cek Halaman Persetujuan",
  "Cek Abstrak",
  "Cek Kata Pengantar",
  "Cek Daftar Isi",
  "Cek Daftar Gambar",
  "Cek Daftar Tabel",
  "Cek Bab 1 Pendahuluan",
  "Cek Bab 2 Landasan Teori",
  "Cek Bab 3 Metodologi Penelitian",
  "Cek Bab 4 Hasil dan Pembahasan",
  "Cek Bab 5 Kesimpulan dan Saran",
];


export default function CheckList({selectedItems, setSelectedItems} : {selectedItems:string[],  setSelectedItems: (items: string[] | ((prev: string[]) => string[])) => void}){
    const toggleSelection = (value: string) => {
        setSelectedItems((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
        );
    };

    return (
        <div className="space-y-2">
            <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-12 ">
                        {selectedItems.length > 0 ? `${selectedItems.length} Check Added` : "Add Check"}
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-80 overflow-y-auto border border-gray-300 p-2 rounded-lg w-[var(--radix-popper-anchor-width)]">
                    {employees.map((option) => (
                        <DropdownMenuCheckboxItem
                        key={option}
                        checked={selectedItems.includes(option)}
                        onCheckedChange={() => toggleSelection(option)}
                        >
                        {option}
                        </DropdownMenuCheckboxItem>
                    ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {selectedItems.length > 0 && (
                    <div className="max-h-80 overflow-y-auto border border-gray-300 p-2 rounded-lg rounded-md space-y-1">
                    {selectedItems.map((item) => (
                      <div key={item} className="flex items-center h-12 justify-between border border-blue-500 text-blue-500 bg-gray-100 px-3 py-1 rounded-md">
                        <span>{item}</span>
                        <button
                          onClick={() => setSelectedItems(selectedItems.filter((i) => i !== item))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      ))}
                    </div>
                  )}    
        </div>    
    )
}