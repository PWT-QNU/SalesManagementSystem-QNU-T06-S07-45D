import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory/inventory';
import { Router } from '@angular/router';
import { Product } from '../inventory/inventory';

export interface Suppliers {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string | null;
  hibernateLazyInitializer: any;
}

@Component({
  selector: 'app-sum-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sum-inventory.html',
  styleUrls: ['./sum-inventory.css']
})
export class SumInventoryComponent implements OnInit {

  products: Product[] = [];
  suppliers: Suppliers[] = [];

  selectedProductId: number | null = null;
  selectedSuppliersId: number | null = null;
  quantity: number | null = null;
  priceImport: number | null = null;

  orders: any[] = [];
  totalImports: any[] = [];
  filteredImports: any[] = [];

  searchText: string = "";
  showPopup = false;

  constructor(private inventoryService: InventoryService, private router: Router) {}

  ngOnInit() {
    this.loadImport();
    this.loadProducts();
    this.loadSuppliers();
  }

  loadProducts(): void {
    this.inventoryService.getAll().subscribe({
      next: (data) => this.products = data,
      error: (err) => console.error("Error loading products:", err)
    });
  }

  loadSuppliers(): void {
    this.inventoryService.getSuppliers().subscribe({
      next: (data) => this.suppliers = data,
      error: (err) => console.error("Error loading suppliers:", err)
    });
  }

  loadImport(): void {
    this.inventoryService.getImportOrder().subscribe({
      next: (data) => {
        this.orders = data;
        this.sumImportQuantity();
      },
      error: (err) => console.error("Error loading orders:", err)
    });
  }

  sumImportQuantity() {
    const map = new Map();

    this.orders.forEach(order => {
      let id = order.product.id;

      if (!map.has(id)) {
        map.set(id, {
          productName: order.product.name,
          category: order.product.category.name,
          totalQuantity: order.quantity
        });
      } else {
        map.get(id).totalQuantity += order.quantity;
      }
    });

    this.totalImports = Array.from(map.values());
    this.filteredImports = this.totalImports; // bảng hiển thị ban đầu
  }

  // 🔍 BẤM NÚT TÌM
  search() {
    this.filteredImports = this.totalImports.filter(item =>
      item.productName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // ❌ XÓA TÌM KIẾM
  resetSearch() {
    this.searchText = "";
    this.filteredImports = this.totalImports;
  }

  goToInventory() {
    this.router.navigate(['/inventory']);
  }

  openPopup() {
    this.showPopup = true;
    this.selectedProductId = null;
    this.selectedSuppliersId = null;
    this.quantity = null;
    this.priceImport = null;
  }

  closePopup() {
    this.showPopup = false;
  }

  submitImport() {
    if (!this.selectedProductId || !this.selectedSuppliersId || !this.quantity || !this.priceImport) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const data = {
      productId: this.selectedProductId,
      supplierId: this.selectedSuppliersId,
      quantity: this.quantity,
      totalCost: this.priceImport
    };

    this.inventoryService.importProduct(data).subscribe({
      next: () => {
        alert("Nhập kho thành công!");
        this.closePopup();
        this.loadImport();
      },
      error: (err) => {
        console.error("Lỗi nhập kho:", err);
        alert("Nhập kho thất bại!");
      }
    });
  }
}
