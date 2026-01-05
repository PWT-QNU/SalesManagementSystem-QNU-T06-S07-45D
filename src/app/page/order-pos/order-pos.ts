import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Bao gồm NgFor, NgClass, DatePipe...
import { FormsModule } from '@angular/forms';
import { Services } from '../../services';
import { RouterLink, RouterModule } from '@angular/router';

// --- INTERFACES ---
export interface OrderItem {
  product: { name: string; category: { name: string }; price: number };
  quantity: number;
}

export interface Order {
  id: number;
  customer: { id: number; name: string; phone?: string };
  totalAmount: number;
  status: string; // 'pending' | 'completed' | 'cancelled'
  items: OrderItem[];
  orderDate: string;
  paymentMethod?: string;
}

@Component({
  selector: 'app-order-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // HttpClientModule thường import ở app.config hoặc main.ts
  templateUrl: './order-pos.html',
  styleUrls: ['./order-pos.css']
})
export class OrderPos implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchTerm: string = '';
  
  // Modal Variables
  selectedOrder: Order | null = null;       // Cho modal thanh toán
  selectedDetailOrder: Order | null = null; // Cho modal chi tiết
  selectedPaymentMethod: string = 'cash';

  constructor(private services: Services, private http: HttpClient) {}

  ngOnInit() {
    this.loadOrders();
  }

  // ================== DATA LOADING ==================
  loadOrders() {
    const token = localStorage.getItem('jwt');
    this.http.get<Order[]>(`${this.services.apiUrl}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        // Tính toán lại totalAmount cho chắc chắn (nếu backend chưa tính)
        this.orders = data.map(order => ({
          ...order,
          totalAmount: (order.items || []).reduce((sum, item) => sum + (item.quantity * item.product.price), 0)
        }));
        
        // Sắp xếp đơn mới nhất lên đầu
        this.orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

        this.filteredOrders = [...this.orders];
        this.applyFilter();
      },
      error: (err) => console.error('Error fetching orders:', err)
    });
  }

  // ================== SEARCH & FILTER ==================
  search() {
    this.applyFilter();
  }

  private applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(order =>
        order.customer.name.toLowerCase().includes(term) ||
        (order.customer.phone && order.customer.phone.includes(term))
      );
    }
  }

  // Helper cho CSS Class của trạng thái
  getStatusClass(status: string): string {
    switch(status.toLowerCase()) {
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      case 'pending': return 'pending';
      default: return '';
    }
  }

  // ================== PAYMENT MODAL ==================
  openPaymentModal(order: Order) {
    this.selectedOrder = order;
    this.selectedPaymentMethod = 'cash'; // Reset về mặc định
  }

  closeModal() {
    this.selectedOrder = null;
  }

  confirmPayment() {
    if (!this.selectedOrder) return;

    const token = localStorage.getItem('jwt');
    const apiUrl = `${this.services.apiUrl}/api/orders/${this.selectedOrder.id}/pay`;
    const params = {
      amount: this.selectedOrder.totalAmount,
      method: this.selectedPaymentMethod
    };

    this.http.post(apiUrl, null, {
      headers: { Authorization: `Bearer ${token}` },
      params: params as any
    }).subscribe({
      next: () => {
        // alert('Thanh toán thành công!'); // Có thể bỏ alert nếu thích UX mượt
        this.closeModal();
        this.loadOrders(); // Tải lại để cập nhật trạng thái
      },
      error: (err) => {
        console.error(err);
        alert('Lỗi thanh toán. Vui lòng thử lại.');
      }
    });
  }

  // ================== DETAIL MODAL ==================
  openDetailModal(order: Order) {
    this.selectedDetailOrder = order;
  }

  closeDetailModal() {
    this.selectedDetailOrder = null;
  }
}