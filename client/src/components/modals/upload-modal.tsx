import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Upload, CloudUpload } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [options, setOptions] = useState({
    extractCharacters: true,
    extractEvents: true,
    extractPlots: true,
    extractLore: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/campaigns/default-campaign/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Successful",
        description: `Processed ${data.results?.length || 0} files successfully`,
      });
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/default-campaign/timeline"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/default-campaign/characters"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/default-campaign/plots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/default-campaign/lore"] });
      
      setFiles(null);
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to process uploaded files",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(event.target.files);
  };

  const handleSubmit = () => {
    if (!files || files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("documents", file);
    });
    
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    uploadMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-4" data-testid="upload-modal">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Import Campaign Notes
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            data-testid="close-upload-modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Upload Zone */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <CloudUpload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">Drop files here or click to browse</p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PDF, TXT, DOC files up to 10MB
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              data-testid="file-input"
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Select Files
              </label>
            </Button>
            
            {files && files.length > 0 && (
              <div className="mt-4 text-left">
                <p className="text-sm font-medium text-foreground mb-2">Selected files:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {Array.from(files).map((file, index) => (
                    <li key={index} data-testid={`selected-file-${index}`}>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* AI Processing Options */}
          <div>
            <h4 className="font-medium text-foreground mb-3">AI Analysis Options</h4>
            <div className="space-y-3">
              {Object.entries(options).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, [key]: !!checked }))
                    }
                    data-testid={`option-${key}`}
                  />
                  <label htmlFor={key} className="text-sm text-foreground cursor-pointer">
                    {getOptionLabel(key)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              data-testid="cancel-upload"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={uploadMutation.isPending}
              data-testid="process-files"
            >
              {uploadMutation.isPending ? "Processing..." : "Process Files"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getOptionLabel(key: string): string {
  const labels = {
    extractCharacters: "Extract character names and details",
    extractEvents: "Identify timeline events",
    extractPlots: "Detect plot threads and hooks",
    extractLore: "Extract world lore and locations",
  };
  return labels[key as keyof typeof labels] || key;
}
