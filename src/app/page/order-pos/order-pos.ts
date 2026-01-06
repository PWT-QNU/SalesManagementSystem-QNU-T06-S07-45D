import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Bao gồm NgFor, NgClass, DatePipe...
import { FormsModule } from '@angular/forms';
import { Services } from '../../services';
import { RouterLink, RouterModule } from '@angular/router';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  
  invoiceData: Order | null = null;

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

  // ================== EXPORT EXCEL ==================
  exportToExcel() {
    // 1. Chuẩn bị dữ liệu cho Excel (làm phẳng object)
    const dataToExport = this.filteredOrders.map((order, index) => ({
      STT: index + 1,
      'Mã Đơn': `#${order.id}`,
      'Khách Hàng': order.customer.name,
      'Ngày Tạo': new Date(order.orderDate).toLocaleDateString('vi-VN'),
      'Phương Thức': order.paymentMethod === 'cash' ? 'Tiền mặt' : 
                     order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 
                     order.paymentMethod === 'ewallet' ? 'Ví điện tử' : '---',
      'Tổng Tiền': order.totalAmount,
      'Trạng Thái': order.status === 'pending' ? 'Chờ thanh toán' : 
                    order.status === 'completed' ? 'Đã thanh toán' : 'Đã hủy'
    }));

    // 2. Tạo WorkSheet và WorkBook
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách đơn hàng');

    // 3. Xuất file
    XLSX.writeFile(wb, `DS_DonHang_${new Date().getTime()}.xlsx`);
  }

  // ================== EXPORT PDF ==================
  exportToPDF() {
    const doc = new jsPDF();

    // Tiêu đề
    doc.setFontSize(18);
    doc.text('Danh Sách Đơn Hàng', 14, 20);
    doc.setFontSize(10);
    doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 14, 28);

    // Chuẩn bị dữ liệu bảng
    const head = [['STT', 'Mã Đơn', 'Khách Hàng', 'Ngày Tạo', 'Tổng Tiền', 'Trạng Thái']];
    const body = this.filteredOrders.map((order, index) => [
      index + 1,
      `#${order.id}`,
      order.customer.name,
      new Date(order.orderDate).toLocaleDateString('vi-VN'),
      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount),
      order.status === 'pending' ? 'Chờ thanh toán' : 
      order.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'
    ]);

    // Vẽ bảng
    autoTable(doc, {
      head: head,
      body: body,
      startY: 35,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9 },
      headStyles: { fillColor: [112, 114, 248] } // Màu tím giống theme của bạn
    });

    // Xuất file
    doc.save(`DS_DonHang_${new Date().getTime()}.pdf`);
  }

  printInvoice(order: Order) {
    this.invoiceData = order;

    // Sử dụng setTimeout để đảm bảo Angular đã render xong dữ liệu vào mẫu in thì mới gọi window.print
    setTimeout(() => {
      window.print();
    }, 100);
  }
}