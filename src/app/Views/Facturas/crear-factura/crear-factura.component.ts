import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FacturasService } from '../../../core/services/Facturas/facturas.service';
import { ReservacionesService } from '../../../core/services/Reservaciones/reservaciones.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Reservacion } from '../../../core/models/reservacion';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-crear-factura',
  templateUrl: './crear-factura.component.html',
  styleUrls: ['./crear-factura.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CrearFacturaComponent implements OnInit {
  facturaForm!: FormGroup;
  reservaciones: Reservacion[] = [];
  loading: boolean = false;
  loadingData: boolean = true;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private facturaService: FacturasService,
    private reservacionService: ReservacionesService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario es administrador
    if (!this.isAdmin()) {
      this.toastr.warning('No tienes permiso para acceder a esta página');
      this.router.navigate(['/facturas']);
      return;
    }

    this.initForm();
    this.cargarReservaciones();
  }

  // Verificar si el usuario es administrador
  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return Number(userRole) === 2;
  }

  private initForm(): void {
    this.facturaForm = this.fb.group({
      reservacion_id: ['', [Validators.required]],
      metodo_pago: ['', [Validators.required]],
      monto_pagado: ['', [Validators.required, Validators.min(0)]],
      estado: ['Pendiente', [Validators.required]]
    });
  }

  cargarReservaciones(): void {
    this.loadingData = true;
    
    this.reservacionService.todaslasreservaciones().subscribe({
      next: (reservaciones) => {
        this.reservaciones = reservaciones;
        this.loadingData = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las reservaciones';
        this.loadingData = false;
        console.error('Error:', error);
        this.toastr.error(this.error);
      }
    });
  }

  onSubmit(): void {
    if (this.facturaForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.facturaForm.controls).forEach(key => {
        this.facturaForm.get(key)?.markAsTouched();
      });
      
      this.toastr.warning('Por favor completa todos los campos requeridos');
      return;
    }

    this.loading = true;
    
    const facturaData = this.facturaForm.value;
    
    this.facturaService.crearFactura(facturaData).subscribe({
      next: () => {
        this.toastr.success('Factura creada correctamente');
        this.loading = false;
        this.router.navigate(['/facturas']);
      },
      error: (error) => {
        this.error = 'Error al crear la factura';
        this.loading = false;
        console.error('Error:', error);
        this.toastr.error(error.error?.message || this.error);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/facturas']);
  }
}