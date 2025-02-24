import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../core/services/products/products.service';
import { Producto } from '../../../core/models/producto.model';
import { CommonModule } from '@angular/common';
import {ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-delete',
  imports: [CommonModule],// IMPORTAMOS EL MODULO DE COMMON PARA USAR EL NGFOR
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.css'
})
 // IMPLEMENTAMOS EL METODO ONINIT PARA QUE EJECUTE EL METODO CUANDO ANGUALR CARGUE EL COMPONENTE
export class DeleteComponent implements OnInit
{ // DECLARAMOS UNA VARIABLE DE TIPO PRODUCTO
  // DONDE SE ALAMCENARAN TODOS LOS PRODUCTOS DE LA BASE DE DATOS
  // ESTA VARIABLE LA INICIALIZO COMO UN ARRAY VACIO
   productos: Producto[] = [];

   //CONSTRUCTOR PARA INYECTAR EL SERVICIO DE PRODUCTOS Y EL SERVICIO DE TOAST
  constructor(public productService: ProductsService, private tostada: ToastrService) {}

  //METODO ONINIT PARA CARGAR LOS PRODUCTOS
  ngOnInit(): void {
    this.cargarProductos();
  }

  // METODO PARA CARGAR LOS PRODUCTOS
  cargarProductos(){
    this.productService.getProducts().subscribe({
      next: (data) => {
        // SI TODO SALE BIEN ALMACENAMOS LOS PRODUCTOS DE LA RESPUESTA EN LA VARIABBLE DECLARADA
        this.productos = data
      },
      error: (e) => {
        console.log(e);
      }
    })
  }

  // METODO PARA ELIMINAR UN PRODUCTO

  deleteProduct(id:number, nombre:string){
    // LLAMAMOS AL METODO DELETEPRODUCT DEL SERVICIO PASANDO EL ID QUE LO OCUPAMOS EN LA API
    this.productService.deleteProduct(id).subscribe({
      next: (data) => {
        console.log(data);
        // SI TODO SALE BIEN MOSTRAMOS LA TOSTADA DE EXITO 
        this.tostada.success(`Producto "${nombre}" eliminado correctamente`, 'Producto eliminado');
        // VOLVEMOS A CARGAR LOS PRODUCTOS
        this.cargarProductos();
      },
      error: (error) => {
        // SI HAY UN ERROR MOSTRAMOS LA TOSTADA DE ERROR
        this.tostada.error(`Error al eliminar el producto "${nombre}"`, 'Error');
        console.log(error);
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
