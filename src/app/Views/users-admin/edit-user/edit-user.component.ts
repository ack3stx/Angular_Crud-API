import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { User } from '../../../core/models/user';
import { UsersService } from '../../../core/services/userservice/users-service.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.css'
})
export class EditUserComponent implements OnInit {
  userId!: number;
  user!: User;
  editUserForm!: FormGroup;
  showPasswordField: boolean = false;
  loading: boolean = false;
  loadingUser: boolean = true;
  error: string = '';
  submitted: boolean = false;
  
  // Expresiones regulares para validaciones
  nameRegex: RegExp = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/; // Solo letras y espacios
  emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initForm();
  }
  
  private initForm(): void {
    this.editUserForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(50),
        Validators.pattern(this.nameRegex)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.pattern(this.emailRegex),
        Validators.maxLength(100)
      ]],
      password: ['', []]
    });
  }
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      this.loadUser();
    });
  }
  
  loadUser() {
    this.loadingUser = true;
    this.error = '';
    
    this.usersService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.editUserForm.patchValue({
          name: user.name,
          email: user.email
        });
        this.loadingUser = false;
      },
      error: (err) => {
        console.error('Error al cargar usuario:', err);
        this.error = 'No se pudo cargar la información del usuario';
        this.toastr.error(this.error);
        this.loadingUser = false;
        
        // Redireccionar después de un breve momento
        setTimeout(() => {
          this.router.navigate(['/admin/users']);
        }, 3000);
      }
    });
  }
  
  togglePasswordField(): void {
    this.showPasswordField = !this.showPasswordField;
    
    const passwordControl = this.editUserForm.get('password');
    if (passwordControl) {
      if (this.showPasswordField) {
        passwordControl.setValidators([
          Validators.required, 
          Validators.minLength(8),
          Validators.maxLength(50),
          Validators.pattern(this.passwordRegex)
        ]);
      } else {
        passwordControl.clearValidators();
        passwordControl.setValue('');
      }
      passwordControl.updateValueAndValidity();
    }
  }
  
  // Método para verificar si un campo es inválido y ha sido tocado
  isFieldInvalid(fieldName: string): boolean {
    const control = this.editUserForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched || this.submitted);
  }
  
  // Método para obtener el mensaje de error de cada campo
  getErrorMessage(fieldName: string): string {
    const control = this.editUserForm.get(fieldName);
    
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) return 'Este campo es obligatorio';
    
    if (fieldName === 'name') {
      if (control.errors['minlength']) return `El nombre debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['maxlength']) return `El nombre no puede tener más de ${control.errors['maxlength'].requiredLength} caracteres`;
      if (control.errors['pattern']) return 'El nombre solo puede contener letras y espacios';
    }
    
    if (fieldName === 'email') {
      if (control.errors['email'] || control.errors['pattern']) return 'Debe ingresar un correo electrónico válido';
      if (control.errors['maxlength']) return `El correo no puede tener más de ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    
    if (fieldName === 'password') {
      if (control.errors['minlength']) return `La contraseña debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['maxlength']) return `La contraseña no puede tener más de ${control.errors['maxlength'].requiredLength} caracteres`;
      if (control.errors['pattern']) return 'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial';
    }
    
    return 'Campo inválido';
  }
  
  onCancel(): void {
    this.router.navigate(['/admin/users']);
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    if (this.editUserForm.invalid) {
      Object.keys(this.editUserForm.controls).forEach(key => {
        this.editUserForm.get(key)?.markAsTouched();
      });
      
      this.toastr.warning('Por favor corrige los errores en el formulario');
      return;
    }
    
    this.loading = true;
    const formValues = this.editUserForm.value;
    
    const updatedData: any = {};
    if (formValues.name) updatedData.name = formValues.name.trim();
    if (formValues.email) updatedData.email = formValues.email.trim();
    if (formValues.password && this.showPasswordField) updatedData.password = formValues.password;
    
    this.usersService.updateUser(this.userId, updatedData).subscribe({
      next: () => {
        this.toastr.success(`Usuario actualizado exitosamente`);
        this.loading = false;
        this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err);
        
        // Manejar errores específicos del servidor
        if (err.status === 409) {
          this.toastr.error('El correo electrónico ya está en uso');
          this.editUserForm.get('email')?.setErrors({ 'emailExists': true });
        } else if (err.status === 400) {
          this.toastr.error('Datos de usuario inválidos');
        } else {
          this.toastr.error('Error al actualizar el usuario');
        }
        
        this.loading = false;
      }
    });
  }
}