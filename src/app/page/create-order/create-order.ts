import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

// Services
import { ProductService } from '../../services/products/product';
import { SalesOrderService } from '../../services/sales_orders/sales-order';
import { CustomerService } from '../../services/customers/customer';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './create-order.html',
  styleUrls: ['./create-order.css']
})
export class CreateOrderComponent implements OnInit, OnDestroy {
  // Data
  products: any[] = [];
  filteredProducts: any[] = [];
  customers: any[] = [];
  
  // [MỚI] Biến chứa dữ liệu in
  invoiceData: any = null;
  
  // UI
  searchKeyword: string = '';
  currentTime: Date = new Date();
  timeInterval: any;

  // Cart
  cart: any[] = [];
  selectedCustomerId: number | null = null;
  selectedPaymentMethod: string = 'cash';

  constructor(
    private productService: ProductService,
    private salesOrderService: SalesOrderService,
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCustomers();
    
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timeInterval) clearInterval(this.timeInterval);
  }

  // --- [LOGIC IN HÓA ĐƠN] ---
  printInvoice() {
    if (this.cart.length === 0) {
      alert('Giỏ hàng trống, không thể in!');
      return;
    }

    // 1. Tìm tên khách hàng
    const customer = this.customers.find(c => c.id == this.selectedCustomerId);

    // 2. Chuẩn bị dữ liệu cho mẫu in
    this.invoiceData = {
      orderId: 'ORD-' + Math.floor(Math.random() * 100000), // Mã giả lập hoặc lấy từ DB nếu đã lưu
      customerName: customer ? customer.name : 'Khách lẻ',
      date: new Date(),
      items: [...this.cart], // Copy danh sách hàng
      totalAmount: this.totalAmount,
      paymentMethod: this.selectedPaymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'
    };

    // 3. Gọi lệnh in sau khi Angular render xong (100ms)
    setTimeout(() => {
      window.print();
    }, 100);
  }

  // --- TẢI DỮ LIỆU ---
  loadProducts() {
    this.productService.getAll().subscribe({
      next: (data) => {
        // Map dữ liệu để đảm bảo field 'stockQuantity' luôn có giá trị
        this.products = data.map(p => ({
            ...p,
            stockQuantity: p.stockQuantity || p.quantity || p.stock || 0 
        }));
        this.filteredProducts = [...this.products];
      },
      error: (err) => console.error('Lỗi tải sản phẩm:', err)
    });
  }

  loadCustomers() {
    this.customerService.getAll().subscribe({
      next: (data) => {
        this.customers = data;
        if (this.customers.length > 0) this.selectedCustomerId = this.customers[0].id;
      }
    });
  }

  // --- TÌM KIẾM ---
  onSearch() {
    const keyword = this.searchKeyword.toLowerCase().trim();
    if (!keyword) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(p => 
        p.name.toLowerCase().includes(keyword) || 
        (p.category && p.category.name.toLowerCase().includes(keyword))
      );
    }
  }

  // --- GIỎ HÀNG ---
  addToCart(product: any) {
    if (product.stockQuantity <= 0) {
      alert('Sản phẩm đã hết hàng!');
      return;
    }

    const existingItem = this.cart.find(item => item.product.id === product.id);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;

    if (currentQtyInCart + 1 > product.stockQuantity) {
      alert(`Chỉ còn ${product.stockQuantity} sản phẩm trong kho.`);
      return;
    }

    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({
        product: product,
        quantity: 1,
        price: product.price
      });
    }
  }

  updateQuantity(item: any, change: number) {
    const newQty = item.quantity + change;
    if (newQty < 1) return;

    if (change > 0 && newQty > item.product.stockQuantity) {
      alert(`Kho không đủ hàng!`);
      return;
    }
    item.quantity = newQty;
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
  }

  get totalAmount(): number {
    return this.cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }

  get totalItems(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // --- THANH TOÁN ---
  submitOrder() {
    if (this.cart.length === 0) return;
    if (!this.selectedCustomerId) {
      alert('Chưa chọn khách hàng!');
      return;
    }

    const orderPayload = {
      customerId: this.selectedCustomerId,
      paymentMethod: this.selectedPaymentMethod,
      totalAmount: this.totalAmount,
      status: 'completed',
      items: this.cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    this.salesOrderService.createOrder(orderPayload).subscribe({
      next: (res) => {
        this.handleStockUpdateAndFinish();
      },
      error: (err) => {
        console.error(err);
        alert('Lỗi khi thanh toán!');
      }
    });
  }

  handleStockUpdateAndFinish() {
    const updateTasks = this.cart.map(item => {
      const currentStock = Number(item.product.stock || item.product.stockQuantity || 0);
      const quantityToDeduct = Number(item.quantity);
      const newStock = currentStock - quantityToDeduct;

      const updatedProduct = { 
        ...item.product, 
        stock: newStock, 
        stockQuantity: newStock 
      };

      return this.productService.update(item.product.id, updatedProduct);
    });

    forkJoin(updateTasks).subscribe({
      next: (results) => {
        alert('Thanh toán và trừ kho thành công!');
        this.cart = [];
        setTimeout(() => { this.loadProducts(); }, 500);
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật kho:', err);
        alert('Lỗi cập nhật kho!');
      }
    });
  }

  cancel() {
    if(confirm('Hủy bỏ đơn hàng hiện tại?')) {
      this.cart = [];
    }
  }
}