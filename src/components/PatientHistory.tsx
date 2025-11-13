// RF03: Patient clinical history
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface PatientHistoryProps {
  patientId: string;
}

const PatientHistory: React.FC<PatientHistoryProps> = ({ patientId }) => {
  const { patientData, services, addHistoryEntry } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    servicios: [] as { servicioId: string; cantidad: number }[],
    notas: '',
  });

  const historial = patientData[patientId]?.historial || [];

  const handleAddService = () => {
    setFormData({
      ...formData,
      servicios: [...formData.servicios, { servicioId: '', cantidad: 1 }],
    });
  };

  const handleRemoveService = (index: number) => {
    setFormData({
      ...formData,
      servicios: formData.servicios.filter((_, i) => i !== index),
    });
  };

  const handleServiceChange = (index: number, field: string, value: any) => {
    const newServicios = [...formData.servicios];
    newServicios[index] = { ...newServicios[index], [field]: value };
    setFormData({ ...formData, servicios: newServicios });
  };

  const calculateTotal = () => {
    return formData.servicios.reduce((total, item) => {
      const service = services.find((s) => s.id === item.servicioId);
      return total + (service?.precio || 0) * item.cantidad;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.servicios.length === 0) {
      toast.error('Debe agregar al menos un servicio');
      return;
    }
    addHistoryEntry(patientId, {
      fecha: formData.fecha,
      servicios: formData.servicios,
      notas: formData.notas,
      total: calculateTotal(),
    });
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      servicios: [],
      notas: '',
    });
    setIsDialogOpen(false);
    toast.success('Entrada agregada al historial');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Historial Clínico</h3>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Entrada
        </Button>
      </div>

      <div className="space-y-4">
        {historial.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No hay entradas en el historial. Agrega la primera entrada.
            </CardContent>
          </Card>
        ) : (
          historial.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <CardTitle className="text-base">{formatDate(entry.fecha)}</CardTitle>
                <CardDescription>Total: {formatCurrency(entry.total)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Servicios:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {entry.servicios.map((item, idx) => {
                      const service = services.find((s) => s.id === item.servicioId);
                      return (
                        <li key={idx} className="text-sm text-muted-foreground">
                          {service?.nombre} x{item.cantidad}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {entry.notas && (
                  <div>
                    <p className="text-sm font-medium mb-1">Notas:</p>
                    <p className="text-sm text-muted-foreground">{entry.notas}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Entrada en Historial</DialogTitle>
            <DialogDescription>Registra los servicios aplicados al paciente</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Servicios</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddService}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>
              {formData.servicios.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Select
                    value={item.servicioId}
                    onValueChange={(v) => handleServiceChange(index, 'servicioId', v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.nombre} - {formatCurrency(service.precio)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => handleServiceChange(index, 'cantidad', parseInt(e.target.value))}
                    className="w-24"
                    placeholder="Cant."
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveService(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                rows={4}
                placeholder="Observaciones, diagnóstico, tratamiento..."
              />
            </div>

            <div className="flex justify-between items-center p-4 bg-muted rounded-2xl">
              <span className="font-medium">Total:</span>
              <span className="text-xl font-bold">{formatCurrency(calculateTotal())}</span>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Entrada</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientHistory;
