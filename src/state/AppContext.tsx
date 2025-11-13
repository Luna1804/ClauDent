// RF01-RF11: Global state management with Context API
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// Importaciones de Firebase (Auth)
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
// Importaciones de Firebase (Firestore)
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
  QuerySnapshot,
  DocumentData,
  orderBy,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// --- Tus Interfaces (¡MODIFICADAS Quotation y QuotationItem!) ---
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
  fechaRegistro: string;
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
  storagePath: string;
}

export interface ToothState {
  estados: string[];
  superficies: {
    oclusal?: string;
    mesial?: string;
    distal?: string;
    vestibular?: string;
    lingual?: string;
  };
}

export interface Odontogram {
  id: string;
  fecha: string;
  tipo: 'adulto' | 'niño';
  dientes: { [toothNumber: string]: ToothState };
  notas: string;
}

// ¡NUEVO! Interfaz para un item de la cotización
// Es más flexible para soportar items de catálogo o personalizados
export interface QuotationItem {
  servicioId: string | null; // null si es un item personalizado
  nombre: string; // El nombre del servicio (de catálogo o personalizado)
  cantidad: number;
  precioUnitario: number;
}

// ¡MODIFICADO! 'items' usa la new interfaz y añadimos 'notas'
export interface Quotation {
  id: string;
  pacienteId: string;
  fecha: string;
  items: QuotationItem[]; // Usa la nueva interfaz
  descuento: number;
  total: number;
  estado: 'borrador' | 'enviada' | 'aceptada' | 'rechazada';
  notas: string; // ¡NUEVO! Campo de notas
}

export interface Paquete {
  id: string;
  nombre: string;
  precioTotal: number;
  fechaInicio: string;
  fechaFin: string;
  serviciosIncluidos: {
    servicioId: string;
    nombre: string;
    precioOriginal: number;
  }[];
  estado: 'activo' | 'inactivo';
}
// --- Fin de tus interfaces ---

interface AppState {
  currentUser: User | null;
  authLoading: boolean;
  patients: Patient[];
  patientsLoading: boolean;
  services: Service[];
  servicesLoading: boolean;
  quotations: Quotation[];
  quotationsLoading: boolean;
  paquetes: Paquete[];
  paquetesLoading: boolean;
  searchQuery: string;
}

