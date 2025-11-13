// RF01-RF11: Global state management with Context API
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// ¡CORREGIDO! FALTABAN ESTAS IMPORTACIONES DE AUTH
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

// --- Tus Interfaces (¡INTERFAZ 'Patient' CORREGIDA!) ---
export interface Patient {
  id: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  sexo: 'M' | 'F' | 'X';
  telefonoPrincipal: string;
  telefonoContacto?: string;
  correo: string;
  curp?: string;
  
  // Dirección
  direccion?: string;
  calle?: string;
  numeroExterior?: string;
  numeroInterior?: string;
  colonia?: string;
  municipio?: string;
  estadoDireccion?: string; // <-- ¡CORREGIDO! Antes se llamaba 'estado'
  
  estadoCivil?: string;
  
  // Campos del sistema
  estado: 'activo' | 'inactivo'; // <-- Este es el estado del sistema (correcto)
  fechaRegistro: string;
}

// (El resto de tus interfaces: Service, HistoryEntry, etc. están BIEN)
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
export interface QuotationItem {
  servicioId: string | null;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}
export interface Quotation {
  id: string;
  pacienteId: string;
  fecha: string;
  items: QuotationItem[];
  descuento: number;
  total: number;
  estado: 'borrador' | 'enviada' | 'aceptada' | 'rechazada';
  notas: string;
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

// (AppState y AppContextType están BIEN, no necesitan cambios)
interface AppState {
  currentUser: User | null; // <-- Ahora 'User' está importado
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

interface AppContextType extends AppState {
  logout: () => void;
  addPatient: (patient: Omit<Patient, 'id' | 'fechaRegistro'>) => Promise<string>;
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addHistoryEntry: (patientId: string, entry: Omit<HistoryEntry, 'id'>) => Promise<void>;
  addOdontogram: (patientId: string, tipo: 'adulto' | 'niño') => Promise<void>;
  addQuotation: (quotation: Omit<Quotation, 'id'>) => Promise<void>;
  updateQuotation: (id: string, quotation: Partial<Quotation>) => Promise<void>;
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

  // ¡CORREGIDO! Este efecto ahora funciona porque 'onAuthStateChanged' está importado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState((prev) => ({
        ...prev,
        currentUser: user,
        authLoading: false, // <-- Esto desbloquea la app
      }));
    });
    return () => unsubscribe();
  }, []);

  // ¡CORREGIDO! Efecto para Pacientes (usa 'estadoDireccion')
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
          nombres: data.nombres || '',
          apellidos: data.apellidos || '',
          fechaNacimiento: data.fechaNacimiento || '',
          sexo: data.sexo || 'X',
          telefonoPrincipal: data.telefonoPrincipal || '',
          correo: data.correo || '',
          estado: data.estado || 'activo',
          estadoDireccion: data.estadoDireccion || '',
          telefonoContacto: data.telefonoContacto || '',
          curp: data.curp || '',
          direccion: data.direccion || '',
          calle: data.calle || '',
          numeroExterior: data.numeroExterior || '',
          numeroInterior: data.numeroInterior || '',
          colonia: data.colonia || '',
          municipio: data.municipio || '',
          estadoCivil: data.estadoCivil || '',
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

  // (Efecto para Cotizaciones - sin cambios)
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
          notas: data.notas || '',
          items: data.items || [],
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

  // (El resto de funciones CRUD no cambian)
  const addPatient = async (patient: Omit<Patient, 'id' | 'fechaRegistro'>): Promise<string> => {
    const newDocRef = await addDoc(collection(db, 'pacientes'), { ...patient, fechaRegistro: serverTimestamp() });
    return newDocRef.id;
  };
  const updatePatient = async (id: string, updates: Partial<Patient>) => { await updateDoc(doc(db, 'pacientes', id), updates); };
  const deletePatient = async (id: string) => { await deleteDoc(doc(db, 'pacientes', id)); };
  const addService = async (service: Omit<Service, 'id'>) => { await addDoc(collection(db, 'servicios'), { ...service, fechaCreacion: serverTimestamp() }); };
  const updateService = async (id: string, updates: Partial<Service>) => { await updateDoc(doc(db, 'servicios', id), updates); };
  const deleteService = async (id: string) => { await deleteDoc(doc(db, 'servicios', id)); };
  const addHistoryEntry = async (patientId: string, entry: Omit<HistoryEntry, 'id'>) => { await addDoc(collection(db, 'pacientes', patientId, 'historial'), { ...entry, fecha: new Date(entry.fecha + "T00:00:00") }); };
  const addOdontogram = async (patientId: string, tipo: 'adulto' | 'niño') => { await addDoc(collection(db, 'pacientes', patientId, 'odontograma'), { fecha: serverTimestamp(), tipo: tipo, dientes: {}, notas: "" }); };
  const addQuotation = async (quotation: Omit<Quotation, 'id'>) => { await addDoc(collection(db, 'cotizaciones'), { ...quotation, fecha: new Date(quotation.fecha + "T00:00:00") }); };
  const updateQuotation = async (id: string, updates: Partial<Quotation>) => { await updateDoc(doc(db, 'cotizaciones', id), updates); };
  const addPaquete = async (paquete: Omit<Paquete, 'id'>) => { await addDoc(collection(db, 'paquetes'), { ...paquete, fechaInicio: new Date(paquete.fechaInicio + "T00:00:00"), fechaFin: new Date(paquete.fechaFin + "T00:00:00"), fechaCreacion: serverTimestamp() }); };
  const updatePaquete = async (id: string, updates: Partial<Paquete>) => { await updateDoc(doc(db, 'paquetes', id), updates); };
  const deletePaquete = async (id: string) => { await deleteDoc(doc(db, 'paquetes', id)); };
  const setSearchQuery = (query: string) => { setState((prev) => ({ ...prev, searchQuery: query })); };

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