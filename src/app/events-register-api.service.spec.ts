import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EventsRegisterApiService, UserModel } from './events-register-api.service';

describe('EventsRegisterApiService', () => {
  let service: EventsRegisterApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventsRegisterApiService]
    });
    service = TestBed.inject(EventsRegisterApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update user via PUT request', () => {
    const mockUser = new UserModel();
    mockUser.userEmail = 'test@example.com';
    mockUser.eventName = 'testEvent';
    mockUser.paid = true;
    
    const email = 'test@example.com';
    const eventName = 'testEvent';
    
    service.updateUser(email, eventName, mockUser).subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${service.api}/v1/${eventName}/${email}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockUser);
  });

  it('should handle error when updating user', () => {
    const mockUser = new UserModel();
    const email = 'test@example.com';
    const eventName = 'testEvent';
    
    service.updateUser(email, eventName, mockUser).subscribe({
      next: () => fail('should have failed with 500 error'),
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });

    const req = httpMock.expectOne(`${service.api}/v1/${eventName}/${email}`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });
});
