// (NUEVO ARCHIVO) src/pages/OdontogramEditorPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Odontogram, ToothState } from '@/state/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
// Importaciones de Firebase
import { doc, onSnapshot, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
// Importaciones de UI
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Definiciones de Dientes ---
const ADULTO_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const ADULTO_UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const ADULTO_LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];
const ADULTO_LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const NINO_UPPER_RIGHT = [55, 54, 53, 52, 51];
const NINO_UPPER_LEFT = [61, 62, 63, 64, 65];
const NINO_LOWER_LEFT = [71, 72, 73, 74, 75];
const NINO_LOWER_RIGHT = [85, 84, 83, 82, 81];

// --- Definiciones de Afecciones ---
export const AFECCIONES_LISTA = [
  { code: '0', label: 'Sano' },
  { code: '1', label: 'Con Caries' },
  { code: '2', label: 'Obturado con caries' },
  { code: '3', label: 'Obturado sin caries' },
  { code: '4', label: 'Perdido por caries' },
  { code: '5', label: 'Perdido por otro motivo' },
  { code: '6', label: 'Fisura obturada' },
  { code: '7', label: 'Soporte de puente, corona, etc.' },
  { code: '8', label: 'Diente sin erupcionar' },
  { code: 'T', label: 'Traumatismo' },
  { code: '9', label: 'No registrado' },
  { code: '11', label: 'Recesión gingival' },
  { code: '12', label: 'Tratamiento de conductos' },
  { code: '13', label: 'Instrumento separado en conducto' },
  { code: '14', label: 'Bolsas periodontales' },
  { code: '15', label: 'Fluorosis' },
  { code: '16', label: 'Alteraciones (forma, número, etc.)' },
  { code: '17', label: 'Lesión endoperiodontal' },
];

// Colores para los estados
const AFECCION_COLORES: Record<string, string> = {
  'default': 'bg-gray-200 hover:bg-gray-300 text-black',
  '0': 'bg-success/50 hover:bg-success/80 text-black',
  '1': 'bg-destructive hover:bg-destructive/80',
  '2': 'bg-destructive/70 hover:bg-destructive',
  '3': 'bg-primary hover:bg-primary/80',
  '4': 'bg-muted-foreground hover:bg-muted-foreground/80',
  '5': 'bg-muted-foreground hover:bg-muted-foreground/80',
  'T': 'bg-orange-400 hover:bg-orange-500',
  '12': 'bg-purple-400 hover:bg-purple-500',
};

