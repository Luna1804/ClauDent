// Patient attachments management (simulated)
import React, { useState } from 'react';
import { Upload, Eye, Trash2, FileText, Image, File } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface PatientAttachmentsProps {
  patientId: string;
}

const PatientAttachments: React.FC<PatientAttachmentsProps> = ({ patientId }) => {
  const { patientData, addAttachment, deleteAttachment } = useApp();
  const attachments = patientData[patientId]?.adjuntos || [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulated upload
      addAttachment(patientId, {
        nombre: file.name,
        tipo: file.type,
        fecha: new Date().toISOString().split('T')[0],
        url: URL.createObjectURL(file), // Simulated URL
      });
      toast.success('Archivo agregado correctamente');
      e.target.value = '';
    }
  };

  const handleDelete = (attachmentId: string) => {
    if (confirm('¿Eliminar este archivo?')) {
      deleteAttachment(patientId, attachmentId);
      toast.success('Archivo eliminado');
    }
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith('image/')) return Image;
    if (tipo.includes('pdf')) return FileText;
    return File;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Archivos Adjuntos</h3>
        <div>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <Label htmlFor="file-upload">
            <Button asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Subir Archivo
              </span>
            </Button>
          </Label>
        </div>
      </div>

      {attachments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay archivos adjuntos. Sube el primer archivo.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attachments.map((attachment) => {
            const Icon = getFileIcon(attachment.tipo);
            return (
              <Card key={attachment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" title={attachment.nombre}>
                        {attachment.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(attachment.fecha)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(attachment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="bg-muted/50 rounded-2xl p-4 border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Nota:</strong> Esta es una simulación. Los archivos no se guardan en un servidor real.
        </p>
      </div>
    </div>
  );
};

export default PatientAttachments;
