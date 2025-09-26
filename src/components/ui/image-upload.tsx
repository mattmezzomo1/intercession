import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
  useR2Upload?: boolean; // New prop to enable R2 upload
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  className,
  useR2Upload = true // Default to true for new R2 system
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImages, uploadBase64Images, isUploading } = useImageUpload();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || isUploading) return;

    const remainingSlots = maxImages - images.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    // Convert FileList to Array and filter only images
    const imageFiles = Array.from(files)
      .slice(0, filesToProcess)
      .filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) return;

    try {
      if (useR2Upload) {
        // Upload to R2 and get URLs
        const uploadedUrls = await uploadImages(imageFiles);
        onImagesChange([...images, ...uploadedUrls]);
      } else {
        // Fallback to base64 (old method)
        const newImages: string[] = [];

        for (const file of imageFiles) {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
          newImages.push(base64);
        }

        // Upload base64 images to R2
        const uploadedUrls = await uploadBase64Images(newImages);
        onImagesChange([...images, ...uploadedUrls]);
      }
    } catch (error) {
      console.error('Error handling file upload:', error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const openFileDialog = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const canAddMore = images.length < maxImages && !isUploading;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {canAddMore && (
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <div className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              {isUploading ? (
                <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <h3 className="font-semibold mb-2">
              {isUploading ? "Enviando imagens..." : "Adicionar imagens"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isUploading
                ? "Por favor, aguarde enquanto suas imagens são enviadas"
                : `Arraste e solte ou clique para selecionar até ${maxImages} imagens`
              }
            </p>
            <p className="text-xs text-muted-foreground">
              {images.length}/{maxImages} imagens adicionadas
            </p>
          </div>
        </Card>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add More Button */}
      {images.length > 0 && canAddMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={openFileDialog}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Adicionar mais imagens ({images.length}/{maxImages})
        </Button>
      )}
    </div>
  );
}
