import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Tag, AlertCircle } from "lucide-react";
import { useCategories, useUpdatePrayerRequest } from "@/hooks/useApi";

interface EditPrayerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerRequest: {
    id: string;
    title: string;
    content: string;
    urgent: boolean;
    privacy: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
    status: 'ACTIVE' | 'ANSWERED' | 'ARCHIVED';
    categoryId: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

const privacyOptions = [
  { value: "PUBLIC", label: "Público", description: "Todos podem ver" },
  { value: "FRIENDS", label: "Amigos", description: "Apenas amigos" },
  { value: "PRIVATE", label: "Privado", description: "Apenas você" }
];

const statusOptions = [
  { value: "ACTIVE", label: "Ativo", description: "Pedido em andamento" },
  { value: "ANSWERED", label: "Respondido", description: "Oração atendida" },
  { value: "ARCHIVED", label: "Arquivado", description: "Pedido arquivado" }
];

export function EditPrayerRequestModal({ isOpen, onClose, prayerRequest }: EditPrayerRequestModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE' | 'FRIENDS'>('PUBLIC');
  const [status, setStatus] = useState<'ACTIVE' | 'ANSWERED' | 'ARCHIVED'>('ACTIVE');
  const [categoryId, setCategoryId] = useState("");

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const updatePrayerRequestMutation = useUpdatePrayerRequest();

  const categories = categoriesData?.data || [];

  // Initialize form with prayer request data
  useEffect(() => {
    if (prayerRequest) {
      setTitle(prayerRequest.title);
      setContent(prayerRequest.content);
      setUrgent(prayerRequest.urgent);
      setPrivacy(prayerRequest.privacy);
      setStatus(prayerRequest.status);
      setCategoryId(prayerRequest.categoryId);
    }
  }, [prayerRequest]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !categoryId) return;

    const updateData = {
      title: title.trim(),
      content: content.trim(),
      urgent,
      privacy,
      status,
      categoryId,
    };

    updatePrayerRequestMutation.mutate(
      { id: prayerRequest.id, data: updateData },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && categoryId && !updatePrayerRequestMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-4 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Editar Pedido de Oração</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Título
            </Label>
            <Textarea
              id="title"
              placeholder="Digite um título para seu pedido..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-h-16 resize-none mt-1"
              maxLength={200}
              rows={2}
            />
            <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
              <span>Um título claro ajuda outros a entenderem seu pedido</span>
              <span>{title.length}/200</span>
            </div>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content" className="text-sm font-medium">
              Descrição
            </Label>
            <Textarea
              id="content"
              placeholder="Compartilhe aqui seu pedido de oração..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32 resize-none mt-1"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
              <span>Descreva seu pedido com detalhes</span>
              <span>{content.length}/1000</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categoria
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Privacy */}
          <div>
            <Label className="text-sm font-medium">Privacidade</Label>
            <Select value={privacy} onValueChange={(value: any) => setPrivacy(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {privacyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <Label className="text-sm font-medium">Status</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Urgent */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-prayer-urgent" />
              <Label htmlFor="urgent" className="text-sm font-medium">
                Marcar como urgente
              </Label>
            </div>
            <Switch
              id="urgent"
              checked={urgent}
              onCheckedChange={setUrgent}
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={updatePrayerRequestMutation.isPending}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full sm:w-auto bg-gradient-heaven hover:opacity-90"
          >
            {updatePrayerRequestMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
