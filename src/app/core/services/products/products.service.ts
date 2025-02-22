import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private url = 'http://localhost:8000/api/v1/productos';

  products: any[];

  constructor(private http:HttpClient) {
    this.products = [];
   }

  getProducts(){
    return this.http.get<any[]>(this.url);
  }
}
