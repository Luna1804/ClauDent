// RF11: Dashboard with quick access and recent searches
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Stethoscope, FileText, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/state/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const { patients, services, quotations, currentUser } = useApp();

  const stats = [
    {
      title: 'Total Pacientes',
      value: patients.length,
      icon: Users,
      description: `${patients.filter(p => p.estado === 'activo').length} activos`,
      color: 'text-primary',
      link: '/pacientes',
    },
    {
      title: 'Servicios',
      value: services.length,
      icon: Stethoscope,
      description: `${services.filter(s => s.estado === 'activo').length} disponibles`,
      color: 'text-secondary',
      link: '/servicios',
    },
    {
      title: 'Cotizaciones',
      value: quotations.length,
      icon: FileText,
      description: 'Total generadas',
      color: 'text-accent',
      link: '/cotizaciones',
    },
  ];

  const recentPatients = patients.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Bienvenido, {currentUser?.name}
        </h1>
        <p className="text-muted-foreground">
          Aquí está el resumen de tu consultorio
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={stat.link}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
          <CardDescription>Acciones frecuentes</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/pacientes">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Nuevo Paciente</span>
            </Button>
          </Link>
          <Link to="/cotizaciones">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Nueva Cotización</span>
            </Button>
          </Link>
          <Link to="/servicios">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <Stethoscope className="h-6 w-6" />
              <span className="text-sm">Ver Servicios</span>
            </Button>
          </Link>
          <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
            <Calendar className="h-6 w-6" />
            <span className="text-sm">Agenda</span>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Patients */}
      <Card>
        <CardHeader>
          <CardTitle>Pacientes Recientes</CardTitle>
          <CardDescription>Últimos registros</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPatients.map((patient) => (
              <Link
                key={patient.id}
                to={`/pacientes/${patient.id}`}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {patient.nombre[0]}{patient.apellido[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {patient.nombre} {patient.apellido}
                    </p>
                    <p className="text-sm text-muted-foreground">{patient.rut}</p>
                  </div>
                </div>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
