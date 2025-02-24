import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductsService } from '../../../core/services/products/products.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-insert',
  imports: [ReactiveFormsModule,CommonModule], // IMPORTAMOS EL MODULO DE FORMULARIOS REACTIVOS Y EL MODULO DE COMMON
  templateUrl: './insert.component.html',
  styleUrl: './insert.component.css'
})
export class InsertComponent {
  //DECLARO UNA VARIABLE DE TIPO FORMGROUP(CLASE)
  NuevoProducto: FormGroup; // FORMGRUP ES PARA AGRUPAR Y GESTIONAR LOS CONTROLES O INPUTS DE NUESTRO FORMULARIO

 
  // CONSTRUCTOR EN EL CUAL LE INYECTO EL SERVICIO DE PRODUCTOS Y EL SERVICIO DEL TOAST
  constructor(public productService: ProductsService, private tostada: ToastrService) {
    // INICIALIZO UN NUEVO FORMGROUP CON LOS CAMPOS QUE NECESITO
    this.NuevoProducto = new FormGroup({
    // LOS CAMPOS DEL FORMGROUP SON DE TIPO FORMCONTROL 
    nombre: new FormControl('', [Validators.required, // VALIDACIONES PARA EL CAMPO NOMBRE
      Validators.minLength(3),
       Validators.maxLength(50),
       Validators.pattern(/^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]*$/)]), 
    precio: new FormControl('', [Validators.required, // VALIDACIONES PARA EL CAMPO PRECIO
       Validators.min(1),
        Validators.max(10000)])
    });
    
  }

  //  METODO PARA OBTENER LOS MENSAJES DE ERROR DE LOS VALIDADORES
  private getErrorMessage(campo: string, nombreCampo: string): string | null {
    // OBTENEMOS EL CONTROL DEL CAMPO
    const control = this.NuevoProducto.get(campo);
    // SI EL CONTROL NO EXISTE O NO TIENE ERRORES RETORNAMOS NULL
    if (!control || !control.errors) return null;

    const errors = control.errors;

    // DEPENDIENDO DEL TIPO DE ERROR RETORNAMOS UN MENSAJE
    if (errors['required']) return `${nombreCampo}: Este campo es obligatorio`;
    if (errors['minlength']) return `${nombreCampo}: Debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `${nombreCampo}: No puede tener más de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['pattern']) return `${nombreCampo}: Solo se permiten letras y espacios`;
    if (errors['min']) return `${nombreCampo}: Debe ser mayor a $${errors['min'].min}`;
    if (errors['max']) return `${nombreCampo}: No puede ser mayor a $${errors['max'].max}`;

    return null;
  }

  postProduct() {
    // EN ANGULAR CUANDO ALGUNA DE LAS VALIDACIONES DEL FORMGRUP ES DECIR LOS FORMCONTROL LOS IMPUTS NO SE CUMPLE
    // EL FORMULARIO SE CONSIDERA INVALIDO Y SE MANEJA CON LA PROPIEDAD INVALID
    if (this.NuevoProducto.invalid) {
      // DECLARO UN OBJETO CON LOS CAMPOS Y SUS NOMBRES
      const campos: { [key: string]: string } = { nombre: 'Nombre', precio: 'Precio' };

      // RECORRO LOS CAMPOS DEL FORMULARIO Y OBTENGO LOS MENSAJES DE ERROR ENVIANO EL NOMBRE DEL CAMPO Y EL VALOR DEL CAMPO
      Object.keys(campos).forEach((key) => {
        const errorMessage = this.getErrorMessage(key, campos[key]);
        if (errorMessage) {
          // SI EL MENSAJE DE ERROR NO ES NULL MOSTRAMOS
          this.tostada.error(errorMessage, 'Error de validación');
        }
      });

      return;
    }
    // LLAMAMOS AL METODO POSTPRODUCT DEL SERVICIO DE PRODUCTOS Y LE PASAMOS EL VALOR DEL FORMULARIO
    //.VALUE NOS DEVUELVE UN OBJETO CON LOS VALORES DE LOS CAMPOS DEL FORMULARIO
    // CUANDO HACEMOS UNA PETICION NOS DEVUELVE UN OBSERVABLE
    this.productService.postProduct(this.NuevoProducto.value).subscribe({ // EL METODO SUBSCRIBE ESCUCHA LA RESPUESTA DEL OBSERVABLE ADEMAS DE EJECUTAR LA SOLICITUD
      //NEXT ES EL METODO QUE SE EJECUTA CUANDO LA PETICION ES EXITOSA
      next: (data) => {
        console.log(data);
        //MOSTRAMOS UN MENSAJE DE EXITO CON UN TOAST
        this.tostada.success('Producto agregado correctamente', 'Éxito');
        //RESETEAMOS EL FORMULARIO
        this.NuevoProducto.reset();
      },
      //ERROR ES EL METODO QUE SE EJECUTA CUANDO LA PETICION FALLA
      error: (data) => {
        console.error(data);
        //MOSTRAMOS UN MENSAJE DE ERROR CON UN TOAST SI LA PETICION FALLA (ERROR DEL SERVIDOR)
        this.tostada.error('Error al crear el producto', 'Error del servidor');
      }
    });
  }
 
   
 
}
