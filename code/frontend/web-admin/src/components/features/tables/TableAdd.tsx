import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription,
         DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2, QrCode } from 'lucide-react';
interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function TableAdd({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Thêm bàn mới</DialogTitle>
            <DialogDescription>Nhập thông tin bàn cần thêm.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Tên bàn</Label>
              <Input id="name" name="name" placeholder="Bàn 01" />
            </div>
            <div>
              <Label htmlFor="capacity">Sức chứa (tùy chọn)</Label>
              <Input id="capacity" name="capacity" type="number" placeholder="4" />
            </div>
             {/* QR placeholder */}
        <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/50">
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <QrCode className="size-10 opacity-40" />
            <span className="text-xs">Mã QR</span>
          </div>
        </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit">Thêm bàn</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}