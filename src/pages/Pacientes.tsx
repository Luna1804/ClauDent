// RF02-RF05: Patients list with CRUD operations (Conectado a Firebase)
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/state/AppContext';
import { calculateAge } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner'; // ¡Importamos toast!
import { Skeleton } from '@/components/ui/skeleton'; // ¡Importamos Skeleton!

const Pacientes: React.FC = () => {
  // Obtenemos los datos y funciones de AppContext
  // ¡NUEVO! Obtenemos patientsLoading
  const { patients, addPatient, updatePatient, deletePatient, searchQuery, setSearchQuery, patientsLoading } = useApp();
  
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [filterStatus, setFilterStatus] = useState<'all' | 'activo' | 'inactivo'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<string | null>(null);
  
  // ¡NUEVO! Estado de carga para los formularios
  const [isFormLoading, setIsFormLoading] = useState(false); 

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    rut: '',
    fechaNacimiento: '',
    telefono: '',
    email: '',
    direccion: '',
    estado: 'activo' as 'activo' | 'inactivo',
  });

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch =
        patient.nombre.toLowerCase().includes(localSearch.toLowerCase()) ||
        patient.apellido.toLowerCase().includes(localSearch.toLowerCase()) ||
        (patient.rut && patient.rut.includes(localSearch)); // Añadimos chequeo por si rut es undefined
      const matchesStatus = filterStatus === 'all' || patient.estado === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [patients, localSearch, filterStatus]);

  const handleOpenDialog = (patientId?: string) => {
    if (patientId) {
      const patient = patients.find((p) => p.id === patientId);
      if (patient) {
        setFormData({
          nombre: patient.nombre,
          apellido: patient.apellido,
          rut: patient.rut,
          fechaNacimiento: patient.fechaNacimiento,
          telefono: patient.telefono,
          email: patient.email,
          direccion: patient.direccion,
          estado: patient.estado,
        });
        setEditingPatient(patientId);
      }
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        rut: '',
        fechaNacimiento: '',
        telefono: '',
        email: '',
        direccion: '',
        estado: 'activo',
      });
      setEditingPatient(null);
    }
    setIsDialogOpen(true);
  };

  // ¡MODIFICADO! Ahora es async y usa try/catch
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormLoading(true);
    
    try {
      if (editingPatient) {
        await updatePatient(editingPatient, formData);
        toast.success('Paciente actualizado correctamente');
      } else {
        await addPatient(formData);
        toast.success('Paciente creado correctamente');
      }
      setIsDialogOpen(false);
      setEditingPatient(null);
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar el paciente');
    } finally {
      setIsFormLoading(false);
    }
  };

  // ¡MODIFICADO! Ahora es async y usa try/catch
  const handleDelete = async (id: string) => {
    // Usamos el diálogo de alerta en lugar de confirm (mejora para el futuro)
    if (confirm('¿Está seguro de eliminar este paciente?')) {
      setIsFormLoading(true); // Re-usamos el loading state
      try {
        await deletePatient(id);
        toast.success('Paciente eliminado correctamente');
      } catch (error) {
        console.error(error);
        toast.error('Error al eliminar el paciente');
      } finally {
        setIsFormLoading(false);
      }
    }
  };

  // ¡NUEVO! Componente para mostrar esqueletos de carga
  const TableLoadingSkeleton = () => (
    Array(3).fill(0).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
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
          <h1 className="text-3xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground">Gestiona los pacientes del consultorio</p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre, apellido o RUT..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="activo">Activos</SelectItem>
              <SelectItem value="inactivo">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* ¡MODIFICADO! Mostrar esqueletos o datos */}
                {patientsLoading ? (
                  <TableLoadingSkeleton />
                ) : filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No se encontraron pacientes.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">
                        {patient.nombre} {patient.apellido}
                      </TableCell>
                      <TableCell>{patient.rut}</TableCell>
                      <TableCell>{calculateAge(patient.fechaNacimiento)} años</TableCell>
                      <TableCell>{patient.telefono}</TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>
                        <Badge variant={patient.estado === 'activo' ? 'default' : 'secondary'}>
                          {patient.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/pacientes/${patient.id}`}>
                            <Button variant="ghost" size="icon" aria-label="Ver ficha">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(patient.id)}
                            aria-label="Editar"
                            disabled={isFormLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(patient.id)}
                            aria-label="Eliminar"
                            disabled={isFormLoading}
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

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}</DialogTitle>
            <DialogDescription>
              {editingPatient ? 'Modifica los datos del paciente' : 'Ingresa los datos del nuevo paciente'}
            </DialogDescription>
          </DialogHeader>
          {/* ¡MODIFICADO! Formulario ahora usa handleSubmit */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset disabled={isFormLoading} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT *</Label>
                  <Input
                    id="rut"
                    value={formData.rut}
                    onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(v) => setFormData({ ...formData, estado: v as any })}
                >
                  <SelectTrigger id="estado">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
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
                  : editingPatient
                  ? 'Guardar Cambios'
                  : 'Crear Paciente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pacientes;