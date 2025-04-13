export interface Auditoria {
  usuario: string;
  accion: string;
  endpoint: string;
  fecha: string;
  datos: any;
  datos_previos: any;
}