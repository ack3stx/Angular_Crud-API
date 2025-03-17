import { Reservacion } from './reservacion';
import { Huesped } from './huesped';
import { Habitacion } from './habitacion';

export interface ReservacionResponse {
    success: boolean;
    data: {
      reservacion: Reservacion;
      huesped: Huesped;
      habitacion: Habitacion;
    };
  }