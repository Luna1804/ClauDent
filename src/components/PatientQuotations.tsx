// Patient quotations list (Conectado a Firebase)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { useApp, Quotation } from '@/state/AppContext'; // ¡Importamos Quotation!
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton'; // ¡NUEVO!

interface PatientQuotationsProps {
  patientId: string;
}

const PatientQuotations: React.FC<PatientQuotationsProps> = ({ patientId }) => {
  // ¡MODIFICADO! Leemos del estado global
  const { quotations, quotationsLoading } = useApp();
  
  // ¡NUEVO! Estado local para las cotizaciones *de este paciente*
  const [patientQuotations, setPatientQuotations] = useState<Quotation[]>([]);

  // ¡NUEVO! Efecto para filtrar las cotizaciones
  useEffect(() => {
    if (patientId && quotations.length > 0) {
      const filtered = quotations.filter(q => q.pacienteId === patientId);
      setPatientQuotations(filtered);
    } else {
      setPatientQuotations([]);
    }
  }, [patientId, quotations]); // Se re-ejecuta si el paciente o la lista global cambian

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

  // ¡NUEVO! Esqueleto de carga
  const QuotationLoadingSkeleton = () => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24 mt-2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-24" />
        </div>
      </CardContent>
    </Card>
  );

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

      {quotationsLoading ? (
        <div className="space-y-4">
          <QuotationLoadingSkeleton />
          <QuotationLoadingSkeleton />
        </div>
      ) : patientQuotations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay cotizaciones para este paciente.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {patientQuotations.map((quotation) => (
            <Card key={quotation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Cotización #{quotation.id.substring(0, 6)}...
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