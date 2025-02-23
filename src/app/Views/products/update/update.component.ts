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
export class UpdateComponent implements OnInit
{

  productos: Producto[] = [];
  formularioUpdate: FormGroup;
  modalVisible = false;
  productoSeleccionado: Producto | null = null;

  constructor(public productService: ProductsService, private tostada: ToastrService) {
    this.formularioUpdate = new FormGroup({
      id: new FormControl(''),
      nombre: new FormControl(''),
      precio: new FormControl('')
    });
   }

  ngOnInit(): void {
    this.cargarProductos();
  }

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

  abrirModal(producto: Producto) {
    this.productoSeleccionado = producto;
    this.formularioUpdate.patchValue({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio
    });
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.productoSeleccionado = null;
    this.formularioUpdate.reset();
  }

  actualizarProducto() {
    if (this.productoSeleccionado && this.formularioUpdate.valid) {
      const productoActualizado: Producto = {
        id: this.formularioUpdate.get('id')?.value,
        nombre: this.formularioUpdate.get('nombre')?.value,
        precio: this.formularioUpdate.get('precio')?.value
      };
      this.productService.putProduct(productoActualizado.id, productoActualizado).subscribe({
        next: (data) => {
          this.tostada.success(`Producto "${productoActualizado.nombre}" actualizado correctamente`, 'Éxito');
          console.log(data);
          this.cerrarModal();
          this.cargarProductos();

        },
        error: (error) => {
          console.log(error);
          this.tostada.error('Error al actualizar el producto', 'Error');
        }
      });
    }
  }


  
}

  


