// (Archivo MODIFICADO) src/components/PatientAntecedentes.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// ¡CORREGIDO! Importamos initialState desde AppContext
import { useApp, IHistoriaClinicaCompleta, initialState } from '@/state/AppContext';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit } from 'lucide-react';

// Importamos el modal que vamos a re-utilizar
import InitialHistoryModal from '@/components/InitialHistoryModal';

// (Componente DataViewer - sin cambios)
const DataViewer: React.FC<{ data: Record<string, any>, title: string }> = ({ data, title }) => {
  const entries = Object.entries(data).filter(([_, value]) => value && value !== '');

  if (entries.length === 0) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">{title}: No hay datos registrados.</p>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
          <span className="text-sm font-semibold">
            {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value.toString()}
          </span>
        </div>
      ))}
    </div>
  );
};

const PatientAntecedentes: React.FC = () => {
  const { id: patientId } = useParams<{ id: string }>();
  // ¡CORREGIDO! Usamos el 'initialState' importado
  const [historyData, setHistoryData] = useState<IHistoriaClinicaCompleta | null>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!patientId) return;

    const fetchHistoryData = async () => {
      setIsLoading(true);
      try {
        const historyRef = collection(db, 'pacientes', patientId, 'historia_clinica');
        const querySnapshot = await getDocs(historyRef);
        
        let fullData: IHistoriaClinicaCompleta = { ...initialState };
        
        if (querySnapshot.empty) {
          console.log("No hay historia clínica inicial para este paciente.");
          // Se quedará con 'initialState' (vacío)
        } else {
          querySnapshot.forEach((doc) => {
            // Asignamos cada documento (ej. 'datos_generales') a su llave
            // @ts-ignore
            fullData[doc.id as keyof IHistoriaClinicaCompleta] = doc.data();
          });
        }
        setHistoryData(fullData);
      } catch (error) {
        console.error("Error al cargar antecedentes: ", error);
        toast.error("Error al cargar los antecedentes del paciente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoryData();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  if (!historyData) {
     return <p>No se pudieron cargar los datos.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Antecedentes y Ficha Clínica</h3>
        <Button onClick={() => setIsModalOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar Antecedentes
        </Button>
      </div>

      {/* ¡CORREGIDO! 'collapsible' eliminado */}
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>1. Datos Generales (Historia Clínica)</AccordionTrigger>
          <AccordionContent>
            <DataViewer data={historyData.historiaGeneral} title="Datos Generales" />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>2. Antecedentes Hereditarios</AccordionTrigger>
          <AccordionContent>
            <DataViewer data={historyData.antecedentesHereditarios} title="Antecedentes Hereditarios" />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>3. Antecedentes Personales Patológicos</AccordionTrigger>
          <AccordionContent>
            <DataViewer data={historyData.appPatologicos} title="Antecedentes Patológicos" />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>4. Antecedentes Personales No Patológicos</AccordionTrigger>
          <AccordionContent>
            <DataViewer data={historyData.apnp} title="Antecedentes No Patológicos" />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5">
          <AccordionTrigger>5. Antecedentes Alérgicos</AccordionTrigger>
          <AccordionContent>
            <DataViewer data={historyData.alergias} title="Antecedentes Alérgicos" />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-6">
          <AccordionTrigger>6. Hospitalizaciones</AccordionTrigger>
          <AccordionContent>
            <DataViewer data={historyData.hospitalizaciones} title="Hospitalizaciones" />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-7">
          <AccordionTrigger>7. Signos Vitales</AccordionTrigger>
          <AccordionContent>
            <DataViewer data={historyData.signosVitales} title="Signos Vitales" />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-8">
          <AccordionTrigger>8. Exploración de Cabeza y Cuello</AccordionTrigger>
          <AccordionContent>
            <DataViewer data={historyData.exploracionCabezaCuello} title="Exploración Cabeza y Cuello" />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-9">
          <AccordionTrigger>9. Exploración de ATM</AccordionTrigger>
          <AccordionContent>
            <DataViewer data={historyData.exploracionAtm} title="Exploración ATM" />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-10">
          <AccordionTrigger>10. Exploración de Cavidad Oral</AccordionTrigger>
          <AccordionContent>
            <DataViewer data={historyData.cavidadOral} title="Exploración Cavidad Oral" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* El Modal para Editar */}
      {patientId && (
        <InitialHistoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          patientId={patientId}
          // ¡NUEVO! Pasamos los datos cargados para rellenar el formulario
          initialData={historyData} 
        />
      )}
    </div>
  );
};

export default PatientAntecedentes;