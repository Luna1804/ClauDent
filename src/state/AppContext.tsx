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
  writeBatch,
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

// --- ¡NUEVO! FORMULARIOS DE HISTORIA CLÍNICA INICIAL ---
export interface IHistoriaGeneral {
  ocupacion: string;
  escolaridad: string;
  estado_civil: string;
  telefono: string;
  fecha_ult_consulta_medica: string;
  motivo_ult_consulta_medica: string;
  fecha_ult_consulta_odontologica: string;
  motivo_ult_consulta_odontologica: string;
}
export interface IAntecedentesHereditarios {
  madre: string;
  padre: string;
  hermanos: string;
  hijos: string;
  esposo: string;
  tios: string;
  abuelos: string;
}
export interface IAppPatologicos {
  ets: boolean;
  degenerativas: boolean;
  neoplasicas: boolean;
  congenitas: boolean;
  otras: string;
}
export interface IApnp {
  frecuencia_cepillado: string;
  auxiliares_higiene: boolean;
  auxiliares_cuales: string;
  come_entre_comidas: boolean;
  grupo_sanguineo: string;
  adic_tabaco: boolean;
  adic_alcohol: boolean;
}
export interface IAlergias {
  antibioticos: boolean;
  analgesicos: boolean;
  anestesicos: boolean;
  alimentos: boolean;
  especificar: string;
}
export interface IHospitalizaciones {
  ha_sido_hospitalizado: boolean;
  fecha: string;
  motivo: string;
}
export interface ISignosVitales {
  peso_kg: string;
  talla_m: string;
  frecuencia_cardiaca: string;
  tension_arterial_sistolica: string;
  tension_arterial_diastolica: string;
  frecuencia_respiratoria: string;
  temperatura_c: string;
}
export interface IExploracionCabezaCuello {
  cabeza_exostosis: boolean;
  cabeza_endostosis: boolean;
  craneo_tipo: 'dolicocefálico' | 'mesocefálico' | 'braquicefálico' | '';
  cara_asimetria_transversal: boolean;
  cara_asimetria_longitudinal: boolean;
  perfil: 'concavo' | 'convexo' | 'recto' | '';
  piel: 'normal' | 'palida' | 'cianotica' | 'enrojecida' | '';
  musculos: 'hipotonicos' | 'hipertonicos' | 'espasticos' | '';
  cuello_cadena_ganglionar_palpable: boolean;
  otros: string;
}
export interface IExploracionAtm {
  ruidos: boolean;
  lateralidad: string;
  apertura_mm: string;
  chasquidos: boolean;
  crepitacion: boolean;
  dificultad_abrir_boca: boolean;
  dolor_mov_lateralidad: boolean;
  fatiga_dolor_muscular: boolean;
  disminucion_apertura: boolean;
  desviacion_apertura_cierre: boolean;
}
export interface ICavidadOral {
  labio_estado: string; labio_nota: string;
  comisuras_estado: string; comisuras_nota: string;
  carrillos_estado: string; carrillos_nota: string;
  fondo_de_saco_estado: string; fondo_de_saco_nota: string;
  frenillos_estado: string; frenillos_nota: string;
  paladar_estado: string; paladar_nota: string;
  lengua_estado: string; lengua_nota: string;
  piso_boca_estado: string; piso_boca_nota: string;
  dientes_estado: string; dientes_nota: string;
  encia_estado: string; encia_nota: string;
}
export interface IHistoriaClinicaCompleta {
  historiaGeneral: IHistoriaGeneral;
  antecedentesHereditarios: IAntecedentesHereditarios;
  appPatologicos: IAppPatologicos;
  apnp: IApnp;
  alergias: IAlergias;
  hospitalizaciones: IHospitalizaciones;
  signosVitales: ISignosVitales;
  exploracionCabezaCuello: IExploracionCabezaCuello;
  exploracionAtm: IExploracionAtm;
  cavidadOral: ICavidadOral;
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

interface AppContextType extends AppState {
  logout: () => void;
  // Pacientes
  addPatient: (patient: Omit<Patient, 'id' | 'fechaRegistro'>) => Promise<string>;
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
  // Historia Inicial
  addInitialHistoryForms: (patientId: string, forms: IHistoriaClinicaCompleta) => Promise<void>;
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

  // ¡CORREGIDO! Efecto para Auth
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

  // ¡CORREGIDO! Efecto para Pacientes
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

  // ¡CORREGIDO! Efecto para Servicios
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

  // ¡CORREGIDO! Efecto para Cotizaciones
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

