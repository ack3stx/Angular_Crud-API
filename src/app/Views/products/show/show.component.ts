import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../core/services/products/products.service';
import { CommonModule } from '@angular/common';
import { Producto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-show',
  imports: [CommonModule],
  templateUrl: './show.component.html',
  styleUrl: './show.component.css'
})

export class ShowComponent implements OnInit //IMPLEMENTAMOS EL METODO ONINIT PARA
 {
  productos: Producto[] = [];
  
  //CREAMOS UN CONSTRUCTOR PARA INYECTAR EL SERVICIO
  constructor(public productService:ProductsService) {}

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


  // VARIABLES PARA LA PAGINACION
  pagina : number = 1;
  registros : number = 3;

  //METODO PARA SABER LA PAGINA ACTUAL
  get paginaActual(){
    const indice = (this.pagina - 1) * this.registros;
    return this.productos.slice(indice, indice + this.registros);
  }

  // METODO PARA EL TOTAL DE PAGINAS
  get totalPaginas(){
    return Math.ceil(this.productos.length / this.registros);
  }

  //METODO PARA IR A LA SIGUIENTE PAGINA
  siguiente(){
    if(this.pagina < this.totalPaginas){
      this.pagina++;
    }
  }

  //METODO PARA IR A LA PAGINA ANTERIOR
  anterior(){
    if(this.pagina > 1){
      this.pagina--;
    }
  }

}
