import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Product } from './product';
import { ProductService } from '../../services/products/product';
import { CategoryService } from '../../services/categories/category';
import { of } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('ProductComponent', () => {
  let component: Product;
  let fixture: ComponentFixture<Product>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;

  // Dữ liệu giả lập
  const mockCategories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' }
  ];

  const mockProducts = [
    { id: 101, name: 'Laptop', price: 1000, stock: 5, category: { id: 1, name: 'Electronics' } },
    { id: 102, name: 'Phone', price: 500, stock: 10, category: { id: 1, name: 'Electronics' } },
    { id: 103, name: 'Shirt', price: 20, stock: 50, category: { id: 2, name: 'Clothing' } }
  ];

  beforeEach(async () => {
    // 1. Tạo Spy Object cho các Service (Giả lập backend)
    mockProductService = jasmine.createSpyObj('ProductService', ['getAll', 'create', 'update', 'delete']);
    mockCategoryService = jasmine.createSpyObj('CategoryService', ['getAll', 'create', 'update', 'delete']);

    // 2. Cấu hình hành vi mặc định cho Spy (luôn trả về Observable thành công)
    mockProductService.getAll.and.returnValue(of(mockProducts));
    mockProductService.create.and.returnValue(of({}));
    mockProductService.update.and.returnValue(of({}));
    mockProductService.delete.and.returnValue(of({}));

    mockCategoryService.getAll.and.returnValue(of(mockCategories));
    mockCategoryService.create.and.returnValue(of({}));
    mockCategoryService.update.and.returnValue(of({}));
    mockCategoryService.delete.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [Product, FormsModule, CommonModule, ReactiveFormsModule],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: CategoryService, useValue: mockCategoryService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Product);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Kích hoạt ngOnInit
  });

  // --- NHÓM 1: KHỞI TẠO & LOAD DỮ LIỆU (3 cases) ---

  it('1. Should create component', () => {
    expect(component).toBeTruthy();
  });

  it('2. Should load categories and products on init', () => {
    expect(mockCategoryService.getAll).toHaveBeenCalled();
    expect(mockProductService.getAll).toHaveBeenCalled();
    expect(component.categories.length).toBe(2);
    expect(component.products.length).toBe(3);
  });

  it('3. Should initial filteredProducts be empty or match logic', () => {
    // Theo logic ngOnInit, filteredProducts chưa được gán nếu chưa chọn category
    expect(component.filteredProducts.length).toBe(0);
  });

  // --- NHÓM 2: TƯƠNG TÁC VIEW & FILTER (4 cases) ---

  it('4. openProducts() should filter products by category', () => {
    const category = mockCategories[0]; // Electronics
    component.openProducts(category);

    expect(component.selectedCategoryName).toBe('Electronics');
    expect(component.selectedCategoryId).toBe(1);
    expect(component.showProductList).toBeTrue();
    // Electronics có 2 sản phẩm trong mockProducts
    expect(component.filteredProducts.length).toBe(2);
    expect(component.filteredProducts[0].name).toBe('Laptop');
  });

  it('5. backToCategories() should switch view back to grid', () => {
    component.showProductList = true;
    component.backToCategories();
    expect(component.showProductList).toBeFalse();
  });

  it('6. onSearch() with keyword should filter products globally', () => {
    component.searchKeyword = 'Shirt';
    component.onSearch();

    expect(component.showProductList).toBeTrue();
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].name).toBe('Shirt');
  });

  it('7. onSearch() with empty keyword should return to current category', () => {
    // Giả sử đang ở category 1
    component.selectedCategoryId = 1;
    component.searchKeyword = '';
    
    component.onSearch();
    // Phải trả về list của category 1 (2 sp)
    expect(component.filteredProducts.length).toBe(2);
  });

  // --- NHÓM 3: QUẢN LÝ FORM SẢN PHẨM (5 cases) ---

  it('8. openCreateProduct() should reset form', () => {
    component.openCreateProduct();
    expect(component.isEditingProduct).toBeFalse();
    expect(component.showProductForm).toBeTrue();
    expect(component.productForm.name).toBe('');
  });

  it('9. openEditProduct() should fill form with data', () => {
    const prod = mockProducts[0];
    component.openEditProduct(prod);

    expect(component.isEditingProduct).toBeTrue();
    expect(component.showProductForm).toBeTrue();
    expect(component.productForm.name).toBe('Laptop');
    expect(component.productForm.categoryId).toBe(1 as any);
  });

  it('10. closeProductForm() should hide modal', () => {
    component.showProductForm = true;
    component.closeProductForm();
    expect(component.showProductForm).toBeFalse();
  });

  it('11. submitProduct() should call createProduct() when NOT editing', () => {
    spyOn(component, 'createProduct');
    component.isEditingProduct = false;
    component.submitProduct();
    expect(component.createProduct).toHaveBeenCalled();
  });

  it('12. submitProduct() should call updateProduct() when editing', () => {
    spyOn(component, 'updateProduct');
    component.isEditingProduct = true;
    component.submitProduct();
    expect(component.updateProduct).toHaveBeenCalled();
  });

  // --- NHÓM 4: CRUD SẢN PHẨM (4 cases) ---

  it('13. createProduct() should call service and reload data', () => {
    component.productForm = { name: 'New Item', price: 100, stock: 1, categoryId: '1' };
    component.createProduct();

    expect(mockProductService.create).toHaveBeenCalled();
    // Sau khi create thành công, nó gọi loadProducts (tức getAll)
    expect(mockProductService.getAll).toHaveBeenCalledTimes(2); // 1 lần init, 1 lần sau create
    expect(component.showProductForm).toBeFalse();
  });

  it('14. updateProduct() should call service', () => {
    // Setup context
    component.editingProduct = mockProducts[0];
    component.categories = mockCategories; 
    component.productForm = { name: 'Updated', price: 200, stock: 5, categoryId: '1' };

    component.updateProduct();

    expect(mockProductService.update).toHaveBeenCalledWith(101, jasmine.any(Object));
    expect(component.showProductForm).toBeFalse();
  });

  it('15. deleteProduct() should call service when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true); // Giả lập người dùng bấm OK
    component.filteredProducts = [...mockProducts]; // Setup data để test filter

    component.deleteProduct(101);

    expect(mockProductService.delete).toHaveBeenCalledWith(101);
    // Kiểm tra xem đã xóa khỏi danh sách hiển thị chưa
    expect(component.filteredProducts.find(p => p.id === 101)).toBeUndefined();
  });

  it('16. deleteProduct() should NOT call service when cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false); // Giả lập bấm Cancel
    component.deleteProduct(101);
    expect(mockProductService.delete).not.toHaveBeenCalled();
  });

  // --- NHÓM 5: CRUD DANH MỤC (6 cases) ---

  it('17. openCreateCategory() should reset form', () => {
    component.openCreateCategory();
    expect(component.isEditingCategory).toBeFalse();
    expect(component.showCategoryForm).toBeTrue();
    expect(component.categoryForm.name).toBe('');
  });

  it('18. openEditCategory() should fill form', () => {
    const cat = mockCategories[0];
    component.openEditCategory(cat);
    expect(component.isEditingCategory).toBeTrue();
    expect(component.categoryForm.name).toBe('Electronics');
  });

  it('19. submitCategory() should route correctly', () => {
    spyOn(component, 'createCategory');
    component.isEditingCategory = false;
    component.submitCategory();
    expect(component.createCategory).toHaveBeenCalled();
  });

  it('20. createCategory() should call service', () => {
    component.categoryForm = { name: 'New Cat' };
    component.createCategory();
    expect(mockCategoryService.create).toHaveBeenCalled();
    expect(mockCategoryService.getAll).toHaveBeenCalledTimes(2);
  });

  it('21. updateCategory() should call service', () => {
    component.editingCategory = { id: 1 };
    component.categoryForm = { name: 'Updated Cat' };
    component.updateCategory();
    expect(mockCategoryService.update).toHaveBeenCalledWith(1, jasmine.any(Object));
  });

  it('22. deleteCategory() should call service and hide product list', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.showProductList = true;

    component.deleteCategory(1);

    expect(mockCategoryService.delete).toHaveBeenCalledWith(1);
    expect(component.showProductList).toBeFalse();
  });
  
  // Test case bổ sung
  it('23. closeCategoryForm() should hide modal', () => {
      component.showCategoryForm = true;
      component.closeCategoryForm();
      expect(component.showCategoryForm).toBeFalse();
  });
});