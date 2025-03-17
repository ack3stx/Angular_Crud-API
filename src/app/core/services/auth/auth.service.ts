import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginCredentials } from '../../models/login-credentials';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;     // ID del usuario
  rol?: string;    // Rol del usuario
  exp: number;     // Tiempo de expiración
  iat: number;     // Issued at
  iss: string;     // Issuer
  jti: string;     // JWT ID
  nbf: number;     // Not before
  prv: string;     // Provider
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/v1';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginCredentials): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap(async (response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          const role = this.getUserRole();
          console.log('Role detectado:', role, typeof role); // Debug tipo
          
          if (Number(role) === 3) {
            console.log('Intentando navegar a admin dashboard...'); // Debug navegación
            try {
              const result = await this.router.navigateByUrl('/admin/dashboard2');
              console.log('Navegación exitosa?', result);
            } catch (error) {
              console.error('Error en navegación:', error);
            }
          } else {
            await this.router.navigateByUrl('/welcome');
          }
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (decoded.exp) {
        return decoded.exp * 1000 > Date.now();
      }
      return false;
    } catch {
      return false;
    }
  }

  getUserRole(): number {
    const token = localStorage.getItem('token');
    if (!token) return 0;
  
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log('Token decodificado:', decoded); // Debug
      const roleNumber = Number(decoded.rol);
      console.log('Rol convertido a número:', roleNumber); // Debug
      return roleNumber || 0;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return 0;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  verifyEmail(data: { code: string, token: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificar`, data);
  }


}