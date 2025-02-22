import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../core/services/products/products.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show',
  imports: [CommonModule],
  templateUrl: './show.component.html',
  styleUrl: './show.component.css'
})
export class ShowComponent implements OnInit {
  productos: any[] = [];
  //CREAMOS UN CONSTRUCTOR PARA INYECTAR EL SERVICIO
  constructor(public productService:ProductsService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

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

}
