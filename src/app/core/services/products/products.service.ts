import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../../models/producto.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  //URL DE LA API
  private url = environment.apiUrl + '/v1/productos';


  //INYECTAMOS EL SERVICIO HTTPCLIENT
  constructor(private http:HttpClient) {
   }

  //METODO PARA OBTENER LOS PRODUCTOS
  getProducts():Observable<Producto[]>// ESTE METODO RETORNA UN OBSERVABLE DE TIPO PRODUCTO
  {
    //REALIZAMOS UNA PETICION GET A LA URL DE LA API
    // <Producto[]> ES PARA INDICAR QUE EL TIPO DE DATO QUE NOS REGRESARA LA PETICION ES UN ARRAY DE PRODUCTOS
    return this.http.get<Producto[]>(this.url);
  }

  //METODO PARA AGREGAR UN PRODUCTO
  //RECIBE UN OBJETO QUE SE ENVIA AL CUERPO DE LA SOLICITUD
  postProduct(producto:Producto):Observable<Producto>
  {
    //RETORNAMOS LOS QUE NOS REGRESO LA PETICION POST
    return this.http.post<Producto>(this.url,producto);//producto lo mandamos al cuerpo de la peticion
  }

  //METODO PARA ELIMINAR UN PRODUCTO
  //RECIBE UN ID PARA SABER QUE PRODUCTO ELIMINAR
  deleteProduct(id: number): Observable<Producto> {
    //RETORNAMOS LOS QUE NOS REGRESO LA PETICION DELETE
    return this.http.delete<Producto>(`${this.url}/${id}`);//LE CONCATENAMOS LA ID A LA RUTA PARA QUE SEPA CUAL ELIMINAR
  }

  //METODO PARA ACTUALIZAR UN PRODUCTO
  putProduct(id:number,producto: Producto): Observable<Producto> {
    //RETORNAMOS LOS QUE NOS REGRESO LA PETICION PUT
    return this.http.put<Producto>(`${this.url}/${producto.id}`, producto);
  }

}
