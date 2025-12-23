import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Services } from '../../services'; // File config chứa apiUrl

export interface AdjustStockRequest {
  productId: number;
  quantity: number;
  note: string;
  // Để đơn giản, ta sẽ gửi kèm type ở đây nếu backend bạn mở rộng, 
  // hoặc xử lý logic type trong component rồi gọi endpoint tương ứng.
  // Ở đây mình giả sử dùng endpoint /adjust cho mọi thay đổi thủ công (ADJUSTMENT)
}

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  
  constructor(private http: HttpClient, private services: Services) {}

  // Lấy lịch sử kho của 1 sản phẩm
  getHistory(productId: number): Observable<any[]> {
    const token = localStorage.getItem('jwt');
    return this.http.get<any[]>(`${this.services.apiUrl}/api/warehouse/history/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Điều chỉnh kho (Nhập hàng / Kiểm kê)
  // Backend hiện tại của bạn đang hardcode Type = ADJUSTMENT trong controller
  // Nếu muốn mở rộng (Import, Damaged), bạn cần sửa Backend nhận thêm param "type".
  adjustStock(req: AdjustStockRequest): Observable<any> {
    const token = localStorage.getItem('jwt');
    return this.http.post(`${this.services.apiUrl}/api/warehouse/adjust`, req, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'text' // Vì backend trả về String
    });
  }
}