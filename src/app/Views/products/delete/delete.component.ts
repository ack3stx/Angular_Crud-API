import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../core/services/products/products.service';
import { Producto } from '../../../core/models/producto.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete',
  imports: [CommonModule],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.css'
})
export class DeleteComponent implements OnInit 
{
   productos: Producto[] = [];

  constructor(public productService: ProductsService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  // METODO PARA CARGAR LOS PRODUCTOS
  cargarProductos(){
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.productos = data
      },
      error: (e) => {
        console.log(e);
      }
    })
  }

  // METODO PARA ELIMINAR UN PRODUCTO
  deleteProduct(id:number){
    this.productService.deleteProduct(id).subscribe({
      next: (data) => {
        console.log(data);
        this.cargarProductos();
      },
      error: (error) => {
        console.log(error);
      }
    })
  }



}
