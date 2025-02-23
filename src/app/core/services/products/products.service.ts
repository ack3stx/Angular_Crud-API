import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  //URL DE LA API
  private url = 'http://127.0.0.1:8000/api/v1/productos';


  //INYECTAMOS EL SERVICIO HTTPCLIENT
  constructor(private http:HttpClient) {
   }

  //METODO PARA OBTENER LOS PRODUCTOS
  getProducts():Observable<Producto[]>
  {
    //RETORNAMOS LOS QUE NOS REGRESO LA PETICION GET
    return this.http.get<Producto[]>(this.url);
  }

  //METODO PARA AGREGAR UN PRODUCTO
  postProduct(producto:Producto):Observable<Producto>
  {
    //RETORNAMOS LOS QUE NOS REGRESO LA PETICION POST
    return this.http.post<Producto>(this.url,producto);
  }

  //METODO PARA ELIMINAR UN PRODUCTO
  deleteProduct(id: number): Observable<Producto> {
    //RETORNAMOS LOS QUE NOS REGRESO LA PETICION DELETE
    return this.http.delete<Producto>(`${this.url}/${id}`);
  }

  //METODO PARA ACTUALIZAR UN PRODUCTO
  putProduct(id:number,producto: Producto): Observable<Producto> {
    //RETORNAMOS LOS QUE NOS REGRESO LA PETICION PUT
    return this.http.put<Producto>(`${this.url}/${producto.id}`, producto);
  }

}
