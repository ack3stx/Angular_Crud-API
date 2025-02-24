import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductsService } from '../../../core/services/products/products.service';
import { ToastrService } from 'ngx-toastr';
import { Producto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './update.component.html',
  styleUrl: './update.component.css'
})
export class UpdateComponent implements OnInit //METODO ONINIT PARA QUE EJECUTE EL METODO CUANDO ANGUALR CARGUE EL COMPONENTE
{

  productos: Producto[] = [];

  formularioUpdate: FormGroup;
  //VARIABLES PARA EL MODAL
  modalVisible = false;
  //VARIABLE PARA EL PRODUCTO SELECCIONADO
  productoSeleccionado: Producto | null = null;

  //CONSTRUCTOR PARA INYECTAR EL SERVICIO DE PRODUCTOS Y EL SERVICIO DE TOAST
  constructor(public productService: ProductsService, private tostada: ToastrService) {
    // INICIALIZO UN NUEVO FORMGROUP CON LOS CAMPOS QUE NECESITO
    this.formularioUpdate = new FormGroup({
      id: new FormControl(''),
      nombre: new FormControl(''),
      precio: new FormControl('')
    });
   }

  //METODO ONINIT PARA CARGAR LOS PRODUCTOS
  ngOnInit(): void {
    this.cargarProductos();
  }

  // METODO PARA CARGAR LOS PRODUCTOS
  cargarProductos() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.productos = data
      },
      error: (e) => {
        console.log(e);
      }
    })
  }

  // METODO PARA ABRIR EL MODAL EL CUAL RECIBE UN PRODUCTO
  abrirModal(producto: Producto) {
    this.productoSeleccionado = producto;
    this.formularioUpdate.patchValue({ //PATCHVALUE PRELLENA EL FORMULARIO CON LOS DATOS DEL PRODUCTO SELECCIONADO
      id: producto.id,
      //ES EL DE LA IZQUIERDA
      nombre: producto.nombre,
      precio: producto.precio
    });
    //MODALVISIBLE LO PONEMOS EN TRUE PARA QUE SE CUMPLA LA CONDICION
    this.modalVisible = true;
  }

  // METODO PARA CERRAR EL MODAL
  cerrarModal() {
    this.modalVisible = false; //MODALVISIBLE LO PONEMOS EN FALSE PARA QUE SE NO SE CUMPLA LA CONDICION
    this.productoSeleccionado = null; 
    this.formularioUpdate.reset();//RESETEAMOS EL FORMULARIO
  }

  actualizarProducto() {
    // SI SELECCIONO UN PRODUCTO Y EL FORMULARIO ES VALIDO
    if (this.productoSeleccionado && this.formularioUpdate.valid) {
      //CREAMOS UN OBJETO PRODUCTOACTUALIZADO CON LOS CAMPOS DEL FORMULARIO
      const productoActualizado: Producto = {
        id: this.formularioUpdate.get('id')?.value,
        nombre: this.formularioUpdate.get('nombre')?.value,
        precio: this.formularioUpdate.get('precio')?.value
      };
      // LLAMAMOS AL METODO PUTPRODUCT DEL SERVICIO DE PRODUCTOS PASANDO EL ID Y EL PRODUCTO ACTUALIZADO
      this.productService.putProduct(productoActualizado.id, productoActualizado).subscribe({
        next: (data) => {
          //SI FUE EXITOSO MOSTRAMOS UNA TOSTADA DE EXITO CON EL NOMBRE DEL PRODUCTO QUE SE ACTUALIZO
          this.tostada.success(`Producto "${productoActualizado.nombre}" actualizado correctamente`, 'Éxito');
          console.log(data);
          //CERRAMOS EL MODAL Y VOLVEMOS A CARGAR LOS PRODUCTOS
          this.cerrarModal();
          this.cargarProductos();

        },
        error: (error) => {
          console.log(error);
          //SI HAY UN ERROR MOSTRAMOS UNA TOSTADA DE ERROR
          this.tostada.error('Error al actualizar el producto', 'Error');
        }
      });
    }
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

  


