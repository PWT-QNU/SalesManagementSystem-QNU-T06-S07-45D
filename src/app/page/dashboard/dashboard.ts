import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // [1] Import CommonModule
import { forkJoin } from 'rxjs';

// [2] Import Chart components
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, Chart, registerables } from 'chart.js';

// Import Services
import { SalesOrderService } from '../../services/sales_orders/sales-order'; 
import { CustomerService } from '../../services/customers/customer';
import { ProductService } from '../../services/products/product'; 

@Component({
  selector: 'app-dashboard',
  standalone: true, // [3] Bắt buộc cho Standalone
  imports: [
    CommonModule,       // Để dùng pipe số tiền (1.0-0)
    BaseChartDirective  // Để vẽ <canvas baseChart>
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  conversionRate: number = 0;
  kpis = {
    revenue: 0,
    orders: 0,
    customers: 0,
    stock: 0
  };

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'], // Viết tắt cho gọn
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0],
        label: 'Doanh thu',
        fill: true,
        tension: 0.4,
        borderColor: '#5a7bd4',
        backgroundColor: 'rgba(90, 123, 212, 0.2)'
      }
    ]
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false, // [4] Thêm dòng này để chart không bị méo trên mobile
    plugins: { legend: { display: false } }
  };

  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Hoàn thành', 'Chưa hoàn thành'],
    datasets: [{ data: [30, 70], backgroundColor: ['#28a745', '#eeeeee'], borderWidth: 0 }]
  };
  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '70%',
    plugins: { legend: { display: false } }
  };

  constructor(
    private salesOrderService: SalesOrderService,
    private customerService: CustomerService,
    private productService: ProductService
  ) { 
    // [5] CỰC KỲ QUAN TRỌNG: Đăng ký các thành phần vẽ biểu đồ
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData() {
  forkJoin({
    orders: this.salesOrderService.getAll(),
    customers: this.customerService.getAll(),
    products: this.productService.getAll()
  }).subscribe({
    next: (res: any) => {
      const orders = res.orders || [];
      
      // 1. Cập nhật các thẻ KPI (Giữ nguyên)
      this.kpis.orders = orders.length;
      this.kpis.revenue = orders.reduce((sum: number, order: any) => sum + (Number(order.totalAmount) || 0), 0);
      this.kpis.customers = (res.customers || []).length;
      const products = res.products || [];
      this.kpis.stock = products.reduce((sum: number, p: any) => sum + (Number(p.stock || p.stockQuantity) || 0), 0);

      // 2. [MỚI] Xử lý dữ liệu biểu đồ theo 12 tháng thực tế
      // Tạo mảng 12 phần tử có giá trị ban đầu là 0 (Tương ứng T1 -> T12)
      const monthlyRevenue = new Array(12).fill(0);

      orders.forEach((order: any) => {
        if (order.orderDate) {
          const date = new Date(order.orderDate);
          const month = date.getMonth(); // Hàm này trả về 0 (Tháng 1) -> 11 (Tháng 12)
          
          // Cộng dồn tiền vào tháng tương ứng
          monthlyRevenue[month] += (Number(order.totalAmount) || 0);
        }
      });

      // 3. Cập nhật lại nhãn (Labels) cho đủ 12 tháng
      this.lineChartData.labels = [
        'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 
        'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
      ];

      // 4. Gán dữ liệu thật vào biểu đồ
      this.lineChartData.datasets[0].data = monthlyRevenue;
      // TÍNH TỶ LỆ CHUYỂN ĐỔI (Dựa trên trạng thái đơn hàng)
        if (orders.length > 0) {
          // Đếm số đơn thành công. 
          const successOrders = orders.filter((o: any) => 
              o.status === 'paid' || o.status === 'completed'
          ).length;

          this.conversionRate = (successOrders / orders.length) * 100;
        } else {
          this.conversionRate = 0;
        }

        // Cập nhật dữ liệu vào biểu đồ tròn
        // [Phần trăm thành công, Phần trăm còn lại]
        this.doughnutChartData.datasets[0].data = [
            this.conversionRate, 
            100 - this.conversionRate
        ];

      // Trigger để biểu đồ vẽ lại
      this.lineChartData = { ...this.lineChartData };
    },
    error: (err) => console.error('Lỗi:', err)
  });
}
}