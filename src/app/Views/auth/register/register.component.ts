import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RegisterCredentials } from '../../../core/models/register-credentials';
import { FormsModule } from '@angular/forms';
import { RegisterService } from '../../../core/services/auth/register.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  router = inject(Router);
  registerService = inject(RegisterService);

  registerdata: RegisterCredentials = {
    name: '',
    password: '',
    email: '',
  };

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

