import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductsService } from '../../../core/services/products/products.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-insert',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './insert.component.html',
  styleUrl: './insert.component.css'
})
export class InsertComponent {
  NuevoProducto: FormGroup;

 

  constructor(public productService: ProductsService, private tostada: ToastrService) {
    this.NuevoProducto = new FormGroup({
    nombre: new FormControl(''),
    precio: new FormControl('')
    });
    
  }

  //METODO PARA ENVIAR LOS DATOS
  postProduct(){
    this.productService.postProduct(this.NuevoProducto.value).subscribe({
      next: (data) => {
        console.log(data);
        this.tostada.success('Producto agregado correctamente', 'Producto agregado');
        this.NuevoProducto.reset();
      },
      error: (error) => {
        console.log(error);
        this.tostada.error('Error al crear el producto', 'Error');
      }
    })
  }
 
}
