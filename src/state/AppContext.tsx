// RF01-RF11: Global state management with Context API
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// Importaciones de Firebase (Auth)
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
// Importaciones de Firebase (Firestore) ¡NUEVO!
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase'; // ¡Importamos 'db' de Firestore!

// --- Tus Interfaces (Asegúrate de tenerlas todas aquí) ---
export interface Patient {
  id: string;
  nombre: string;
  apellido: string;
  rut: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
  direccion: string;
  estado: 'activo' | 'inactivo';
  fechaRegistro: string; // Nota: Firebase lo manejará como un Timestamp
}

export interface Service {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  estado: 'activo' | 'inactivo';
}

export interface HistoryEntry {
  id: string;
  fecha: string;
  servicios: { servicioId: string; cantidad: number }[];
  notas: string;
  total: number;
}

export interface Attachment {
  id: string;
  nombre: string;
  tipo: string;
  fecha: string;
  url: string;
}

export interface ToothState {
  estado: 'sano' | 'cariado' | 'tratado' | 'ausente';
  superficies: {
    oclusal?: string;
    mesial?: string;
    distal?: string;
    vestibular?: string;
    lingual?: string;
  };
}

export interface Odontogram {
  [toothNumber: string]: ToothState;
}

export interface Quotation {
  id: string;
  pacienteId: string;
  fecha: string;
  items: {
    servicioId: string;
    cantidad: number;
    precioUnitario: number;
  }[];
  descuento: number;
  total: number;
  estado: 'borrador' | 'enviada' | 'aceptada' | 'rechazada';
}

interface PatientData {
  historial: HistoryEntry[];
  adjuntos: Attachment[];
  odontograma: Odontogram;
  cotizaciones: Quotation[];
}
// --- Fin de tus interfaces ---

interface AppState {
  currentUser: User | null;
  authLoading: boolean;
  patients: Patient[];
  patientsLoading: boolean; // ¡NUEVO! Estado de carga para pacientes
  services: Service[];
  quotations: Quotation[];
  patientData: { [patientId: string]: PatientData };
  searchQuery: string;
}

