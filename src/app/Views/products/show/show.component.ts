import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../core/services/products/products.service';
import { CommonModule } from '@angular/common';
import { Producto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-show',
  imports: [CommonModule], // IMPORTAMOS EL MODULO DE COMMON PARA USAR EL NGFOR
  templateUrl: './show.component.html',
  styleUrl: './show.component.css'
})
//IMPLEMENTAMOS EL METODO ONINIT PARA QUE EJECUTE EL METODO CUANDO ANGUALR CARGUE EL COMPONENTE
export class ShowComponent implements OnInit  
 {
  //DECLARAMOS UNA VARIABLE DE TIPO PRODUCTO
  //DONDE SE ALAMCENARAN TODOS LOS PRODUCTOS DE LA BASE DE DATOS
  //ESTA VARIABLE LA INICIALIZO COMO UN ARRAY VACIO
  productos: Producto[] = [];
  
  //CREAMOS UN CONSTRUCTOR PARA INYECTAR EL SERVICIO
  constructor(public productService:ProductsService) {}

  //METODO LLAMA AL SERVICIO PARA CARGAR LOS PRODUCTOS
  ngOnInit(): void {
    this.cargarProductos();
  }

 // METODO PARA CARGAR LOS PRODUCTOS
  cargarProductos(){
    // LLAMAMOS AL METODO GETPRODUCTS DEL SERVICIO
    this.productService.getProducts().subscribe({ // SUBSCRIBIMOS EL METODO
      next: (data) => {
        // SI TODO SALE BIEN ALMACENAMOS LOS PRODUCTOS DE LA RESPUESTA EN LA VARIABBLE DECLARADA
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
