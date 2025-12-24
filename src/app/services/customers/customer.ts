import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private apiUrl = 'http://localhost:8080/api/customers';

  constructor(private http: HttpClient) {}

  private authHeader() {
    const token = localStorage.getItem('jwt');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  // GET ALL
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.authHeader());
  }

  // SEARCH
  search(keyword: string) {
  return this.http.get<any[]>(`${this.apiUrl}/search?keyword=${keyword}`, this.authHeader());
}

  // CREATE
  create(customer: any): Observable<any> {
    return this.http.post(this.apiUrl, customer, this.authHeader());
  }

  // UPDATE
  update(id: number, customer: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, customer, this.authHeader());
  }

  // DELETE
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.authHeader());
  }
}
