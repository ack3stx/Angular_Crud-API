import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservacionesService } from '../../../core/services/Reservaciones/reservaciones.service';
import { HuespedesService } from '../../../core/services/huespedes/huespedes.service';
import { HabitacionesService } from '../../../core/services/Habitaciones/habitaciones.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Huesped } from '../../../core/models/huesped';
import { Habitacion } from '../../../core/models/habitacion';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reservar',
  templateUrl: './reservar.component.html',
  styleUrls: ['./reservar.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ReservarComponent implements OnInit {
  reservacionForm!: FormGroup;
  huespedes: Huesped[] = [];
  habitaciones: Habitacion[] = [];
  loading: boolean = false;
  loadingData: boolean = true;
  error: string | null = null;
  precioCalculado: number = 0;
  submitted: boolean = false;
  
  metodosPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta de Crédito/Débito' },
    { value: 'transferencia', label: 'Transferencia Bancaria' },
    { value: 'deposito', label: 'Depósito' }
  ];
  
  estadosReservacion = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Confirmada', label: 'Confirmada' },
    { value: 'Cancelada', label: 'Cancelada' }
  ];

  fechaMinima = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private reservacionService: ReservacionesService,
    private huespedService: HuespedesService,
    private habitacionService: HabitacionesService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    if (!this.isAdmin()) {
      this.toastr.warning('No tienes permiso para acceder a esta página');
      this.router.navigate(['/reservaciones']);
      return;
    }
    
    this.initForm();
    this.cargarDatos();
  }

  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 2;
  }

  fechaValidaValidator(group: FormGroup): ValidationErrors | null {
    const fechaEntrada = group.get('fecha_entrada')?.value;
    const fechaSalida = group.get('fecha_salida')?.value;
    
    if (!fechaEntrada || !fechaSalida) {
      return null;
    }
    
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    
    if (salida <= entrada) {
      return { 'fechaInvalida': true };
    }
    
    return null;
  }

  private initForm() {
    const hoy = new Date();
    const maniana = new Date(hoy);
    maniana.setDate(maniana.getDate() + 1);
    
    const fechaHoy = hoy.toISOString().split('T')[0];
    const fechaManiana = maniana.toISOString().split('T')[0];
    
    this.reservacionForm = this.fb.group({
      fecha_entrada: [fechaHoy, [
        Validators.required
      ]],
      fecha_salida: [fechaManiana, [
        Validators.required
      ]],
      habitacion_id: ['', [
        Validators.required
      ]],
      huesped_id: ['', [
        Validators.required
      ]],
      precio_total: [0, [
        Validators.required, 
        Validators.min(0)
      ]],
      estado_reservacion: ['Pendiente', [
        Validators.required
      ]],
      metodo_pago: ['', [
        Validators.required
      ]],
      monto_pagado: [0, [
        Validators.required, 
        Validators.min(0)
      ]],
      estado: ['Activo']
    }, { validators: this.fechaValidaValidator });

    this.reservacionForm.get('fecha_entrada')?.valueChanges.subscribe(() => this.calcularPrecioTotal());
    this.reservacionForm.get('fecha_salida')?.valueChanges.subscribe(() => this.calcularPrecioTotal());
    this.reservacionForm.get('habitacion_id')?.valueChanges.subscribe(() => this.calcularPrecioTotal());
    
    this.reservacionForm.get('precio_total')?.valueChanges.subscribe(valor => {
      const control = this.reservacionForm.get('monto_pagado');
      if (control) {
        control.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(valor || 0)
        ]);
        control.updateValueAndValidity();
      }
    });
  }

  cargarDatos() {
    this.loadingData = true;
    
    this.huespedService.getHuespedes().subscribe({
      next: (huespedes) => {
        this.huespedes = huespedes;
        this.cargarHabitaciones();
      },
      error: (error) => {
        this.error = 'Error al cargar los huéspedes';
        this.loadingData = false;
        console.error('Error:', error);
      }
    });
  }

  cargarHabitaciones() {
    this.habitacionService.getHabitaciones().subscribe({
      next: (habitaciones) => {
        this.habitaciones = habitaciones;
        this.loadingData = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las habitaciones';
        this.loadingData = false;
        console.error('Error:', error);
      }
    });
  }

  calcularPrecioTotal() {
    const fechaEntrada = this.reservacionForm.get('fecha_entrada')?.value;
    const fechaSalida = this.reservacionForm.get('fecha_salida')?.value;
    const habitacionId = this.reservacionForm.get('habitacion_id')?.value;

    if (fechaEntrada && fechaSalida && habitacionId) {
      const entrada = new Date(fechaEntrada);
      const salida = new Date(fechaSalida);
      
      if (entrada >= salida) {
        this.precioCalculado = 0;
        this.reservacionForm.patchValue({ precio_total: 0 });
        return;
      }
      
      const diferenciaTiempo = salida.getTime() - entrada.getTime();
      const dias = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));

      if (dias > 0) {
        const habitacion = this.habitaciones.find(h => h.id == habitacionId);
        if (habitacion && habitacion.precio_habitacion) {
          const precioHabitacion = parseFloat(habitacion.precio_habitacion);
          if (!isNaN(precioHabitacion)) {
            this.precioCalculado = precioHabitacion * dias;
            this.reservacionForm.patchValue({ 
              precio_total: this.precioCalculado,
              monto_pagado: 0
            });
          }
        }
      }
    }
  }

  campoInvalido(campo: string): boolean {
    const control = this.reservacionForm.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched || this.submitted);
  }

  getMensajeError(campo: string): string {
    const control = this.reservacionForm.get(campo);
    if (!control) return '';
    if (!control.errors) return '';

    const errors = control.errors;
    
    if (errors['required']) return 'Este campo es obligatorio';
    
    if (campo === 'fecha_entrada' || campo === 'fecha_salida') {
      if (errors['min']) return 'La fecha no puede ser anterior a hoy';
    }
    
    if (campo === 'precio_total' || campo === 'monto_pagado') {
      if (errors['min']) return 'El valor no puede ser negativo';
      if (errors['max']) return 'El monto pagado no puede ser mayor al precio total';
    }
    
    if (this.reservacionForm.errors && this.reservacionForm.errors['fechaInvalida'] && 
        (campo === 'fecha_entrada' || campo === 'fecha_salida')) {
      return 'La fecha de salida debe ser posterior a la fecha de entrada';
    }
    
    return 'Campo inválido';
  }

  tieneErrorFormulario(error: string): boolean {
    return this.reservacionForm.errors !== null && this.reservacionForm.errors[error] !== undefined;
  }

  onSubmit() {
    this.submitted = true;
    
    if (this.reservacionForm.invalid) {
      this.error = 'Por favor complete correctamente todos los campos requeridos';
      return;
    }

    this.loading = true;
    this.error = null;
    
    const formValues = this.reservacionForm.value;
    
    const reservacionData = {
      fecha_entrada: formValues.fecha_entrada,
      fecha_salida: formValues.fecha_salida,
      habitacion_id: formValues.habitacion_id, 
      huesped_id: formValues.huesped_id,       
      precio_total: formValues.precio_total,
      estado_reservacion: formValues.estado_reservacion,
      metodo_pago: formValues.metodo_pago,
      monto_pagado: formValues.monto_pagado,
      estado: formValues.estado
    };
    
    this.reservacionService.nuevaReservacion(reservacionData).subscribe({
      next: (response) => {
        this.toastr.success('Reservación creada correctamente');
        this.loading = false;
        this.router.navigate(['/reservaciones']);
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al crear la reservación';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  cancelar() {
    this.router.navigate(['/reservaciones']);
  }
}