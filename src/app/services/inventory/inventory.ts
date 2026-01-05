import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Product } from '../../page/inventory/inventory';
import { Suppliers } from '../../page/inventory/inventory';
import { ImportOrder } from '../../page/inventory/inventory';
@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private apiUrl = 'http://localhost:8080/api/products';
  private apiUrl_1 = 'http://localhost:8080/api/suppliers'
  private apiUrl_2 = 'http://localhost:8080/api/import-orders';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    const token = localStorage.getItem('jwt'); // Lấy token JWT từ localStorage

    if (!token) {
      console.error('JWT token not found! Please login first.');
      return throwError(() => new Error('JWT token not found'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Product[]>(this.apiUrl, { headers });
  }

  getSuppliers(): Observable<Suppliers[]> {
    const token = localStorage.getItem('jwt'); // Lấy token JWT từ localStorage

    if (!token) {
      console.error('JWT token not found! Please login first.');
      return throwError(() => new Error('JWT token not found'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Suppliers[]>(this.apiUrl_1, { headers });
  }
  getImportOrder (): Observable<ImportOrder[]> {
    const token = localStorage.getItem('jwt'); // Lấy token JWT từ localStorage

    if (!token) {
      console.error('JWT token not found! Please login first.');
      return throwError(() => new Error('JWT token not found'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ImportOrder[]>(this.apiUrl_2, { headers });
  }
  importProduct(data: any): Observable<any> {
  const token = localStorage.getItem('jwt');

  if (!token) {
    console.error('JWT token not found! Please login first.');
    return throwError(() => new Error('JWT token not found'));
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  return this.http.post(`${this.apiUrl_2}`, data, { headers });
}

}
