export interface Factura {
    id: number;
    reservacion_id: number;
    metodo_pago: string;
    monto_pagado: string;
    estado: string;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
  }