import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Chứa cả NgFor, SlicePipe...
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customers/customer';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer.html',
  styleUrls: ['./customer.css']
})
export class Customer implements OnInit {

  customers: any[] = [];
  searchKeyword: string = '';

  // --- CÁC BIẾN QUẢN LÝ MODAL (Khớp với HTML) ---
  showModal: boolean = false; // Biến bật/tắt popup
  isEditing: boolean = false; // Biến xác định đang Thêm hay Sửa
  
  // Object duy nhất dùng cho form (thay vì tách newCustomer và editingCustomer)
  currentCustomer: any = { id: 0, name: '', email: '', phone: '' };

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  // ================== LOAD ==================
  loadCustomers() {
    this.customerService.getAll().subscribe({
      next: (data) => this.customers = data,
      error: (err) => console.error('Lỗi tải dữ liệu:', err)
    });
  }

  // ================== SEARCH ==================
  search() {
    if (!this.searchKeyword.trim()) {
      this.loadCustomers();
      return;
    }

    this.customerService.search(this.searchKeyword).subscribe({
      next: (data) => this.customers = data,
      error: (err) => console.error('Lỗi tìm kiếm:', err)
    });
  }

  // ================== MODAL HANDLERS (Khớp với HTML) ==================
  
  // Hàm mở form: Dùng chung cho cả Thêm mới và Sửa
  // Trong HTML: 
  // - Nút Thêm mới gọi: openForm() -> customer là undefined
  // - Nút Sửa gọi: openForm(c) -> customer có dữ liệu
  openForm(customer?: any) {
    this.showModal = true;
    
    if (customer) {
      // Chế độ Sửa
      this.isEditing = true;
      this.currentCustomer = { ...customer }; // Copy object để không sửa trực tiếp trên bảng
    } else {
      // Chế độ Thêm mới
      this.isEditing = false;
      this.currentCustomer = { id: 0, name: '', email: '', phone: '' }; // Reset form
    }
  }

  // Hàm đóng form
  closeForm() {
    this.showModal = false;
  }

  // ================== SAVE (CREATE / UPDATE) ==================
  // Trong HTML gọi: saveCustomer()
  saveCustomer() {
    // Validate đơn giản
    if (!this.currentCustomer.name) {
      alert('Vui lòng nhập tên khách hàng!');
      return;
    }

    if (this.isEditing) {
      // --- LOGIC CẬP NHẬT (UPDATE) ---
      this.customerService.update(this.currentCustomer.id, this.currentCustomer).subscribe({
        next: () => {
          this.loadCustomers(); // Tải lại danh sách
          this.closeForm();     // Đóng modal
          // alert('Cập nhật thành công!');
        },
        error: (err) => console.error('Lỗi cập nhật:', err)
      });
    } else {
      // --- LOGIC TẠO MỚI (CREATE) ---
      // Loại bỏ ID giả (nếu backend tự sinh ID)
      const { id, ...payload } = this.currentCustomer; 
      
      this.customerService.create(payload).subscribe({
        next: () => {
          this.loadCustomers(); // Tải lại danh sách
          this.closeForm();     // Đóng modal
          // alert('Thêm mới thành công!');
        },
        error: (err) => console.error('Lỗi tạo mới:', err)
      });
    }
  }

  // ================== DELETE ==================
  deleteCustomer(id: number) {
    if (confirm('Bạn có chắc muốn xóa khách hàng này?')) {
      this.customerService.delete(id).subscribe({
        next: () => {
          this.loadCustomers();
          // Nếu đang mở form của đúng user vừa xóa thì đóng lại luôn
          if (this.showModal && this.currentCustomer.id === id) {
            this.closeForm();
          }
        },
        error: (err) => console.error('Lỗi xóa:', err)
      });
    }
  }
}