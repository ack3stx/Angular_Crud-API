import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
    // Verificar si el usuario es administrador, sino redirigir
    if (!this.isAdmin()) {
      this.toastr.warning('No tienes permiso para acceder a esta página');
      this.router.navigate(['/reservaciones']);
      return;
    }
    
    this.initForm();
    this.cargarDatos();
  }

  // Verificar si el usuario es administrador
  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 2;
  }

  private initForm() {
    this.reservacionForm = this.fb.group({
      fecha_entrada: ['', [Validators.required]],
      fecha_salida: ['', [Validators.required]],
      habitacion_id: ['', [Validators.required]],
      huesped_id: ['', [Validators.required]],
      precio_total: [0, [Validators.required, Validators.min(0)]],
      estado_reservacion: ['Pendiente', [Validators.required]],
      metodo_pago: ['', [Validators.required]],
      monto_pagado: [0, [Validators.required, Validators.min(0)]],
      estado: ['Activo'] // Por defecto
    });

    // Observadores para calcular automáticamente el precio total
    this.reservacionForm.get('fecha_entrada')?.valueChanges.subscribe(() => this.calcularPrecioTotal());
    this.reservacionForm.get('fecha_salida')?.valueChanges.subscribe(() => this.calcularPrecioTotal());
    this.reservacionForm.get('habitacion_id')?.valueChanges.subscribe(() => this.calcularPrecioTotal());
  }

  cargarDatos() {
    this.loadingData = true;
    
    // Cargar huéspedes
    this.huespedService.getHuespedes().subscribe({
      next: (huespedes) => {
        this.huespedes = huespedes;
        this.cargarHabitaciones();
      },
      error: (error) => {
        this.error = 'Error al cargar los huéspedes';
        this.loadingData = false;
        console.error('Error:', error);
        this.toastr.error(this.error);
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
        this.toastr.error(this.error);
      }
    });
  }

  calcularPrecioTotal() {
    const fechaEntrada = this.reservacionForm.get('fecha_entrada')?.value;
    const fechaSalida = this.reservacionForm.get('fecha_salida')?.value;
    const habitacionId = this.reservacionForm.get('habitacion_id')?.value;

    if (fechaEntrada && fechaSalida && habitacionId) {
      // Calcular número de días
      const entrada = new Date(fechaEntrada);
      const salida = new Date(fechaSalida);
      const diferenciaTiempo = salida.getTime() - entrada.getTime();
      const dias = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));

      if (dias > 0) {
        // Buscar precio de la habitación
        const habitacion = this.habitaciones.find(h => h.id == habitacionId);
        if (habitacion && habitacion.precio_habitacion) {
          // Convertir el precio de string a number para evitar error de tipos
          const precioHabitacion = parseFloat(habitacion.precio_habitacion);
          if (!isNaN(precioHabitacion)) {
            this.precioCalculado = precioHabitacion * dias;
            this.reservacionForm.patchValue({ precio_total: this.precioCalculado });
          }
        }
      }
    }
  }

  onSubmit() {
    if (this.reservacionForm.invalid) {
      this.toastr.warning('Por favor complete todos los campos requeridos');
      
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.reservacionForm.controls).forEach(key => {
        this.reservacionForm.get(key)?.markAsTouched();
      });
      
      return;
    }

    this.loading = true;
    
    // Obtener los valores del formulario
    const formValues = this.reservacionForm.value;
    
    // Crear nuevo objeto reservación con los mismos nombres de la API
    const reservacionData = {
      fecha_entrada: formValues.fecha_entrada,
      fecha_salida: formValues.fecha_salida,
      habitacion_id: formValues.habitacion_id, // Usar el nombre que espera la API
      huesped_id: formValues.huesped_id,       // Usar el nombre que espera la API
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
        this.error = 'Error al crear la reservación';
        this.loading = false;
        console.error('Error:', error);
        this.toastr.error(error.error?.message || this.error);
      }
    });
  }

  cancelar() {
    this.router.navigate(['/reservaciones']);
  }
}