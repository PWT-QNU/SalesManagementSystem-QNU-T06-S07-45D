import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:8080/api/categories';

  constructor(private http: HttpClient) {}

  private authHeader() {
    const token = localStorage.getItem('jwt');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getAll() {
    return this.http.get<any[]>(this.apiUrl, this.authHeader());
  }

  getProductsByCategory(id: number) {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/products`, this.authHeader());
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

}
