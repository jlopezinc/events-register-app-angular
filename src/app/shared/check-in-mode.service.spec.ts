import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CheckInModeService } from './check-in-mode.service';
import { EventsRegisterApiService, UserModel } from '../events-register-api.service';

describe('CheckInModeService', () => {
  let service: CheckInModeService;
  let apiServiceSpy: jasmine.SpyObj<EventsRegisterApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('EventsRegisterApiService', ['getUser', 'checkInUser', 'cancelCheckInUser']);

    TestBed.configureTestingModule({
      providers: [
        CheckInModeService,
        { provide: EventsRegisterApiService, useValue: spy }
      ]
    });
    service = TestBed.inject(CheckInModeService);
    apiServiceSpy = TestBed.inject(EventsRegisterApiService) as jasmine.SpyObj<EventsRegisterApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserWithState', () => {
    it('should return user with correct state when user is found', (done) => {
      const mockUser = new UserModel();
      mockUser.userEmail = 'test@example.com';
      mockUser.paid = true;
      mockUser.checkedIn = false;

      apiServiceSpy.getUser.and.returnValue(of(mockUser));

      service.getUserWithState('test@example.com', 'event2026').subscribe(result => {
        expect(result.user.userEmail).toBe('test@example.com');
        expect(result.userNotFound).toBeFalse();
        expect(result.alreadyCheckedIn).toBeFalse();
        expect(result.userHasComment).toBeFalse();
        done();
      });
    });

    it('should return userNotFound=true when user is not found', (done) => {
      apiServiceSpy.getUser.and.returnValue(of(null as any));

      service.getUserWithState('notfound@example.com', 'event2026').subscribe(result => {
        expect(result.userNotFound).toBeTrue();
        expect(result.user.userEmail).toBe('');
        done();
      });
    });

    it('should set userHasComment=true when user has a comment', (done) => {
      const mockUser = new UserModel();
      mockUser.userEmail = 'test@example.com';
      mockUser.metadata.comment = 'Check ID';

      apiServiceSpy.getUser.and.returnValue(of(mockUser));

      service.getUserWithState('test@example.com', 'event2026').subscribe(result => {
        expect(result.userHasComment).toBeTrue();
        done();
      });
    });

    it('should handle API errors gracefully', (done) => {
      apiServiceSpy.getUser.and.returnValue(throwError(() => new Error('API Error')));

      service.getUserWithState('test@example.com', 'event2026').subscribe(result => {
        expect(result.userNotFound).toBeTrue();
        done();
      });
    });
  });

  describe('performCheckIn', () => {
    it('should successfully check in a valid user', (done) => {
      const mockUser = new UserModel();
      mockUser.userEmail = 'test@example.com';
      mockUser.paid = true;
      mockUser.checkedIn = false;

      const checkedInUser = { ...mockUser };
      checkedInUser.checkedIn = true;

      apiServiceSpy.getUser.and.returnValue(of(mockUser));
      apiServiceSpy.checkInUser.and.returnValue(of(checkedInUser));

      service.performCheckIn('test@example.com', 'event2026', false).subscribe(result => {
        expect(result.success).toBeTrue();
        expect(result.user.checkedIn).toBeTrue();
        expect(apiServiceSpy.checkInUser).toHaveBeenCalledWith('test@example.com', 'event2026');
        done();
      });
    });

    it('should not check in user who is not found', (done) => {
      apiServiceSpy.getUser.and.returnValue(of(null as any));

      service.performCheckIn('notfound@example.com', 'event2026', false).subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.userNotFound).toBeTrue();
        expect(apiServiceSpy.checkInUser).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not check in user who is already checked in', (done) => {
      const mockUser = new UserModel();
      mockUser.userEmail = 'test@example.com';
      mockUser.paid = true;
      mockUser.checkedIn = true;

      apiServiceSpy.getUser.and.returnValue(of(mockUser));

      service.performCheckIn('test@example.com', 'event2026', false).subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.alreadyCheckedIn).toBeTrue();
        expect(apiServiceSpy.checkInUser).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not check in user who has not paid', (done) => {
      const mockUser = new UserModel();
      mockUser.userEmail = 'test@example.com';
      mockUser.paid = false;
      mockUser.checkedIn = false;

      apiServiceSpy.getUser.and.returnValue(of(mockUser));

      service.performCheckIn('test@example.com', 'event2026', false).subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.user.paid).toBeFalse();
        expect(apiServiceSpy.checkInUser).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not check in user with comment unless overridden', (done) => {
      const mockUser = new UserModel();
      mockUser.userEmail = 'test@example.com';
      mockUser.paid = true;
      mockUser.checkedIn = false;
      mockUser.metadata.comment = 'Check ID';

      apiServiceSpy.getUser.and.returnValue(of(mockUser));

      service.performCheckIn('test@example.com', 'event2026', false).subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.userHasComment).toBeTrue();
        expect(apiServiceSpy.checkInUser).not.toHaveBeenCalled();
        done();
      });
    });

    it('should check in user with comment when overridden', (done) => {
      const mockUser = new UserModel();
      mockUser.userEmail = 'test@example.com';
      mockUser.paid = true;
      mockUser.checkedIn = false;
      mockUser.metadata.comment = 'Check ID';

      const checkedInUser = { ...mockUser };
      checkedInUser.checkedIn = true;

      apiServiceSpy.getUser.and.returnValue(of(mockUser));
      apiServiceSpy.checkInUser.and.returnValue(of(checkedInUser));

      service.performCheckIn('test@example.com', 'event2026', true).subscribe(result => {
        expect(result.success).toBeTrue();
        expect(apiServiceSpy.checkInUser).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('cancelCheckIn', () => {
    it('should successfully cancel check-in', (done) => {
      apiServiceSpy.cancelCheckInUser.and.returnValue(of(new UserModel()));

      service.cancelCheckIn('test@example.com', 'event2026').subscribe(result => {
        expect(result.success).toBeTrue();
        expect(result.userNotFound).toBeFalse();
        expect(apiServiceSpy.cancelCheckInUser).toHaveBeenCalledWith('test@example.com', 'event2026');
        done();
      });
    });

    it('should handle cancellation errors', (done) => {
      apiServiceSpy.cancelCheckInUser.and.returnValue(throwError(() => new Error('API Error')));

      service.cancelCheckIn('test@example.com', 'event2026').subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.userNotFound).toBeTrue();
        done();
      });
    });
  });
});
