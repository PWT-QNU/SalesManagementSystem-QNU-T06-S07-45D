import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Supplier {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private apiUrl = 'http://localhost:8080/api/suppliers';

  constructor(private http: HttpClient) { }

  // Helper để lấy Header chứa Token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAll(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  create(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, supplier, { headers: this.getHeaders() });
  }

  update(id: number, supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/${id}`, supplier, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}