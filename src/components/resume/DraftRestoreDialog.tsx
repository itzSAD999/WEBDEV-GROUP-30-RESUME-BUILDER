import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText, RefreshCw } from "lucide-react";

interface DraftRestoreDialogProps {
  open: boolean;
  onRestore: () => void;
  onStartFresh: () => void;
}

export const DraftRestoreDialog = ({
  open,
  onRestore,
  onStartFresh,
}: DraftRestoreDialogProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Resume Draft Found
          </AlertDialogTitle>
          <AlertDialogDescription>
            A saved draft was found. Would you like to continue editing where you left off?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStartFresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Start Fresh
          </AlertDialogCancel>
          <AlertDialogAction onClick={onRestore} className="gap-2">
            <FileText className="w-4 h-4" />
            Restore Draft
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
