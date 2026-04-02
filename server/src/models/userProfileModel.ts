export interface UserProfile {
  user_id: number;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  tipo_identificacion: string;
  numero_identificacion: string;
  direccion: string | null;
  telefono: string | null;
}