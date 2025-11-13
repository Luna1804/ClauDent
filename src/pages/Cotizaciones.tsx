// RF09: Quotations (Conectado a Firebase y PDF real)
import React, { useState } from 'react';
import { Plus, Download, Eye, FileText, Book, ClipboardPlus } from 'lucide-react';
import { useApp, QuotationItem } from '@/state/AppContext';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { generateQuotationPDF } from '@/lib/pdfGenerator'; 

const Cotizaciones: React.FC = () => {
  const { quotations, quotationsLoading, patients, services, addQuotation } = useApp();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    pacienteId: '',
    fecha: new Date().toISOString().split('T')[0],
    items: [] as QuotationItem[],
    descuento: 0,
    estado: 'borrador' as 'borrador' | 'enviada' | 'aceptada' | 'rechazada',
    notas: '',
  });

  const handleAddCatalogoItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { servicioId: '', nombre: 'Seleccionar...', cantidad: 1, precioUnitario: 0 }
      ],
    });
  };

  const handleAddPersonalizadoItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { servicioId: null, nombre: '', cantidad: 1, precioUnitario: 0 }
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items] as QuotationItem[];
    
    if (field === 'servicioId') {
      const service = services.find((s) => s.id === value);
      if (service) {
        newItems[index].servicioId = service.id;
        newItems[index].nombre = service.nombre;
        newItems[index].precioUnitario = service.precio;
      }
    } else {
      // @ts-ignore
      newItems[index][field] = value;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.cantidad || 0) * (item.precioUnitario || 0), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const descuentoAmount = (subtotal * (formData.descuento || 0)) / 100;
    return subtotal - descuentoAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pacienteId || formData.items.length === 0) {
      toast.error('Debe seleccionar un paciente y agregar al menos un servicio');
      return;
    }
    for (const item of formData.items) {
      if (item.servicioId === null && (!item.nombre || item.precioUnitario <= 0)) {
        toast.error('Los servicios personalizados deben tener nombre y precio.');
        return;
      }
    }
    
    setIsFormLoading(true);
    try {
      await addQuotation({
        pacienteId: formData.pacienteId,
        fecha: formData.fecha,
        items: formData.items,
        descuento: formData.descuento,
        total: calculateTotal(),
        estado: formData.estado,
        notas: formData.notas,
      });

      setFormData({
        pacienteId: '',
        fecha: new Date().toISOString().split('T')[0],
        items: [],
        descuento: 0,
        estado: 'borrador',
        notas: '',
      });
      setIsDialogOpen(false);
      toast.success('Cotización creada correctamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al crear la cotización');
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleExportPDF = (quotationId: string) => {
    const quotation = quotations.find(q => q.id === quotationId);
    if (!quotation) {
      toast.error("No se encontró la cotización.");
      return;
    }
    const patient = patients.find(p => p.id === quotation.pacienteId);
    try {
      generateQuotationPDF(quotation, patient);
    } catch (error) {
      console.error("Error al generar PDF: ", error);
      toast.error("Error al generar el PDF");
    }
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

  const TableLoadingSkeleton = () => (
    Array(3).fill(0).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </TableCell>
      </TableRow>
    ))
  );

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
                <div className="text-2xl font-bold">{quotationsLoading ? <Skeleton className="h-6 w-12"/> : count}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
                {quotationsLoading ? (
                  <TableLoadingSkeleton />
                ) : quotations.length === 0 ? (
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
                        <TableCell className="font-mono text-sm">#{quotation.id.substring(0, 6)}...</TableCell>
                        <TableCell>
                          {patient ? `${patient.nombres} ${patient.apellidos}` : 'Paciente eliminado'}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Cotización</DialogTitle>
            <DialogDescription>Construye una cotización seleccionando servicios</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset disabled={isFormLoading} className="space-y-4">
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
                          {patient.nombres} {patient.apellidos} - {patient.curp || 'N/A'}
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
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleAddCatalogoItem}>
                      <Book className="h-4 w-4 mr-1" />
                      Agregar de Catálogo
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddPersonalizadoItem}>
                      <ClipboardPlus className="h-4 w-4 mr-1" />
                      Agregar Personalizado
                    </Button>
                  </div>
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    {item.servicioId !== null ? (
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
                    ) : (
                      <>
                        <Input
                          type="text"
                          value={item.nombre}
                          onChange={(e) => handleItemChange(index, 'nombre', e.target.value)}
                          placeholder="Nombre servicio personalizado"
                          className="flex-1"
                        />
                        {/* --- ¡CORREGIDO! --- */}
                        <Input
                          type="number"
                          min="0"
                          step="0.01" // <-- AÑADIDO
                          value={item.precioUnitario}
                          onChange={(e) => handleItemChange(index, 'precioUnitario', parseFloat(e.target.value) || 0)}
                          className="w-32"
                          placeholder="Precio"
                        />
                      </>
                    )}
                    {/* --- ¡CORREGIDO! --- */}
                    <Input
                      type="number"
                      min="0.01" // <-- MODIFICADO
                      step="0.01" // <-- AÑADIDO
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, 'cantidad', parseFloat(e.target.value) || 0)}
                      className="w-24"
                      placeholder="Cant."
                    />
                    <Button className="h-4 w-4"  type="button" variant="destructive" size="icon" onClick={() => handleRemoveItem(index)}>
                      X
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
                    onChange={(e) => setFormData({ ...formData, descuento: parseFloat(e.target.value) || 0 })}
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

              <div className="space-y-2">
                <Label htmlFor="notas">Notas Adicionales</Label>
                <Textarea
                  id="notas"
                  placeholder="Ej: Oferta válida por 15 días. No incluye radiografías."
                  rows={3}
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                />
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
            </fieldset>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isFormLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isFormLoading}>
                {isFormLoading ? 'Creando...' : 'Crear Cotización'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cotizaciones;