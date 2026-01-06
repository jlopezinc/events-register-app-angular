import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EventsRegisterApiService, UserModel, Counters, ReconcileCountersResponse } from './events-register-api.service';

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
    const expectedUrl = 'https://3692kus1h1.execute-api.eu-north-1.amazonaws.com/v1/testEvent/test@example.com';
    
    service.updateUser(email, eventName, mockUser).subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockUser);
  });

  it('should handle error when updating user', () => {
    const mockUser = new UserModel();
    const email = 'test@example.com';
    const eventName = 'testEvent';
    const expectedUrl = 'https://3692kus1h1.execute-api.eu-north-1.amazonaws.com/v1/testEvent/test@example.com';
    
    service.updateUser(email, eventName, mockUser).subscribe({
      next: () => fail('should have failed with 500 error'),
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });

    const req = httpMock.expectOne(expectedUrl);
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should reconcile counters via POST request', () => {
    const eventName = 'testEvent';
    const mockBefore = new Counters();
    mockBefore.total = 10;
    mockBefore.participantsCheckedIn = 5;
    mockBefore.participantsNotCheckedIn = 5;
    
    const mockAfter = new Counters();
    mockAfter.total = 10;
    mockAfter.participantsCheckedIn = 6;
    mockAfter.participantsNotCheckedIn = 4;
    
    const mockResponse: ReconcileCountersResponse = {
      eventId: 'test-event-id',
      status: 'success',
      before: mockBefore,
      after: mockAfter,
      message: 'Counters reconciled successfully'
    };
    
    const expectedUrl = 'https://3692kus1h1.execute-api.eu-north-1.amazonaws.com/v1/reconcile-counters/testEvent';
    
    service.reconcileCounters(eventName).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(response.status).toBe('success');
      expect(response.after.participantsCheckedIn).toBe(6);
    });

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush(mockResponse);
  });
});