const OdontogramEditorPage: React.FC = () => {
  const { id: patientId, odontogramaId } = useParams<{ id: string; odontogramaId: string }>();
  const navigate = useNavigate();

  const [odontogram, setOdontogram] = useState<Odontogram | null>(null);
  const [localDientes, setLocalDientes] = useState<Odontogram['dientes']>({});
  const [localNotas, setLocalNotas] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  // Cargar el odontograma específico
  useEffect(() => {
    if (!patientId || !odontogramaId) {
      toast.error("Faltan datos para cargar el odontograma.");
      navigate('/'); // Volver al inicio si faltan IDs
      return;
    }

    setIsLoading(true);
    const docRef = doc(db, 'pacientes', patientId, 'odontograma', odontogramaId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const odontoData = {
          id: docSnap.id,
          ...data,
          fecha: (data.fecha as Timestamp)?.toDate ? (data.fecha as Timestamp).toDate().toISOString() : new Date().toISOString(),
        } as Odontogram;
        
        setOdontogram(odontoData);
        setLocalDientes(odontoData.dientes || {});
        setLocalNotas(odontoData.notas || '');
      } else {
        toast.error("No se pudo encontrar el odontograma.");
        navigate(`/pacientes/${patientId}`); // Volver a la ficha
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [patientId, odontogramaId, navigate]);

  const getToothState = (toothNumber: number): ToothState => {
    return localDientes[toothNumber] || { estados: ['0'], superficies: {} };
  };

  // Lógica de Multi-selección
  const handleAfeccionChange = (afeccionCode: string, isChecked: boolean) => {
    if (selectedTooth === null) return; // No hay diente seleccionado

    const currentState = getToothState(selectedTooth);
    let newEstados = [...currentState.estados];

    if (isChecked) {
      if (!newEstados.includes(afeccionCode)) newEstados.push(afeccionCode);
      if (afeccionCode !== '0' && newEstados.includes('0')) newEstados = newEstados.filter(s => s !== '0');
      if (afeccionCode === '0') newEstados = ['0'];
    } else {
      newEstados = newEstados.filter(s => s !== afeccionCode);
      if (newEstados.length === 0) newEstados = ['0'];
    }

    setLocalDientes(prevDientes => ({
      ...prevDientes,
      [selectedTooth]: {
        ...currentState,
        estados: newEstados,
      }
    }));
  };

  // Guardar cambios
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!patientId || !odontogramaId) throw new Error("IDs no encontrados");
      const docRef = doc(db, 'pacientes', patientId, 'odontograma', odontogramaId);
      await updateDoc(docRef, {
        dientes: localDientes,
        notas: localNotas,
      });
      toast.success("Odontograma actualizado");
      navigate(`/pacientes/${patientId}`); // Volver a la ficha
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  // Componente de Diente
  const Tooth: React.FC<{ number: number }> = ({ number }) => {
    const state = getToothState(number);
    const primaryState = state.estados[0] || '0';
    const colorClass = AFECCION_COLORES[primaryState] || AFECCION_COLORES['default'];
    const isSelected = selectedTooth === number;

    return (
      <button
        onClick={() => setSelectedTooth(number)}
        className={cn(
          'relative h-16 w-12 rounded-lg border-2 border-border transition-all',
          'flex flex-col items-center justify-center',
          'focus:outline-none',
          colorClass,
          isSelected && 'ring-4 ring-primary ring-offset-2' // Resaltado si está seleccionado
        )}
        aria-label={`Diente ${number}, estados: ${state.estados.join(', ')}`}
      >
        <span className="text-sm font-bold text-foreground">{number}</span>
        <span className="text-lg font-bold text-foreground/80 px-1 truncate">
          {state.estados.join(', ')}
        </span>
      </button>
    );
  };

  // Componente de Grid (para Adulto o Niño)
  const OdontogramGrid: React.FC<{ tipo: 'adulto' | 'niño' }> = ({ tipo }) => {
    const isAdulto = tipo === 'adulto';
    return (
      <div className="space-y-4">
        {/* Upper jaw */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3 text-center">Maxilar Superior</p>
          <div className="flex justify-center gap-6">
            <div className="flex gap-1">
              {(isAdulto ? ADULTO_UPPER_RIGHT : NINO_UPPER_RIGHT).map((tooth) => (
                <Tooth key={tooth} number={tooth} />
              ))}
            </div>
            <div className="w-px bg-border" />
            <div className="flex gap-1">
              {(isAdulto ? ADULTO_UPPER_LEFT : NINO_UPPER_LEFT).map((tooth) => (
                <Tooth key={tooth} number={tooth} />
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-border" />
        {/* Lower jaw */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3 text-center">Maxilar Inferior</p>
          <div className="flex justify-center gap-6">
            <div className="flex gap-1">
              {(isAdulto ? ADULTO_LOWER_RIGHT : NINO_LOWER_RIGHT).map((tooth) => (
                <Tooth key={tooth} number={tooth} />
              ))}
            </div>
            <div className="w-px bg-border" />
            <div className="flex gap-1">
              {(isAdulto ? ADULTO_LOWER_LEFT : NINO_LOWER_LEFT).map((tooth) => (
                <Tooth key={tooth} number={tooth} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Estado del diente seleccionado para mostrar en el panel derecho
  const selectedToothState = useMemo(() => {
    if (selectedTooth === null) return null;
    return getToothState(selectedTooth);
  }, [selectedTooth, localDientes]);

  if (isLoading || !odontogram) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-[600px] col-span-2" />
          <Skeleton className="h-[600px] col-span-1" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-4"
    >
      {/* --- Cabecera con botones --- */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(`/pacientes/${patientId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Ficha de Paciente
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Editor de Odontograma</h1>
          <p className="text-muted-foreground">
            {odontogram.tipo === 'adulto' ? 'Adulto' : 'Niño'} - {formatDate(odontogram.fecha)}
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      {/* --- Contenido de 2 Columnas --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- Columna Izquierda: Odontograma --- */}
        <div className="lg:col-span-2">
          <Card className="sticky top-20"> {/* Se queda fijo al hacer scroll */}
            <CardContent className="p-4">
              <OdontogramGrid tipo={odontogram.tipo} />
            </CardContent>
          </Card>
        </div>

        {/* --- Columna Derecha: Panel de Afecciones y Notas --- */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-20"> {/* Se queda fijo al hacer scroll */}
            <CardHeader>
              <CardTitle>
                {selectedTooth ? `Afecciones Diente ${selectedTooth}` : "Selecciona un diente"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTooth === null ? (
                <p className="text-muted-foreground text-center py-10">
                  Haz clic en un diente para ver/editar sus afecciones.
                </p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="grid gap-3 p-1">
                    {AFECCIONES_LISTA.map((afeccion) => (
                      <Label key={afeccion.code} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                        <Checkbox
                          checked={selectedToothState?.estados.includes(afeccion.code)}
                          onCheckedChange={(checked) => handleAfeccionChange(afeccion.code, !!checked)}
                        />
                        <span className="font-medium">[{afeccion.code}]</span> {afeccion.label}
                      </Label>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas Generales</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Observaciones generales de este odontograma..."
                rows={8}
                value={localNotas}
                onChange={(e) => setLocalNotas(e.target.value)}
                disabled={isSaving}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default OdontogramEditorPage;