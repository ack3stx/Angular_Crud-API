import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-insert',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './insert.component.html',
  styleUrl: './insert.component.css'
})
export class InsertComponent {
  formulario: FormGroup;
  mensajeError: string = '';
  mensajeExito: string = '';

  constructor() {
    //INICIALIZAMOS EL FORMULARIO
    this.formulario = new FormGroup({
      'nombre': new FormControl('', [Validators.required]),//VALIDACIONES
      'precio': new FormControl('', [Validators.required])
    });
  }

  guardar() {
    if (this.formulario.valid) {
      this.mensajeExito = 'Formulario válido';
    } else {
      this.mensajeError = 'Formulario malo'
    }
  }

}
