import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductsService } from '../../../core/services/products/products.service';

@Component({
  selector: 'app-insert',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './insert.component.html',
  styleUrl: './insert.component.css'
})
export class InsertComponent {
  NuevoProducto: FormGroup;
  nombre: FormControl;
  precio: FormControl
 

  constructor(public productService: ProductsService) {
    this.nombre = new FormControl('');
    this.precio = new FormControl('');

    this.NuevoProducto = new FormGroup({
      nombre: this.nombre,
      precio: this.precio
    });
  }

  //METODO PARA ENVIAR LOS DATOS
  postProduct(){
    this.productService.postProduct(this.NuevoProducto.value).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (error) => {
        console.log(error);
      }
    })
  }
 
}
