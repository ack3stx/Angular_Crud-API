import { ReservacionItem } from './reservacion-item';

export interface ReservacionListResponse {
    success: boolean;
    data: ReservacionItem[];
  }