import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface UploadResponse {
  success: boolean;
  data: {
    images?: string[];
    imageUrl?: string;
  };
  message: string;
}

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch(`${API_BASE_URL}/upload/prayer-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const result: UploadResponse = await response.json();
      
      if (!result.success || !result.data.images) {
        throw new Error(result.message || 'Upload failed');
      }

      toast({
        title: "✅ Imagens enviadas!",
        description: `${result.data.images.length} imagem(ns) enviada(s) com sucesso.`,
      });

      return result.data.images;
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar as imagens. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const result: UploadResponse = await response.json();
      
      if (!result.success || !result.data.imageUrl) {
        throw new Error(result.message || 'Upload failed');
      }

      toast({
        title: "✅ Avatar atualizado!",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });

      return result.data.imageUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível atualizar sua foto de perfil. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Fallback method for base64 uploads (backward compatibility)
  const uploadBase64Images = async (base64Images: string[]): Promise<string[]> => {
    if (base64Images.length === 0) return [];
    
    setIsUploading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/upload/base64/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: base64Images,
          type: 'prayer-requests'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const result: UploadResponse = await response.json();
      
      if (!result.success || !result.data.images) {
        throw new Error(result.message || 'Upload failed');
      }

      return result.data.images;
    } catch (error) {
      console.error('Error uploading base64 images:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar as imagens. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadBase64Avatar = async (base64Image: string): Promise<string> => {
    setIsUploading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/upload/base64/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const result: UploadResponse = await response.json();
      
      if (!result.success || !result.data.imageUrl) {
        throw new Error(result.message || 'Upload failed');
      }

      return result.data.imageUrl;
    } catch (error) {
      console.error('Error uploading base64 avatar:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível atualizar sua foto de perfil. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImages,
    uploadAvatar,
    uploadBase64Images,
    uploadBase64Avatar,
    isUploading,
  };
};
