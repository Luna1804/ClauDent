// RF09: Quotations with PDF export simulation
import React, { useState } from 'react';
import { Plus, Download, Eye, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/state/AppContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Cotizaciones: React.FC = () => {
  const { quotations, patients, services, addQuotation } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    pacienteId: '',
    fecha: new Date().toISOString().split('T')[0],
    items: [] as { servicioId: string; cantidad: number; precioUnitario: number }[],
    descuento: 0,
    estado: 'borrador' as 'borrador' | 'enviada' | 'aceptada' | 'rechazada',
  });

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { servicioId: '', cantidad: 1, precioUnitario: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill precio when service is selected
    if (field === 'servicioId') {
      const service = services.find((s) => s.id === value);
      if (service) {
        newItems[index].precioUnitario = service.precio;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const descuentoAmount = (subtotal * formData.descuento) / 100;
    return subtotal - descuentoAmount;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pacienteId || formData.items.length === 0) {
      toast.error('Debe seleccionar un paciente y agregar al menos un servicio');
      return;
    }
    addQuotation({
      pacienteId: formData.pacienteId,
      fecha: formData.fecha,
      items: formData.items,
      descuento: formData.descuento,
      total: calculateTotal(),
      estado: formData.estado,
    });
    setFormData({
      pacienteId: '',
      fecha: new Date().toISOString().split('T')[0],
      items: [],
      descuento: 0,
      estado: 'borrador',
    });
    setIsDialogOpen(false);
    toast.success('Cotización creada correctamente');
  };

  const handleExportPDF = (quotationId: string) => {
    // Simulated PDF export
    toast.success('PDF generado (simulado)');
    // In real app: generate blob and trigger download
    const blob = new Blob(['Cotización simulada'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cotizacion-${quotationId}.pdf`;
    a.click();
  };

  const estadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'aceptada':
        return 'default';
      case 'rechazada':
        return 'destructive';
      case 'enviada':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cotizaciones</h1>
          <p className="text-muted-foreground">Gestiona las cotizaciones de tratamientos</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nueva Cotización
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(['borrador', 'enviada', 'aceptada', 'rechazada'] as const).map((estado) => {
          const count = quotations.filter((q) => q.estado === estado).length;
          return (
            <Card key={estado}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                  {estado}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Servicios</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No hay cotizaciones. Crea la primera.
                    </TableCell>
                  </TableRow>
                ) : (
                  quotations.map((quotation) => {
                    const patient = patients.find((p) => p.id === quotation.pacienteId);
                    return (
                      <TableRow key={quotation.id}>
                        <TableCell className="font-mono text-sm">#{quotation.id}</TableCell>
                        <TableCell>
                          {patient ? `${patient.nombre} ${patient.apellido}` : 'N/A'}
                        </TableCell>
                        <TableCell>{formatDate(quotation.fecha)}</TableCell>
                        <TableCell>{quotation.items.length} servicio(s)</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(quotation.total)}</TableCell>
                        <TableCell>
                          <Badge variant={estadoBadgeVariant(quotation.estado)}>
                            {quotation.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" aria-label="Ver detalles">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleExportPDF(quotation.id)}
                              aria-label="Exportar PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Cotización</DialogTitle>
            <DialogDescription>Construye una cotización seleccionando servicios</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pacienteId">Paciente *</Label>
                <Select value={formData.pacienteId} onValueChange={(v) => setFormData({ ...formData, pacienteId: v })}>
                  <SelectTrigger id="pacienteId">
                    <SelectValue placeholder="Seleccionar paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.nombre} {patient.apellido} - {patient.rut}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Servicios</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Select
                    value={item.servicioId}
                    onValueChange={(v) => handleItemChange(index, 'servicioId', v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value))}
                    className="w-24"
                    placeholder="Cant."
                  />
                  <Input
                    type="number"
                    min="0"
                    value={item.precioUnitario}
                    onChange={(e) => handleItemChange(index, 'precioUnitario', parseFloat(e.target.value))}
                    className="w-32"
                    placeholder="Precio"
                  />
                  <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveItem(index)}>
                    ×
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="descuento">Descuento (%)</Label>
                <Input
                  id="descuento"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.descuento}
                  onChange={(e) => setFormData({ ...formData, descuento: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(v) => setFormData({ ...formData, estado: v as any })}>
                  <SelectTrigger id="estado">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrador">Borrador</SelectItem>
                    <SelectItem value="enviada">Enviada</SelectItem>
                    <SelectItem value="aceptada">Aceptada</SelectItem>
                    <SelectItem value="rechazada">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-muted rounded-2xl">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              {formData.descuento > 0 && (
                <div className="flex justify-between text-sm text-destructive">
                  <span>Descuento ({formData.descuento}%):</span>
                  <span>-{formatCurrency((calculateSubtotal() * formData.descuento) / 100)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Crear Cotización</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cotizaciones;
