// RF06: Interactive odontogram with tooth surfaces
import React, { useState, useEffect } from 'react';
import { useApp, Odontogram, ToothState } from '@/state/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PatientOdontogramProps {
  patientId: string;
}

// Adult teeth (32 permanent teeth)
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

const ESTADO_COLORS = {
  sano: 'bg-success hover:bg-success/80',
  cariado: 'bg-destructive hover:bg-destructive/80',
  tratado: 'bg-primary hover:bg-primary/80',
  ausente: 'bg-muted hover:bg-muted/80',
};

const PatientOdontogram: React.FC<PatientOdontogramProps> = ({ patientId }) => {
  const { patientData, updateOdontogram } = useApp();
  const savedOdontogram = patientData[patientId]?.odontograma || {};
  
  const [odontogram, setOdontogram] = useState<Odontogram>(savedOdontogram);
  const [selectedState, setSelectedState] = useState<'sano' | 'cariado' | 'tratado' | 'ausente'>('sano');

  const getToothState = (toothNumber: number): ToothState => {
    return odontogram[toothNumber] || { estado: 'sano', superficies: {} };
  };

  const handleToothClick = (toothNumber: number) => {
    const newOdontogram = {
      ...odontogram,
      [toothNumber]: {
        estado: selectedState,
        superficies: {},
      },
    };
    setOdontogram(newOdontogram);
  };

  const handleSave = () => {
    updateOdontogram(patientId, odontogram);
    toast.success('Odontograma guardado correctamente');
  };

  const Tooth: React.FC<{ number: number }> = ({ number }) => {
    const state = getToothState(number);
    return (
      <button
        onClick={() => handleToothClick(number)}
        className={cn(
          'relative h-16 w-12 rounded-lg border-2 border-border transition-all',
          'flex flex-col items-center justify-center',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          ESTADO_COLORS[state.estado]
        )}
        aria-label={`Diente ${number}, estado: ${state.estado}`}
      >
        <span className="text-xs font-bold text-foreground">{number}</span>
        <span className="text-[10px] text-foreground/70">{state.estado}</span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Odontograma</h3>
        <Button onClick={handleSave}>Guardar Cambios</Button>
      </div>

      {/* State selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium mr-2 self-center">Estado a aplicar:</span>
            {(['sano', 'cariado', 'tratado', 'ausente'] as const).map((estado) => (
              <Button
                key={estado}
                variant={selectedState === estado ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedState(estado)}
                className={cn(selectedState === estado && ESTADO_COLORS[estado])}
              >
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Odontogram grid */}
      <div className="space-y-8 bg-card p-6 rounded-3xl border border-border">
        {/* Upper jaw */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3 text-center">
            Maxilar Superior
          </p>
          <div className="flex justify-center gap-8">
            <div className="flex gap-1">
              {UPPER_RIGHT.map((tooth) => (
                <Tooth key={tooth} number={tooth} />
              ))}
            </div>
            <div className="w-px bg-border" />
            <div className="flex gap-1">
              {UPPER_LEFT.map((tooth) => (
                <Tooth key={tooth} number={tooth} />
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Lower jaw */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3 text-center">
            Maxilar Inferior
          </p>
          <div className="flex justify-center gap-8">
            <div className="flex gap-1">
              {LOWER_RIGHT.map((tooth) => (
                <Tooth key={tooth} number={tooth} />
              ))}
            </div>
            <div className="w-px bg-border" />
            <div className="flex gap-1">
              {LOWER_LEFT.map((tooth) => (
                <Tooth key={tooth} number={tooth} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-3">Leyenda:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['sano', 'cariado', 'tratado', 'ausente'] as const).map((estado) => (
              <div key={estado} className="flex items-center gap-2">
                <div className={cn('h-4 w-4 rounded', ESTADO_COLORS[estado])} />
                <span className="text-sm">{estado.charAt(0).toUpperCase() + estado.slice(1)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/50 rounded-2xl p-4 border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Instrucciones:</strong> Selecciona un estado en la barra superior y haz clic en los dientes para aplicarlo.
        </p>
      </div>
    </div>
  );
};

export default PatientOdontogram;
