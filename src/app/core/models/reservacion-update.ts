export interface ReservacionUpdate {
    fecha_entrada?: string;
    fecha_salida?: string;
    habitacion_id?: number;
    huesped_id?: number;
    precio_total?: number;
    estado_reservacion?: string;
    metodo_pago?: string;
    monto_pagado?: number;
}