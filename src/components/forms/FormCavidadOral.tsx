import React from 'react';
import { ICavidadOral } from '@/state/AppContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  formData: ICavidadOral;
  setFormData: (updater: React.SetStateAction<ICavidadOral>) => void;
}

const FormCavidadOral: React.FC<Props> = ({ formData, setFormData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Helper para generar las 10 filas
  const items: (keyof ICavidadOral)[] = [
    'labio', 'comisuras', 'carrillos', 'fondo_de_saco', 'frenillos', 
    'paladar', 'lengua', 'piso_boca', 'dientes', 'encia'
  ];

  return (
    <div className="space-y-4 p-4">
      {items.map(item => (
        <div key={item} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <Label htmlFor={`${item}_estado`} className="capitalize">{item.replace('_', ' ')}</Label>
          <div className="flex gap-2">
            <Input 
              id={`${item}_estado`} 
              value={formData[`${item}_estado` as keyof ICavidadOral] as string} 
              onChange={handleChange}
              placeholder="Estado (Ej. Normal)"
              className="flex-1"
            />
            <Input 
              id={`${item}_nota`} 
              value={formData[`${item}_nota` as keyof ICavidadOral] as string} 
              onChange={handleChange}
              placeholder="Notas..."
              className="flex-1"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FormCavidadOral;