// RF01: Login page (real, with Firebase)
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // ¡NUEVO! Importamos Link
import { Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
// Importaciones de Firebase
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Importamos auth
// Importaciones de UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner'; // Para mostrar errores

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  // 'login' de useApp() ya no se usa, lo quitamos.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Por favor, ingresa email y contraseña');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // ¡Aquí está la magia!
      await signInWithEmailAndPassword(auth, email, password);
      // Si tiene éxito, el 'onAuthStateChanged' en AppContext nos moverá
      // automáticamente al dashboard.
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      // Manejo de errores de Firebase
      let errorMessage = 'Error al iniciar sesión';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Email o contraseña incorrectos';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El formato del email es incorrecto';
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-3xl shadow-lg p-8 border border-border">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
              <Stethoscope className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">ClauDent</h1>
            <p className="text-muted-foreground text-center">
              Sistema de Historial Clínico y Cotizaciones
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="h-12"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full h-12" size="lg" disabled={isLoading}>
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Demo: usa el usuario que creaste en la consola de Firebase.
            </p>

            {/* ¡NUEVO! Link a la página de Registro */}
            <p className="text-sm text-muted-foreground text-center">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Regístrate aquí
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;