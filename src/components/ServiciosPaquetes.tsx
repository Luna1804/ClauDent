// (NUEVO ARCHIVO) src/components/ServiciosPaquetes.tsx
import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { useApp, Paquete, Service } from '@/state/AppContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

// Tipo para el formulario de Paquete
type FormDataPaquete = Omit<Paquete, 'id' | 'serviciosIncluidos'> & {
  serviciosIncluidos: Service[]; // Usamos el objeto Service completo para el formulario
};

const ServiciosPaquetes: React.FC = () => {
  const { 
    services, // Lista de servicios individuales para elegir
    paquetes, 
    paquetesLoading, 
    addPaquete, 
    updatePaquete, 
    deletePaquete 
  } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPaquete, setEditingPaquete] = useState<Paquete | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormDataPaquete>({
    nombre: '',
    precioTotal: 0,
    fechaInicio: '',
    fechaFin: '',
    serviciosIncluidos: [],
    estado: 'activo',
  });

  const filteredPaquetes = useMemo(() => {
    return paquetes.filter((paquete) =>
      paquete.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [paquetes, searchQuery]);

  const handleOpenDialog = (paquete?: Paquete) => {
    if (paquete) {
      // Mapear los IDs guardados al objeto Service completo
      const serviciosCompletos = paquete.serviciosIncluidos
        .map(sIncluido => services.find(s => s.id === sIncluido.servicioId))
        .filter(Boolean) as Service[];

      setFormData({
        nombre: paquete.nombre,
        precioTotal: paquete.precioTotal,
        fechaInicio: paquete.fechaInicio,
        fechaFin: paquete.fechaFin,
        serviciosIncluidos: serviciosCompletos,
        estado: paquete.estado,
      });
      setEditingPaquete(paquete);
    } else {
      setFormData({
        nombre: '',
        precioTotal: 0,
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: new Date().toISOString().split('T')[0],
        serviciosIncluidos: [],
        estado: 'activo',
      });
      setEditingPaquete(null);
    }
    setIsDialogOpen(true);
  };
  
  // Lógica para añadir/quitar servicios del paquete en el formulario
  const toggleServicioEnPaquete = (servicio: Service, isChecked: boolean) => {
    setFormData(prev => {
      const yaExiste = prev.serviciosIncluidos.some(s => s.id === servicio.id);
      let nuevosServicios: Service[] = [];
      if (isChecked) {
        if (!yaExiste) {
          nuevosServicios = [...prev.serviciosIncluidos, servicio];
        } else {
          nuevosServicios = prev.serviciosIncluidos;
        }
      } else {
        nuevosServicios = prev.serviciosIncluidos.filter(s => s.id !== servicio.id);
      }
      return { ...prev, serviciosIncluidos: nuevosServicios };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.fechaInicio || !formData.fechaFin) {
      return toast.error("Nombre y fechas son obligatorios.");
    }
    if (formData.serviciosIncluidos.length === 0) {
      return toast.error("Debe incluir al menos un servicio.");
    }

    setIsFormLoading(true);

    // Mapear los objetos Service de vuelta a la estructura de IDs
    const paqueteParaGuardar: Omit<Paquete, 'id'> = {
      ...formData,
      serviciosIncluidos: formData.serviciosIncluidos.map(s => ({
        servicioId: s.id,
        nombre: s.nombre,
        precioOriginal: s.precio,
      })),
    };

    try {
      if (editingPaquete) {
        await updatePaquete(editingPaquete.id, paqueteParaGuardar);
        toast.success('Paquete actualizado');
      } else {
        await addPaquete(paqueteParaGuardar);
        toast.success('Paquete creado');
      }
      setIsDialogOpen(false);
      setEditingPaquete(null);
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar el paquete');
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este paquete?')) {
      try {
        await deletePaquete(id);
        toast.success('Paquete eliminado');
      } catch (error) {
        console.error(error);
        toast.error('Error al eliminar el paquete');
      }
    }
  };

  const TableLoadingSkeleton = () => (
    Array(3).fill(0).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
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
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar paquetes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Paquete
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Paquete</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Validez</TableHead>
                  <TableHead>Servicios</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paquetesLoading ? (
                  <TableLoadingSkeleton />
                ) : filteredPaquetes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        No se encontraron paquetes.
                      </TableCell>
                    </TableRow>
                ) : (
                  filteredPaquetes.map((paquete) => (
                    <TableRow key={paquete.id}>
                      <TableCell className="font-medium">{paquete.nombre}</TableCell>
                      <TableCell>{formatCurrency(paquete.precioTotal)}</TableCell>
                      <TableCell>{formatDate(paquete.fechaInicio)} - {formatDate(paquete.fechaFin)}</TableCell>
                      <TableCell>{paquete.serviciosIncluidos.length}</TableCell>
                      <TableCell>
                        <Badge variant={paquete.estado === 'activo' ? 'default' : 'secondary'}>
                          {paquete.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(paquete)}
                            aria-label="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(paquete.id)}
                            aria-label="Eliminar"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingPaquete ? 'Editar Paquete' : 'Nuevo Paquete'}</DialogTitle>
            <DialogDescription>
              {editingPaquete ? 'Modifica los datos del paquete' : 'Crea un nuevo paquete promocional'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset disabled={isFormLoading} className="grid grid-cols-2 gap-6">
              {/* Columna Izquierda: Detalles del Paquete */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paquete-nombre">Nombre del Paquete *</Label>
                  <Input
                    id="paquete-nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paquete-precio">Precio Total (CLP) *</Label>
                  <Input
                    id="paquete-precio"
                    type="number"
                    min="0"
                    value={formData.precioTotal}
                    onChange={(e) => setFormData({ ...formData, precioTotal: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paquete-inicio">Fecha Inicio *</Label>
                    <Input
                      id="paquete-inicio"
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paquete-fin">Fecha Fin *</Label>
                    <Input
                      id="paquete-fin"
                      type="date"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paquete-estado">Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(v) => setFormData({ ...formData, estado: v as any })}
                  >
                    <SelectTrigger id="paquete-estado">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Columna Derecha: Selección de Servicios */}
              <div className="space-y-4">
                <Label>Servicios Incluidos *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {formData.serviciosIncluidos.length > 0
                        ? `${formData.serviciosIncluidos.length} servicios seleccionados`
                        : "Seleccionar servicios..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <ScrollArea className="h-64">
                      <div className="p-4 space-y-2">
                        {services.map(service => (
                          <Label key={service.id} className="flex items-center gap-2 font-normal">
                            <Checkbox
                              checked={formData.serviciosIncluidos.some(s => s.id === service.id)}
                              onCheckedChange={(checked) => toggleServicioEnPaquete(service, !!checked)}
                            />
                            {service.nombre} ({formatCurrency(service.precio)})
                          </Label>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
                
                {/* Lista de servicios seleccionados */}
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    {formData.serviciosIncluidos.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center">No hay servicios seleccionados</p>
                    ) : (
                      <ScrollArea className="h-32">
                        <div className="space-y-2">
                          {formData.serviciosIncluidos.map(service => (
                            <div key={service.id} className="flex items-center justify-between text-sm p-2 bg-background rounded">
                              <span>{service.nombre}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => toggleServicioEnPaquete(service, false)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </div>
            </fieldset>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isFormLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isFormLoading}>
                {isFormLoading
                  ? 'Guardando...'
                  : editingPaquete
                  ? 'Guardar Cambios'
                  : 'Crear Paquete'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiciosPaquetes;