import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory/inventory';

// ======================
// Interface
// ======================
export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  stock: number;
  createdAt: string | null;
  hibernateLazyInitializer: any;
}

export interface Suppliers {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string | null;
  hibernateLazyInitializer: any;
}

export interface ImportOrder {
  id: number;
  supplier: Suppliers;
  product: Product;
  quantity: number;
  importDate: string | null;
  totalCost: number;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.css']
})
export class Inventory implements OnInit {

  products: Product[] = [];
  categories: Category[] = [];
  suppliers: Suppliers[] = [];
  selectedProductId: number | null = null;
  selectedSuppliersId: number | null = null;
  quantity: number | null = null;
  priceImport: number | null = null;
  orders: ImportOrder[] = [];

  // ------- Search -------
  searchText: string = "";
  filteredOrders: ImportOrder[] = [];

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadSuppliers();
    this.loadImport();
  }

  // Load đơn nhập để xem
  loadImport(): void {
    this.inventoryService.getImportOrder().subscribe({
      next: (data) => {
        this.orders = data;
        this.filteredOrders = data; // dùng để filter tìm kiếm
      },
      error: (err) => console.error("Error loading orders:", err)
    });
  }

  // Tìm kiếm
  search() {
    const text = this.searchText.toLowerCase();
    this.filteredOrders = this.orders.filter(o =>
      o.product.name.toLowerCase().includes(text) ||
      o.supplier.name.toLowerCase().includes(text)
    );
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

  // Popup
  showPopup = false;
  openPopup() {
    this.showPopup = true;
    this.selectedProductId = null;
    this.selectedSuppliersId = null;
    this.quantity = null;
    this.priceImport = null;
  }
  closePopup() { this.showPopup = false; }

  // Submit nhập kho
  submitImport() {
    if (!this.selectedProductId || !this.selectedSuppliersId || !this.quantity || !this.priceImport) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const data = {
      productId: this.selectedProductId,
      supplierId: this.selectedSuppliersId,
      quantity: this.quantity,
      priceImport: this.priceImport
    };

    this.inventoryService.importProduct(data).subscribe({
      next: () => {
        alert("Nhập kho thành công!");
        this.closePopup();
        this.loadImport();     // load lại dữ liệu bảng ngay
      },
      error: () => alert("Nhập kho thất bại!")
    });
  }

  goToSumInventory() {
    window.location.href = '/sumInventory';
  }
  resetSearch() {
    this.searchText = "";
    this.filteredOrders = this.orders;
  }
}
