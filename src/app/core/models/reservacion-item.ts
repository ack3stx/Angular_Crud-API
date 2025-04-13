import { Habitacion } from './habitacion';
import { Huesped } from './huesped';
import { Reservacion } from './reservacion';

export interface ReservacionItem {
  reservacion: Reservacion;
  huesped: Huesped;
  habitacion: Habitacion | null;
}