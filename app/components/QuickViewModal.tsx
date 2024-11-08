import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductDetails } from "@/components/ProductDetails";

interface QuickViewModalProps {
  productId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewModal({ productId, open, onOpenChange }: QuickViewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px]">
        <DialogHeader>
          <DialogTitle>Quick View</DialogTitle>
        </DialogHeader>
        <ProductDetails productId={productId} />
      </DialogContent>
    </Dialog>
  );
} 