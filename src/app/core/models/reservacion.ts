import { Habitacion } from './habitacion';
import { Huesped } from './huesped';

export interface Reservacion {
  id?: number;
  fecha_entrada: string;
  fecha_salida: string;
  habitacion_id: number;  // Nota: en la API puede ser que esté como id_habitacion
  huesped_id: number;     // Nota: en la API puede ser que esté como id_huesped
  precio_total: number | string;
  estado_reservacion: string;
  metodo_pago: string;
  monto_pagado: number | string;
  estado: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  
  // Datos relacionados que vendrán en la respuesta detallada
  huespedData?: Huesped;
  habitacionData?: Habitacion;
}