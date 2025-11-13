// Patient quotations list
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PatientQuotationsProps {
  patientId: string;
}

const PatientQuotations: React.FC<PatientQuotationsProps> = ({ patientId }) => {
  const { patientData } = useApp();
  const quotations = patientData[patientId]?.cotizaciones || [];

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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cotizaciones del Paciente</h3>
        <Link to="/cotizaciones">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cotización
          </Button>
        </Link>
      </div>

      {quotations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay cotizaciones para este paciente.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quotations.map((quotation) => (
            <Card key={quotation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Cotización #{quotation.id}
                    </CardTitle>
                    <CardDescription>{formatDate(quotation.fecha)}</CardDescription>
                  </div>
                  <Badge variant={estadoBadgeVariant(quotation.estado)}>
                    {quotation.estado}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {quotation.items.length} servicio(s)
                    {quotation.descuento > 0 && ` · ${quotation.descuento}% descuento`}
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {formatCurrency(quotation.total)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientQuotations;
