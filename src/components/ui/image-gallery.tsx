import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const openModal = (index: number) => {
    setSelectedImage(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
    }
  };

  // Single image layout
  if (images.length === 1) {
    return (
      <>
        <div className={cn("mt-3", className)}>
          <div 
            className="aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => openModal(0)}
          >
            <img
              src={images[0]}
              alt="Prayer request image"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <ImageModal 
          images={images}
          selectedIndex={selectedImage}
          onClose={closeModal}
          onNext={nextImage}
          onPrev={prevImage}
        />
      </>
    );
  }

  // Two images layout
  if (images.length === 2) {
    return (
      <>
        <div className={cn("mt-3 grid grid-cols-2 gap-2", className)}>
          {images.map((image, index) => (
            <div
              key={index}
              className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => openModal(index)}
            >
              <img
                src={image}
                alt={`Prayer request image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <ImageModal 
          images={images}
          selectedIndex={selectedImage}
          onClose={closeModal}
          onNext={nextImage}
          onPrev={prevImage}
        />
      </>
    );
  }

  // Three or more images layout
  return (
    <>
      <div className={cn("mt-3", className)}>
        <div className="grid grid-cols-3 gap-2">
          {/* First image takes 2 columns */}
          <div
            className="col-span-2 aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => openModal(0)}
          >
            <img
              src={images[0]}
              alt="Prayer request image 1"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Second image */}
          <div
            className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => openModal(1)}
          >
            <img
              src={images[1]}
              alt="Prayer request image 2"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Third image or more indicator */}
          <div
            className="col-span-2 aspect-[2/1] rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-95 transition-opacity relative"
            onClick={() => openModal(2)}
          >
            <img
              src={images[2]}
              alt="Prayer request image 3"
              className="w-full h-full object-cover"
            />
            {images.length > 3 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  +{images.length - 3}
                </span>
              </div>
            )}
          </div>
          
          {/* Fourth image if exists */}
          {images.length > 3 && (
            <div
              className="aspect-[1/1] rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => openModal(3)}
            >
              <img
                src={images[3]}
                alt="Prayer request image 4"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
      <ImageModal 
        images={images}
        selectedIndex={selectedImage}
        onClose={closeModal}
        onNext={nextImage}
        onPrev={prevImage}
      />
    </>
  );
}

interface ImageModalProps {
  images: string[];
  selectedIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

function ImageModal({ images, selectedIndex, onClose, onNext, onPrev }: ImageModalProps) {
  if (selectedIndex === null) return null;

  return (
    <Dialog open={selectedIndex !== null} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-black/95">
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={onPrev}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={onNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Image */}
          <div className="flex items-center justify-center min-h-[60vh] max-h-[80vh]">
            <img
              src={images[selectedIndex]}
              alt={`Prayer request image ${selectedIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImage + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
