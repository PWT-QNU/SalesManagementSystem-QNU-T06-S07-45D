import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Services } from '../../services';

export interface Supplier {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

@Component({
  selector: 'app-supplier',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './supplier.html',
  styleUrl: './supplier.css'
})
export class SupplierComponent {
  suppliers: Supplier[] = [];
  newSupplier: Supplier = { name: '' };
  showModal: boolean = false;
  searchText: string = '';
  filteredSuppliers: Supplier[] = [];


  constructor(private services: Services, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.http.get<Supplier[]>(`${this.services.apiUrl}/api/suppliers`)
      .subscribe({
        next: data => {
          this.suppliers = data;
          this.filteredSuppliers = data; // hiển thị danh sách ban đầu
        },
        error: err => console.error('Lỗi khi load suppliers', err)
      });
  }

  filterSuppliers(): void {
    const text = this.searchText.toLowerCase();

    this.filteredSuppliers = this.suppliers.filter(s =>
      s.name.toLowerCase().includes(text) ||
      (s.email?.toLowerCase().includes(text)) ||
      (s.phone?.toLowerCase().includes(text)) ||
      (s.address?.toLowerCase().includes(text))
    );
  }


  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  addSupplier(form: NgForm): void {
    if (!this.newSupplier.name) return;

    this.http.post<Supplier>(`${this.services.apiUrl}/api/suppliers`, this.newSupplier)
      .subscribe({
        next: () => {
          this.newSupplier = { name: '' };
          form.resetForm();
          this.showModal = false;
          this.loadSuppliers();
        },
        error: err => console.error('Lỗi thêm supplier', err)
      });
  }

  deleteSupplier(id: number): void {
    if (!confirm('Bạn có chắc muốn xóa nhà cung cấp này không?')) return;

    this.http.delete<void>(`${this.services.apiUrl}/api/suppliers/${id}`)
      .subscribe({
        next: () => this.loadSuppliers(),
        error: err => console.error('Lỗi khi xóa supplier', err)
      });
  }
}

