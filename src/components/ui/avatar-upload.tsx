import { useState, useRef } from "react";
import { Camera, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useImageUpload } from "@/hooks/useImageUpload";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onAvatarChange: (avatarUrl: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  useR2Upload?: boolean;
}

export function AvatarUpload({ 
  currentAvatar,
  onAvatarChange, 
  className,
  size = "md",
  useR2Upload = true
}: AvatarUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, uploadBase64Avatar, isUploading } = useImageUpload();

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0 || isUploading) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      return;
    }

    try {
      if (useR2Upload) {
        // Upload file directly to R2
        const uploadedUrl = await uploadAvatar(file);
        onAvatarChange(uploadedUrl);
      } else {
        // Fallback to base64 upload
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = e.target?.result as string;
          try {
            const uploadedUrl = await uploadBase64Avatar(base64);
            onAvatarChange(uploadedUrl);
          } catch (error) {
            console.error('Error uploading base64 avatar:', error);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error handling avatar upload:', error);
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

  const openFileDialog = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn("relative group", className)}>
      {/* Avatar Display */}
      <div
        className={cn(
          "relative cursor-pointer transition-all duration-200",
          sizeClasses[size],
          isDragging && "scale-105 ring-2 ring-primary ring-offset-2",
          isUploading && "opacity-50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <Avatar className={cn("w-full h-full", isUploading && "animate-pulse")}>
          <AvatarImage src={currentAvatar || undefined} />
          <AvatarFallback>
            <User className="w-1/2 h-1/2" />
          </AvatarFallback>
        </Avatar>

        {/* Overlay */}
        <div className={cn(
          "absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
          isUploading && "opacity-100"
        )}>
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      {/* Upload Button (optional, for better UX) */}
      <Button
        variant="outline"
        size="sm"
        className="mt-2 w-full"
        onClick={openFileDialog}
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Camera className="w-4 h-4 mr-2" />
            Alterar foto
          </>
        )}
      </Button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Help Text */}
      <p className="text-xs text-muted-foreground mt-1 text-center">
        {isUploading 
          ? "Enviando sua foto..."
          : "Clique ou arraste uma imagem"
        }
      </p>
    </div>
  );
}
