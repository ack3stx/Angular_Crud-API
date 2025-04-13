import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auditoria } from '../../models/auditoria';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {

  private url = environment.apiUrl + '/v1/auditoria';


  constructor(private http: HttpClient) { }

  getAuditorias(): Observable<Auditoria[]> {
    return this.http.get<Auditoria[]>(this.url);
  }
}