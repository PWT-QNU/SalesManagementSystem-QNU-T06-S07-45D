import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, User } from './user';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Module giả lập HTTP
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Đảm bảo không còn request nào đang treo
  });

  it('should retrieve users from API via GET', () => {
    const dummyUsers: User[] = [
      { id: 1, username: 'user1', fullName: 'User One', role: 'admin' },
      { id: 2, username: 'user2', fullName: 'User Two', role: 'customer' }
    ];

    // 1. Gọi hàm cần test
    service.getAll().subscribe(users => {
      expect(users.length).toBe(2);
      expect(users).toEqual(dummyUsers);
    });

    // 2. Bắt request HTTP đang được gọi
    const req = httpMock.expectOne('http://localhost:8080/api/users');
    
    // 3. Kiểm tra method
    expect(req.request.method).toBe('GET');

    // 4. Trả về dữ liệu giả (flush)
    req.flush(dummyUsers);
  });
});