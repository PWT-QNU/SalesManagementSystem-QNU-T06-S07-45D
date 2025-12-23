import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Supplier, SupplierService } from '../../services/suppliers/supplier';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliers.html',
  styleUrls: ['./suppliers.css']
})
export class SuppliersComponent implements OnInit {

  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  searchKeyword: string = '';

  // --- MODAL VARIABLES ---
  showModal: boolean = false;
  isEditing: boolean = false;
  
  // Object dùng cho Form
  currentSupplier: Supplier = { id: 0, name: '', phone: '', email: '', address: '' };

  constructor(private supplierService: SupplierService) {}

  ngOnInit() {
    this.loadSuppliers();
  }

  // 1. Tải danh sách
  loadSuppliers() {
    this.supplierService.getAll().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.filteredSuppliers = data;
        this.search(); // Áp dụng filter nếu đang có từ khóa
      },
      error: (err) => console.error('Lỗi tải NCC:', err)
    });
  }

  // 2. Tìm kiếm
  search() {
    const term = this.searchKeyword.toLowerCase();
    if (!term) {
      this.filteredSuppliers = [...this.suppliers];
    } else {
      this.filteredSuppliers = this.suppliers.filter(s => 
        s.name.toLowerCase().includes(term) ||
        (s.phone && s.phone.includes(term)) ||
        (s.email && s.email.toLowerCase().includes(term))
      );
    }
  }

  // 3. Mở Form (Thêm/Sửa)
  openForm(supplier?: Supplier) {
    this.showModal = true;
    if (supplier) {
      this.isEditing = true;
      this.currentSupplier = { ...supplier };
    } else {
      this.isEditing = false;
      this.currentSupplier = { id: 0, name: '', phone: '', email: '', address: '' };
    }
  }

  closeForm() {
    this.showModal = false;
  }

  // 4. Lưu dữ liệu
  saveSupplier() {
    if (!this.currentSupplier.name) {
      alert('Tên nhà cung cấp là bắt buộc!');
      return;
    }

    if (this.isEditing) {
      // Cập nhật
      this.supplierService.update(this.currentSupplier.id, this.currentSupplier).subscribe({
        next: () => {
          this.loadSuppliers();
          this.closeForm();
        },
        error: (err) => alert('Lỗi cập nhật: ' + err.message)
      });
    } else {
      // Tạo mới
      // Loại bỏ ID (thường là 0) để backend tự sinh
      const { id, ...payload } = this.currentSupplier;
      this.supplierService.create(payload as Supplier).subscribe({
        next: () => {
          this.loadSuppliers();
          this.closeForm();
        },
        error: (err) => alert('Lỗi tạo mới: ' + err.message)
      });
    }
  }

  // 5. Xóa
  deleteSupplier(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
      this.supplierService.delete(id).subscribe({
        next: () => {
          this.loadSuppliers();
        },
        error: (err) => alert('Không thể xóa NCC này (có thể do ràng buộc dữ liệu).')
      });
    }
  }
}