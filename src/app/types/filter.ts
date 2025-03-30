export interface FilterOption {
    value: string;
    label: string;
  }
  
export interface FilterConfig {
  column: string;
  type: 'select' | 'text' | 'date';
  options?: FilterOption[]; // Select
  placeholder?: string;
  icon?: React.ReactNode;
}