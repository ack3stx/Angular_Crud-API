import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private url = 'http://127.0.0.1:8000/api/v1/productos';

  

  constructor(private http:HttpClient) {
   }

  getProducts():Observable<any[]>{
    return this.http.get<any[]>(this.url);
  }
}
