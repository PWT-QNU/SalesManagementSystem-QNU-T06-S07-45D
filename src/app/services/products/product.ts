import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  private authHeader() {
    const token = localStorage.getItem('jwt');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.authHeader());
  }

  create(data: any) {
    return this.http.post(this.apiUrl, data, this.authHeader());
  }

  update(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data, this.authHeader());
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, this.authHeader());
  }

  search(keyword: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search?keyword=${keyword}`, this.authHeader());
  }
}
