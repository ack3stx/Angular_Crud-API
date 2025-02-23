import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RegisterCredentials } from '../../../core/models/register-credentials';
import { FormsModule } from '@angular/forms';
import { RegisterService } from '../../../core/services/auth/register.service';

@Component({
  selector: 'app-register',    // Cómo se usará en el HTML
  standalone: true,            // Indica que es un componente independiente
  imports: [                   // Módulos necesarios para el template
    FormsModule,              // Para formularios
    CommonModule,             // Para directivas como *ngIf, *ngFor
    RouterModule              // Para navegación
  ],
  templateUrl: './register.component.html',    // Vista HTML
  styleUrls: ['./register.component.css']      // Estilos CSS
})
export class RegisterComponent {


  // inject() obtiene una instancia del servicio Router
  router = inject(Router);
  // inject() obtiene una instancia del RegisterService
  registerService = inject(RegisterService);

  registerdata: RegisterCredentials = {
    name: '',
    password: '',
    email: '',
  };

  //El subscribe es como un "escuchador" que espera a que algo suceda.
  // la respuesta del servidor después de intentar registrar un usuario.
  //Si la respuesta es exitosa, se muestra un mensaje de alerta
  // y se redirige al usuario a la página de inicio de sesión. 
  //Respuestas exitosas (códigos 2XX) activan el next:
  //Respuestas de error (códigos 4XX o 5XX) activan el error:

  onRegister() {
    console.log('Datos a enviar:', this.registerdata);  
    this.registerService.register(this.registerdata).subscribe({
      next: (response) => {
        console.log('Server response:', response);
        alert('Registration Successful');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        if (error.status === 422) {
          console.log('Datos enviados:', this.registerdata);
          console.log('Error de validación:', error.error);
        } else {
          console.error('Error completo:', error);
          alert('Registration Failed');
        }
      }
    });
  }
  }