// (La interfaz AppContextType no necesita cambios, 
// ya que 'addQuotation' y 'updateQuotation' usan la interfaz base 'Quotation')
interface AppContextType extends AppState {
  logout: () => void;
  // Pacientes
  addPatient: (patient: Omit<Patient, 'id' | 'fechaRegistro'>) => Promise<void>;
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  // Servicios
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  // Funciones de Ficha de Paciente
  addHistoryEntry: (patientId: string, entry: Omit<HistoryEntry, 'id'>) => Promise<void>;
  addOdontogram: (patientId: string, tipo: 'adulto' | 'niño') => Promise<void>;
  // Cotizaciones
  addQuotation: (quotation: Omit<Quotation, 'id'>) => Promise<void>;
  updateQuotation: (id: string, quotation: Partial<Quotation>) => Promise<void>;
  // Paquetes
  addPaquete: (paquete: Omit<Paquete, 'id'>) => Promise<void>;
  updatePaquete: (id: string, updates: Partial<Paquete>) => Promise<void>;
  deletePaquete: (id: string) => Promise<void>;
  
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    authLoading: true,
    patients: [],
    patientsLoading: true,
    services: [],
    servicesLoading: true,
    quotations: [],
    quotationsLoading: true,
    paquetes: [],
    paquetesLoading: true,
    searchQuery: '',
  });

  // (Efecto para Auth - sin cambios)
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

  // (Efecto para Pacientes - sin cambios)
  useEffect(() => {
    if (!state.currentUser) {
      setState((prev) => ({ ...prev, patients: [], patientsLoading: false }));
      return;
    }
    setState((prev) => ({ ...prev, patientsLoading: true }));
    const q = query(collection(db, 'pacientes'));
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const patientsData: Patient[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
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
    return () => unsubscribe();
  }, [state.currentUser]);

  // (Efecto para Servicios - sin cambios)
  useEffect(() => {
    if (!state.currentUser) {
      setState((prev) => ({ ...prev, services: [], servicesLoading: false }));
      return;
    }
    setState((prev) => ({ ...prev, servicesLoading: true }));
    const q = query(collection(db, 'servicios'));
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const servicesData: Service[] = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        } as Service;
      });
      setState((prev) => ({
        ...prev,
        services: servicesData,
        servicesLoading: false,
      }));
    });
    return () => unsubscribe();
  }, [state.currentUser]);

  // ¡MODIFICADO! Efecto para Cotizaciones (añade 'notas')
  useEffect(() => {
    if (!state.currentUser) {
      setState((prev) => ({ ...prev, quotations: [], quotationsLoading: false }));
      return;
    }
    setState((prev) => ({ ...prev, quotationsLoading: true }));
    const q = query(collection(db, 'cotizaciones'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const quotationsData: Quotation[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fecha: data.fecha?.toDate ? data.fecha.toDate().toISOString().split('T')[0] : 'N/A',
          notas: data.notas || '', // <-- ¡AÑADIDO! Valor por defecto
          items: data.items || [], // <-- ¡AÑADIDO! Valor por defecto
        } as Quotation;
      });
      setState((prev) => ({
        ...prev,
        quotations: quotationsData,
        quotationsLoading: false,
      }));
    });
    return () => unsubscribe();
  }, [state.currentUser]);

  // (Efecto para Paquetes - sin cambios)
  useEffect(() => {
    if (!state.currentUser) {
      setState((prev) => ({ ...prev, paquetes: [], paquetesLoading: false }));
      return;
    }
    setState((prev) => ({ ...prev, paquetesLoading: true }));
    const q = query(collection(db, 'paquetes'), orderBy('nombre', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const paquetesData: Paquete[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fechaInicio: data.fechaInicio?.toDate ? data.fechaInicio.toDate().toISOString().split('T')[0] : 'N/A',
          fechaFin: data.fechaFin?.toDate ? data.fechaFin.toDate().toISOString().split('T')[0] : 'N/A',
        } as Paquete;
      });
      setState((prev) => ({
        ...prev,
        paquetes: paquetesData,
        paquetesLoading: false,
      }));
    });
    return () => unsubscribe();
  }, [state.currentUser]);


  const logout = () => {
    signOut(auth);
  };

  // (CRUD Pacientes - sin cambios)
  const addPatient = async (patient: Omit<Patient, 'id' | 'fechaRegistro'>) => {
    await addDoc(collection(db, 'pacientes'), { ...patient, fechaRegistro: serverTimestamp() });
  };
  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    await updateDoc(doc(db, 'pacientes', id), updates);
  };
  const deletePatient = async (id: string) => {
    await deleteDoc(doc(db, 'pacientes', id));
  };

  // (CRUD Servicios - sin cambios)
  const addService = async (service: Omit<Service, 'id'>) => {
    await addDoc(collection(db, 'servicios'), { ...service, fechaCreacion: serverTimestamp() });
  };
  const updateService = async (id: string, updates: Partial<Service>) => {
    await updateDoc(doc(db, 'servicios', id), updates);
  };
  const deleteService = async (id: string) => {
    await deleteDoc(doc(db, 'servicios', id));
  };

  // (Funciones Ficha Paciente - sin cambios)
  const addHistoryEntry = async (patientId: string, entry: Omit<HistoryEntry, 'id'>) => {
    const historyRef = collection(db, 'pacientes', patientId, 'historial');
    await addDoc(historyRef, { ...entry, fecha: new Date(entry.fecha + "T00:00:00") });
  };
  const addOdontogram = async (patientId: string, tipo: 'adulto' | 'niño') => {
    const odontogramRef = collection(db, 'pacientes', patientId, 'odontograma');
    await addDoc(odontogramRef, { fecha: serverTimestamp(), tipo: tipo, dientes: {}, notas: "" });
  };

  // (CRUD Cotizaciones - sin cambios en la implementación, pero ahora aceptan 'notas' y 'items' flexibles)
  const addQuotation = async (quotation: Omit<Quotation, 'id'>) => {
    const quotationsRef = collection(db, 'cotizaciones');
    await addDoc(quotationsRef, {
      ...quotation,
      fecha: new Date(quotation.fecha + "T00:00:00")
    });
  };
  const updateQuotation = async (id: string, updates: Partial<Quotation>) => {
    const quotationRef = doc(db, 'cotizaciones', id);
    // Convertir fechas si vienen en el update
    const firestoreUpdates: Partial<Quotation> | DocumentData = { ...updates };
    if (updates.fecha) {
      firestoreUpdates.fecha = new Date(updates.fecha + "T00:00:00");
    }
    await updateDoc(quotationRef, firestoreUpdates);
  };
  
  // (CRUD Paquetes - sin cambios)
  const addPaquete = async (paquete: Omit<Paquete, 'id'>) => {
    await addDoc(collection(db, 'paquetes'), {
      ...paquete,
      fechaInicio: new Date(paquete.fechaInicio + "T00:00:00"),
      fechaFin: new Date(paquete.fechaFin + "T00:00:00"),
      fechaCreacion: serverTimestamp(),
    });
  };
  const updatePaquete = async (id: string, updates: Partial<Paquete>) => {
    const paqueteRef = doc(db, 'paquetes', id);
    const firestoreUpdates: Partial<Paquete> | DocumentData = { ...updates };
    if (updates.fechaInicio) {
      firestoreUpdates.fechaInicio = new Date(updates.fechaInicio + "T00:00:00");
    }
    if (updates.fechaFin) {
      firestoreUpdates.fechaFin = new Date(updates.fechaFin + "T00:00:00");
    }
    await updateDoc(paqueteRef, firestoreUpdates);
  };
  const deletePaquete = async (id: string) => {
    await deleteDoc(doc(db, 'paquetes', id));
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
        addOdontogram,
        addQuotation,
        updateQuotation,
        addPaquete,
        updatePaquete,
        deletePaquete,
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