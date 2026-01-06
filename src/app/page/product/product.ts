import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/products/product';
import { CategoryService } from '../../services/categories/category';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './product.html',
  styleUrls: ['./product.css'],
})
export class Product implements OnInit {
  categories: any[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];

  showProductForm = false;
  showCategoryForm = false;
  showProductList = false;

  isEditingProduct = false;
  isEditingCategory = false;

  editingProduct: any = null;
  editingCategory: any = null;

  searchKeyword = '';

  selectedCategoryName = '';
  selectedCategoryId: number | null = null;

  productForm: {
    name: string;
    price: number | null; // Cho phép số hoặc null
    stock: number | null; // Cho phép số hoặc null
    categoryId: string;
  } = {
    name: '',
    price: null,
    stock: null,
    categoryId: '',
  };

  categoryForm = {
    name: '',
  };

  constructor(private productService: ProductService, private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categoryService.getAll().subscribe((data) => (this.categories = data));
  }

  loadProducts() {
    this.productService.getAll().subscribe((data) => {
      this.products = data;
      if (this.selectedCategoryId) {
        this.filteredProducts = this.products.filter(
          (p) => p.category.id === this.selectedCategoryId
        );
      }
    });
  }

  onSearch() {
    if (!this.searchKeyword.trim()) {
      this.filteredProducts = this.products.filter(
        (p) => p.category.id === this.selectedCategoryId
      );
      return;
    }

    const keyword = this.searchKeyword.toLowerCase();
    this.filteredProducts = this.products.filter((p) => p.name.toLowerCase().includes(keyword));

    this.showProductList = true; // Luôn mở product list để thấy kết quả
  }

  openProducts(cat: any) {
    this.selectedCategoryName = cat.name;
    this.selectedCategoryId = cat.id;
    this.filteredProducts = this.products.filter((p) => p.category.id === cat.id);
    this.showProductList = true;
  }

  backToCategories() {
    this.showProductList = false;
  }

  openCreateProduct() {
    this.isEditingProduct = false;
    this.showProductForm = true;
    this.productForm = { name: '', price: null, stock: null, categoryId: '' };
  }

  openEditProduct(p: any) {
    this.isEditingProduct = true;
    this.showProductForm = true;

    this.editingProduct = p;

    this.productForm = {
      name: p.name,
      price: p.price,
      stock: p.stock,
      categoryId: p.category.id,
    };
  }

  submitProduct() {
    if (this.isEditingProduct) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  createProduct() {
    const body = {
      name: this.productForm.name,
      price: this.productForm.price,
      stock: this.productForm.stock,
      category: { id: this.productForm.categoryId },
    };

    this.productService.create(body).subscribe(() => {
      this.closeProductForm();
      this.loadProducts();
    });
  }

  updateProduct() {
    const body = {
      name: this.productForm.name,
      price: this.productForm.price,
      stock: this.productForm.stock,
      category: { id: this.productForm.categoryId },
    };

    this.productService.update(this.editingProduct.id, body).subscribe({
      next: () => {
        this.closeProductForm();
        this.loadProducts(); // load lại danh sách chuẩn
        this.filteredProducts = this.filteredProducts.map((p) =>
          p.id === this.editingProduct.id
            ? {
                ...p,
                ...body,
                category: {
                  id: body.category.id,
                  name: this.categories.find((c) => c.id == body.category.id).name,
                },
              }
            : p
        );
      },
      error: (err) => console.error('UPDATE ERROR:', err),
    });
  }

  deleteProduct(id: number) {
    if (confirm('Bạn chắc chắn xóa sản phẩm này?')) {
      this.productService.delete(id).subscribe(() => {
        this.loadProducts();
        this.filteredProducts = this.filteredProducts.filter((p) => p.id !== id);
      });
    }
  }

  openCreateCategory() {
    this.isEditingCategory = false;
    this.showCategoryForm = true;
    this.categoryForm = { name: '' };
  }

  openEditCategory(cat: any) {
    this.isEditingCategory = true;
    this.showCategoryForm = true;
    this.editingCategory = cat;
    this.categoryForm = { name: cat.name };
  }

  submitCategory() {
    if (this.isEditingCategory) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  createCategory() {
    this.categoryService.create(this.categoryForm).subscribe(() => {
      this.closeCategoryForm();
      this.loadCategories();
    });
  }

  updateCategory() {
    this.categoryService.update(this.editingCategory.id, this.categoryForm).subscribe(() => {
      this.closeCategoryForm();
      this.loadCategories();
    });
  }

  deleteCategory(id: number) {
    if (confirm('Bạn chắc chắn xóa danh mục này?')) {
      this.categoryService.delete(id).subscribe(() => {
        this.loadCategories();
        this.showProductList = false;
      });
    }
  }

  closeProductForm() {
    this.showProductForm = false;
  }

  closeCategoryForm() {
    this.showCategoryForm = false;
  }
}