interface AppContextType extends AppState {
  logout: () => void;
  addPatient: (patient: Omit<Patient, 'id' | 'fechaRegistro'>) => Promise<void>; // Ahora es una Promesa
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>; // Ahora es una Promesa
  deletePatient: (id: string) => Promise<void>; // Ahora es una Promesa
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addHistoryEntry: (patientId: string, entry: Omit<HistoryEntry, 'id'>) => void;
  addAttachment: (patientId: string, attachment: Omit<Attachment, 'id'>) => void;
  deleteAttachment: (patientId: string, attachmentId: string) => void;
  updateOdontogram: (patientId: string, odontogram: Odontogram) => void;
  addQuotation: (quotation: Omit<Quotation, 'id'>) => void;
  updateQuotation: (id: string, quotation: Partial<Quotation>) => void;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Demo data (La mantenemos por ahora para 'services')
const demoServices: Service[] = [
  {
    id: '1',
    codigo: 'CONS-001',
    nombre: 'Consulta General',
    descripcion: 'Revisión dental completa y diagnóstico',
    precio: 25000,
    categoria: 'Consulta',
    estado: 'activo',
  },
  {
    id: '2',
    codigo: 'LIMP-001',
    nombre: 'Limpieza Dental',
    descripcion: 'Profilaxis y pulido dental',
    precio: 35000,
    categoria: 'Prevención',
    estado: 'activo',
  },
];
// --- Fin de demo data ---

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    authLoading: true,
    patients: [], // Empezamos con pacientes vacíos
    patientsLoading: true, // Empezamos cargando pacientes
    services: demoServices, // Aún usamos demo services
    quotations: [],
    patientData: {},
    searchQuery: '',
  });

  // Efecto para escuchar los cambios de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState((prev) => ({
        ...prev,
        currentUser: user,
        authLoading: false,
      }));
    });
    return () => unsubscribe();
  }, []);

  // ¡NUEVO! Efecto para cargar pacientes desde Firestore
  useEffect(() => {
    // Solo cargamos pacientes si el usuario está logueado
    if (!state.currentUser) {
      setState((prev) => ({ ...prev, patients: [], patientsLoading: false }));
      return;
    }

    setState((prev) => ({ ...prev, patientsLoading: true }));

    const patientsRef = collection(db, 'pacientes');
    const q = query(patientsRef); // Podemos ordenar aquí si queremos, ej: query(patientsRef, orderBy('apellido'))

    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const patientsData: Patient[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convertimos Timestamp de Firebase a string de fecha (si existe)
          fechaRegistro: data.fechaRegistro?.toDate
            ? data.fechaRegistro.toDate().toISOString().split('T')[0]
            : 'N/A',
        } as Patient;
      });

      setState((prev) => ({
        ...prev,
        patients: patientsData,
        patientsLoading: false,
      }));
    });

    // Limpiamos la suscripción
    return () => unsubscribe();
  }, [state.currentUser]); // Se ejecuta cada vez que el usuario cambia

  const logout = () => {
    signOut(auth);
  };

  // --- ¡CRUD de Pacientes ahora usa Firebase! ---

  const addPatient = async (patient: Omit<Patient, 'id' | 'fechaRegistro'>) => {
    // No necesitamos manejar el estado de React, onSnapshot lo hará
    await addDoc(collection(db, 'pacientes'), {
      ...patient,
      fechaRegistro: serverTimestamp(), // Firebase pone la fecha del servidor
    });
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    const patientRef = doc(db, 'pacientes', id);
    await updateDoc(patientRef, updates);
  };

  const deletePatient = async (id: string) => {
    const patientRef = doc(db, 'pacientes', id);
    await deleteDoc(patientRef);
  };

  // --- (Todas tus otras funciones: addService, etc. se quedan igual por ahora) ---
  const addService = (service: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...service,
      id: Date.now().toString(),
    };
    setState((prev) => ({
      ...prev,
      services: [...prev.services, newService],
    }));
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteService = (id: string) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
  };

  const addHistoryEntry = (patientId: string, entry: Omit<HistoryEntry, 'id'>) => {
    /* Lógica de AppContext... */
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setState((prev) => ({
      ...prev,
      patientData: {
        ...prev.patientData,
        [patientId]: {
          ...prev.patientData[patientId],
          historial: [...(prev.patientData[patientId]?.historial || []), newEntry],
        },
      },
    }));
  };

  const addAttachment = (patientId: string, attachment: Omit<Attachment, 'id'>) => {
    /* Lógica de AppContext... */
    const newAttachment: Attachment = {
      ...attachment,
      id: Date.now().toString(),
    };
    setState((prev) => ({
      ...prev,
      patientData: {
        ...prev.patientData,
        [patientId]: {
          ...prev.patientData[patientId],
          adjuntos: [...(prev.patientData[patientId]?.adjuntos || []), newAttachment],
        },
      },
    }));
  };

  const deleteAttachment = (patientId: string, attachmentId: string) => {
    /* Lógica de AppContext... */
    setState((prev) => ({
      ...prev,
      patientData: {
        ...prev.patientData,
        [patientId]: {
          ...prev.patientData[patientId],
          adjuntos: prev.patientData[patientId]?.adjuntos.filter((a) => a.id !== attachmentId) || [],
        },
      },
    }));
  };

  const updateOdontogram = (patientId: string, odontogram: Odontogram) => {
    /* Lógica de AppContext... */
    setState((prev) => ({
      ...prev,
      patientData: {
        ...prev.patientData,
        [patientId]: {
          ...prev.patientData[patientId],
          odontograma: odontogram,
        },
      },
    }));
  };

  const addQuotation = (quotation: Omit<Quotation, 'id'>) => {
    /* Lógica de AppContext... */
    const newQuotation: Quotation = {
      ...quotation,
      id: Date.now().toString(),
    };
    setState((prev) => ({
      ...prev,
      quotations: [...prev.quotations, newQuotation],
      patientData: {
        ...prev.patientData,
        [quotation.pacienteId]: {
          ...prev.patientData[quotation.pacienteId],
          cotizaciones: [...(prev.patientData[quotation.pacienteId]?.cotizaciones || []), newQuotation],
        },
      },
    }));
  };

  const updateQuotation = (id: string, updates: Partial<Quotation>) => {
    /* Lógica de AppContext... */
    setState((prev) => ({
      ...prev,
      quotations: prev.quotations.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    }));
  };

  const setSearchQuery = (query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  };
  // --- (Fin de tus otras funciones) ---

  return (
    <AppContext.Provider
      value={{
        ...state,
        logout,
        addPatient,
        updatePatient,
        deletePatient,
        addService,
        updateService,
        deleteService,
        addHistoryEntry,
        addAttachment,
        deleteAttachment,
        updateOdontogram,
        addQuotation,
        updateQuotation,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};