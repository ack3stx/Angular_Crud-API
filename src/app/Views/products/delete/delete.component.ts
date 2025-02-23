import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../core/services/products/products.service';
import { Producto } from '../../../core/models/producto.model';
import { CommonModule } from '@angular/common';
import {ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-delete',
  imports: [CommonModule],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.css'
})
export class DeleteComponent implements OnInit 
{
   productos: Producto[] = [];

  constructor(public productService: ProductsService, private tostada: ToastrService) {}

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
  deleteProduct(id:number, nombre:string){
    this.productService.deleteProduct(id).subscribe({
      next: (data) => {
        console.log(data);
        this.tostada.success(`Producto "${nombre}" eliminado correctamente`, 'Producto eliminado');
        this.cargarProductos();
      },
      error: (error) => {
        this.tostada.error(`Error al eliminar el producto "${nombre}"`, 'Error');
        console.log(error);
      }
    })
  }



}
