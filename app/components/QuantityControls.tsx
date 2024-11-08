import { Minus, Plus } from "lucide-react";

interface QuantityControlsProps {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  disabled?: boolean;
}

export function QuantityControls({ 
  quantity, 
  onQuantityChange, 
  disabled = false 
}: QuantityControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onQuantityChange(quantity - 1)}
        disabled={disabled || quantity <= 1}
        className="p-1 rounded-full hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4 transition-transform duration-200 group-hover:scale-125" />
      </button>
      <span className="w-8 text-center">{quantity}</span>
      <button
        onClick={() => onQuantityChange(quantity + 1)}
        disabled={disabled}
        className="p-1 rounded-full hover:bg-secondary transition-colors group"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4 transition-transform duration-200 group-hover:scale-125" />
      </button>
    </div>
  );
} 