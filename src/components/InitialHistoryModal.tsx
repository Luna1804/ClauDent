// (Archivo MODIFICADO) src/components/InitialHistoryModal.tsx
import React, { useState, useEffect } from 'react';
import { IHistoriaClinicaCompleta } from '@/state/AppContext';
import { useApp } from '@/state/AppContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';

// ¡NUEVO! Importamos todos los formularios
import FormHistoriaGeneral from './forms/FormHistoriaGeneral';
import FormAntecedentesHereditarios from './forms/FormAntecedentesHereditarios';
import FormAppPatologicos from './forms/FormAppPatologicos';
import FormApnp from './forms/FormApnp';
import FormAlergias from './forms/FormAlergias';
import FormHospitalizaciones from './forms/FormHospitalizaciones';
import FormSignosVitales from './forms/FormSignosVitales';
import FormExploracionCabezaCuello from './forms/FormExploracionCabezaCuello';
import FormExploracionAtm from './forms/FormExploracionAtm';
import FormCavidadOral from './forms/FormCavidadOral';

interface Props {
  isOpen: boolean;
  patientId: string | null;
  onClose: () => void;
}

// Estado inicial para todos los 10 formularios
const initialState: IHistoriaClinicaCompleta = {
  historiaGeneral: {
    ocupacion: '', escolaridad: '', estado_civil: '', telefono: '',
    fecha_ult_consulta_medica: '', motivo_ult_consulta_medica: '',
    fecha_ult_consulta_odontologica: '', motivo_ult_consulta_odontologica: ''
  },
  antecedentesHereditarios: {
    madre: '', padre: '', hermanos: '', hijos: '', esposo: '', tios: '', abuelos: ''
  },
  appPatologicos: {
    ets: false, degenerativas: false, neoplasicas: false, congenitas: false, otras: ''
  },
  apnp: {
    frecuencia_cepillado: '', auxiliares_higiene: false, auxiliares_cuales: '',
    come_entre_comidas: false, grupo_sanguineo: '', adic_tabaco: false, adic_alcohol: false
  },
  alergias: {
    antibioticos: false, analgesicos: false, anestesicos: false, alimentos: false, especificar: ''
  },
  hospitalizaciones: {
    ha_sido_hospitalizado: false, fecha: '', motivo: ''
  },
  signosVitales: {
    peso_kg: '', talla_m: '', frecuencia_cardiaca: '', tension_arterial_sistolica: '',
    tension_arterial_diastolica: '', frecuencia_respiratoria: '', temperatura_c: ''
  },
  exploracionCabezaCuello: {
    cabeza_exostosis: false, cabeza_endostosis: false, craneo_tipo: '', cara_asimetria_transversal: false,
    cara_asimetria_longitudinal: false, perfil: '', piel: '', musculos: '',
    cuello_cadena_ganglionar_palpable: false, otros: ''
  },
  exploracionAtm: {
    ruidos: false, lateralidad: '', apertura_mm: '', chasquidos: false, crepitacion: false,
    dificultad_abrir_boca: false, dolor_mov_lateralidad: false, fatiga_dolor_muscular: false,
    disminucion_apertura: false, desviacion_apertura_cierre: false
  },
  cavidadOral: {
    labio_estado: '', labio_nota: '', comisuras_estado: '', comisuras_nota: '',
    carrillos_estado: '', carrillos_nota: '', fondo_de_saco_estado: '', fondo_de_saco_nota: '',
    frenillos_estado: '', frenillos_nota: '', paladar_estado: '', paladar_nota: '',
    lengua_estado: '', lengua_nota: '', piso_boca_estado: '', piso_boca_nota: '',
    dientes_estado: '', dientes_nota: '', encia_estado: '', encia_nota: ''
  }
};

const InitialHistoryModal: React.FC<Props> = ({ isOpen, patientId, onClose }) => {
  const { addInitialHistoryForms } = useApp();
  const [formData, setFormData] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialState);
    }
  }, [isOpen]);

  const createFormUpdater = <K extends keyof IHistoriaClinicaCompleta>(formKey: K) => {
    return (updater: React.SetStateAction<IHistoriaClinicaCompleta[K]>) => {
      setFormData(prev => ({
        ...prev,
        [formKey]: typeof updater === 'function' ? updater(prev[formKey]) : updater,
      }));
    };
  };

  const handleSubmit = async () => {
    if (!patientId) {
      toast.error("Error: No se ha seleccionado un paciente.");
      return;
    }
    
    setIsSaving(true);
    try {
      await addInitialHistoryForms(patientId, formData);
      toast.success("Historia Clínica Inicial guardada con éxito");
      onClose();
    } catch (error) {
      console.error("Error al guardar la historia clínica: ", error);
      toast.error("Error al guardar la historia clínica");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Historia Clínica Inicial</DialogTitle>
          <DialogDescription>
            Rellena los formularios para la primera entrada de historial del paciente.
            (Todos los campos son opcionales).
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
          {/* ¡MODIFICADO! Acordeón rellenado con los 10 formularios */}
          <Accordion type="multiple" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>1. Datos Generales (Historia Clínica)</AccordionTrigger>
              <AccordionContent>
                <FormHistoriaGeneral
                  formData={formData.historiaGeneral}
                  setFormData={createFormUpdater('historiaGeneral')}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>2. Antecedentes Hereditarios</AccordionTrigger>
              <AccordionContent>
                <FormAntecedentesHereditarios
                  formData={formData.antecedentesHereditarios}
                  setFormData={createFormUpdater('antecedentesHereditarios')}
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>3. Antecedentes Personales Patológicos</AccordionTrigger>
              <AccordionContent>
                <FormAppPatologicos
                  formData={formData.appPatologicos}
                  setFormData={createFormUpdater('appPatologicos')}
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>4. Antecedentes Personales No Patológicos</AccordionTrigger>
              <AccordionContent>
                <FormApnp
                  formData={formData.apnp}
                  setFormData={createFormUpdater('apnp')}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>5. Antecedentes Alérgicos</AccordionTrigger>
              <AccordionContent>
                <FormAlergias
                  formData={formData.alergias}
                  setFormData={createFormUpdater('alergias')}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>6. Hospitalizaciones</AccordionTrigger>
              <AccordionContent>
                <FormHospitalizaciones
                  formData={formData.hospitalizaciones}
                  setFormData={createFormUpdater('hospitalizaciones')}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger>7. Signos Vitales</AccordionTrigger>
              <AccordionContent>
                <FormSignosVitales
                  formData={formData.signosVitales}
                  setFormData={createFormUpdater('signosVitales')}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger>8. Exploración de Cabeza y Cuello</AccordionTrigger>
              <AccordionContent>
                <FormExploracionCabezaCuello
                  formData={formData.exploracionCabezaCuello}
                  setFormData={createFormUpdater('exploracionCabezaCuello')}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9">
              <AccordionTrigger>9. Exploración de ATM</AccordionTrigger>
              <AccordionContent>
                <FormExploracionAtm
                  formData={formData.exploracionAtm}
                  setFormData={createFormUpdater('exploracionAtm')}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10">
              <AccordionTrigger>10. Exploración de Cavidad Oral</AccordionTrigger>
              <AccordionContent>
                <FormCavidadOral
                  formData={formData.cavidadOral}
                  setFormData={createFormUpdater('cavidadOral')}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Omitir (Lo haré después)
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar Historia Inicial"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InitialHistoryModal;