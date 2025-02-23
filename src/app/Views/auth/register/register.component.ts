import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegisterService } from '../../../core/services/auth/register.service';
import { RegisterCredentials } from '../../../core/models/register-credentials';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',    // Cómo se usará en el HTML
  imports: [ReactiveFormsModule, // Importa el módulo de formularios reactivos
    RouterModule, // Importa el módulo de rutas 
  ],
  templateUrl: './register.component.html',    // Vista HTML
  styleUrls: ['./register.component.css']      // Estilos CSS
})

export class RegisterComponent {
  // inject() obtiene una instancia del servicio Router
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private registerService = inject(RegisterService);

  // Formulario reactivo con validaciones
  FormularioRegister = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ])
  });
  
  // Constructor que recibe instancias de Router, RegisterService y ToastrService
  // y las asigna a las variables privadas router, registerService y toastr.
  // Se comenta porque se está usando la función inject() para obtener las instancias.
/*
  constructor(router: Router, registerService: RegisterService, toastr: ToastrService ) {
    this.router = router;
    this.registerService = registerService;
    this.toastr = toastr;

   }
*/


  //El subscribe es como un "escuchador" que espera a que algo suceda.
  //Si la respuesta es exitosa, se muestra un mensaje de alerta
  // y se redirige al usuario a la página de inicio de sesión. 
  //Respuestas exitosas (códigos 2XX) activan el next:
  //Respuestas de error (códigos 4XX o 5XX) activan el error:

  onRegister() {
    if (this.FormularioRegister.valid) {
      const formValues = this.FormularioRegister.value;

      const registerData: RegisterCredentials = {
        name: formValues.name || '',
        email: formValues.email || '',
        password: formValues.password || ''
      };
      
      this.registerService.register(registerData).subscribe({
        next: (response) => {
          console.log('Server response:', response);
          this.toastr.success('Registro exitoso');
          this.router.navigate(['/login']);
          this.FormularioRegister.reset();
        },
        error: (error) => {
          console.log('Error completo:', error);
          if (error.status === 422) {
            console.log('Error de validación:', error.error);
            this.toastr.error('Error de validación', 'Error');
          } else {
            this.toastr.error('Error en el registro', 'Error');
          }
        }
      });
    }
    else {
      this.toastr.error('Datos inválidos', 'Error');
    }
  }
}