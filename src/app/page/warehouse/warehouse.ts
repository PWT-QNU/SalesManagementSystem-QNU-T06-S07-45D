import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/products/product'; // Giả sử bạn đã có
import { WarehouseService } from '../../services/warehouse/warehouse';

// Thêm biến để tracking loại hành động hiện tại
export type TransactionType = 'IMPORT' | 'EXPORT';

@Component({
  selector: 'app-warehouse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './warehouse.html',
  styleUrls: ['./warehouse.css']
})
export class WarehouseComponent implements OnInit {

  products: any[] = [];
  filteredProducts: any[] = [];
  searchKeyword: string = '';
  // Biến trạng thái cho Modal
  currentTransactionType: TransactionType = 'IMPORT';

  // --- MODAL VARIABLES ---
  showHistoryModal: boolean = false;
  showAdjustModal: boolean = false;

  selectedProduct: any = null;
  logs: any[] = []; // Chứa lịch sử của sp đang chọn

  // Form điều chỉnh
  adjustForm = {
    quantity: 1,
    note: '',
  };

  constructor(
    private productService: ProductService,
    private warehouseService: WarehouseService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  // 1. Tải danh sách sản phẩm để xem tồn kho
  loadProducts() {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
      },
      error: (err) => console.error(err)
    });
  }

  // 2. Tìm kiếm
  search() {
    const term = this.searchKeyword.toLowerCase();
    this.filteredProducts = this.products.filter(p => 
      p.name.toLowerCase().includes(term)
    );
  }

  // 3. Xem lịch sử
  openHistory(product: any) {
    this.selectedProduct = product;
    this.warehouseService.getHistory(product.id).subscribe({
      next: (data) => {
        this.logs = data;
        this.showHistoryModal = true;
      },
      error: (err) => alert('Không tải được lịch sử')
    });
  }

  // 4. Mở form điều chỉnh kho
  openAdjust(product: any, type: TransactionType) {
    this.selectedProduct = product;
    this.currentTransactionType = type;
    
    // Reset form
    this.adjustForm = { 
      quantity: 1, 
      note: '' 
    };
    
    this.showAdjustModal = true;
  }

  // 5. Submit điều chỉnh
  submitAdjust() {
    if (!this.adjustForm.quantity || this.adjustForm.quantity <= 0) {
      alert('Số lượng phải lớn hơn 0');
      return;
    }

    // Logic quan trọng:
    // Nếu là IMPORT -> Số lượng DƯƠNG
    // Nếu là EXPORT -> Số lượng ÂM
    let finalQty = this.adjustForm.quantity;
    if (this.currentTransactionType === 'EXPORT') {
      finalQty = -finalQty;
    }

    // Tạo ghi chú tự động nếu người dùng không nhập
    let autoNote = this.adjustForm.note;
    if (!autoNote) {
      autoNote = this.currentTransactionType === 'IMPORT' 
        ? 'Nhập kho thủ công' 
        : 'Xuất kho thủ công';
    }

    const payload = {
      productId: this.selectedProduct.id,
      quantity: finalQty,
      note: autoNote
    };

    this.warehouseService.adjustStock(payload).subscribe({
      next: () => {
        // Thông báo đẹp hơn
        const actionName = this.currentTransactionType === 'IMPORT' ? 'Nhập' : 'Xuất';
        alert(`${actionName} kho thành công!`);
        
        this.loadProducts(); // Load lại bảng
        this.showAdjustModal = false;
      },
      error: (err) => {
        console.error(err);
        alert('Có lỗi xảy ra, vui lòng thử lại.');
      }
    });
  }

  // Helper: Đổi màu badge loại giao dịch
  getTypeClass(type: string): string {
    switch(type) {
      case 'IMPORT': return 'badge-success'; // Xanh lá
      case 'SALE': return 'badge-info';      // Xanh dương
      case 'DAMAGED': return 'badge-danger'; // Đỏ
      case 'ADJUSTMENT': return 'badge-warning'; // Cam
      default: return 'badge-default';
    }
  }

  closeModals() {
    this.showHistoryModal = false;
    this.showAdjustModal = false;
  }
}