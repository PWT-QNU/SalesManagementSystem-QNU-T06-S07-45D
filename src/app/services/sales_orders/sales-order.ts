import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalesOrderService {
  private apiUrl = 'http://localhost:8080/api/orders'; 

  constructor(private http: HttpClient) { }

  private authHeader() {
    const token = localStorage.getItem('jwt'); 
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  createOrder(orderData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, orderData, this.authHeader());
  }

  // Hàm lấy danh sách tất cả đơn hàng
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.authHeader());
  }
}