  // ¡CORREGIDO! Efecto para Paquetes
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


  // ¡CORREGIDO! Logout
  const logout = () => {
    signOut(auth);
  };

  // ¡CORREGIDO! addPatient
  const addPatient = async (patient: Omit<Patient, 'id' | 'fechaRegistro'>): Promise<string> => {
    const newDocRef = await addDoc(collection(db, 'pacientes'), {
      ...patient,
      fechaRegistro: serverTimestamp(),
    });
    return newDocRef.id;
  };
  // ¡CORREGIDO! updatePatient
  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    const patientRef = doc(db, 'pacientes', id);
    await updateDoc(patientRef, updates);
  };
  // ¡CORREGIDO! deletePatient
  const deletePatient = async (id: string) => {
    const patientRef = doc(db, 'pacientes', id);
    await deleteDoc(patientRef);
  };

  // ¡CORREGIDO! CRUD Servicios
  const addService = async (service: Omit<Service, 'id'>) => {
    await addDoc(collection(db, 'servicios'), {
      ...service,
      fechaCreacion: serverTimestamp(),
    });
  };
  const updateService = async (id: string, updates: Partial<Service>) => {
    const serviceRef = doc(db, 'servicios', id);
    await updateDoc(serviceRef, updates);
  };
  const deleteService = async (id: string) => {
    const serviceRef = doc(db, 'servicios', id);
    await deleteDoc(serviceRef);
  };

  // ¡CORREGIDO! Funciones Ficha Paciente
  const addHistoryEntry = async (patientId: string, entry: Omit<HistoryEntry, 'id'>) => {
    const historyRef = collection(db, 'pacientes', patientId, 'historial');
    await addDoc(historyRef, {
      ...entry,
      fecha: new Date(entry.fecha + "T00:00:00")
    });
  };
  const addOdontogram = async (patientId: string, tipo: 'adulto' | 'niño') => {
    const odontogramRef = collection(db, 'pacientes', patientId, 'odontograma');
    await addDoc(odontogramRef, {
      fecha: serverTimestamp(),
      tipo: tipo,
      dientes: {},
      notas: ""
    });
  };

  // ¡CORREGIDO! CRUD Cotizaciones
  const addQuotation = async (quotation: Omit<Quotation, 'id'>) => {
    const quotationsRef = collection(db, 'cotizaciones');
    await addDoc(quotationsRef, {
      ...quotation,
      fecha: new Date(quotation.fecha + "T00:00:00")
    });
  };
  const updateQuotation = async (id: string, updates: Partial<Quotation>) => {
    const quotationRef = doc(db, 'cotizaciones', id);
    const firestoreUpdates: Partial<Quotation> | DocumentData = { ...updates };
    if (updates.fecha) {
      firestoreUpdates.fecha = new Date(updates.fecha + "T00:00:00");
    }
    await updateDoc(quotationRef, firestoreUpdates);
  };
  
  // ¡CORREGIDO! CRUD Paquetes
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

  // ¡CORREGIDO! setSearchQuery
  const setSearchQuery = (query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  };

  // ¡CORREGIDO! addInitialHistoryForms
  const addInitialHistoryForms = async (patientId: string, forms: IHistoriaClinicaCompleta) => {
    const batch = writeBatch(db);
    const basePath = `pacientes/${patientId}/historia_clinica`;

    batch.set(doc(db, basePath, 'datos_generales'), forms.historiaGeneral);
    batch.set(doc(db, basePath, 'antecedentes_hereditarios'), forms.antecedentesHereditarios);
    batch.set(doc(db, basePath, 'antecedentes_patologicos'), forms.appPatologicos);
    batch.set(doc(db, basePath, 'antecedentes_no_patologicos'), forms.apnp);
    batch.set(doc(db, basePath, 'antecedentes_alergicos'), forms.alergias);
    batch.set(doc(db, basePath, 'hospitalizaciones'), forms.hospitalizaciones);
    batch.set(doc(db, basePath, 'signos_vitales'), forms.signosVitales);
    batch.set(doc(db, basePath, 'exploracion_cabeza_cuello'), forms.exploracionCabezaCuello);
    batch.set(doc(db, basePath, 'exploracion_atm'), forms.exploracionAtm);
    batch.set(doc(db, basePath, 'cavidad_oral'), forms.cavidadOral);
    
    batch.set(doc(db, `pacientes/${patientId}`), {
      fechaCreacionHistorial: serverTimestamp()
    }, { merge: true });

    await batch.commit();
  };

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
        addInitialHistoryForms,
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