import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { SearchComponent } from './search.component';
import { EventsRegisterApiService, UserModel } from '../events-register-api.service';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let apiService: jasmine.SpyObj<EventsRegisterApiService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('EventsRegisterApiService', [
      'getUserByPhone',
      'getUser',
      'checkInUser',
      'cancelCheckInUser'
    ]);

    TestBed.configureTestingModule({
      declarations: [SearchComponent],
      imports: [
        FormsModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatProgressBarModule
      ],
      providers: [
        { provide: EventsRegisterApiService, useValue: apiServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(EventsRegisterApiService) as jasmine.SpyObj<EventsRegisterApiService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have phone number input with type="tel"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const phoneInput = compiled.querySelector('input[name="phoneNumber"]');
    expect(phoneInput).toBeTruthy();
    expect(phoneInput?.getAttribute('type')).toBe('tel');
  });

  it('should remove all spaces from phone number before API call', () => {
    const mockUser = new UserModel();
    mockUser.userEmail = 'test@example.com';
    apiService.getUserByPhone.and.returnValue(of(mockUser));

    component.phoneNumber = '123 456 7890';
    component.searchUser();

    expect(apiService.getUserByPhone).toHaveBeenCalledWith('1234567890', 'ttamigosnatal2026');
  });

  it('should remove leading spaces from phone number before API call', () => {
    const mockUser = new UserModel();
    mockUser.userEmail = 'test@example.com';
    apiService.getUserByPhone.and.returnValue(of(mockUser));

    component.phoneNumber = '  1234567890';
    component.searchUser();

    expect(apiService.getUserByPhone).toHaveBeenCalledWith('1234567890', 'ttamigosnatal2026');
  });

  it('should remove trailing spaces from phone number before API call', () => {
    const mockUser = new UserModel();
    mockUser.userEmail = 'test@example.com';
    apiService.getUserByPhone.and.returnValue(of(mockUser));

    component.phoneNumber = '1234567890  ';
    component.searchUser();

    expect(apiService.getUserByPhone).toHaveBeenCalledWith('1234567890', 'ttamigosnatal2026');
  });

  it('should remove all types of spaces (leading, trailing, intermediate) from phone number', () => {
    const mockUser = new UserModel();
    mockUser.userEmail = 'test@example.com';
    apiService.getUserByPhone.and.returnValue(of(mockUser));

    component.phoneNumber = '  123 456 7890  ';
    component.searchUser();

    expect(apiService.getUserByPhone).toHaveBeenCalledWith('1234567890', 'ttamigosnatal2026');
  });

  it('should handle phone number with special characters and spaces', () => {
    const mockUser = new UserModel();
    mockUser.userEmail = 'test@example.com';
    apiService.getUserByPhone.and.returnValue(of(mockUser));

    component.phoneNumber = '+351 912 345 678';
    component.searchUser();

    expect(apiService.getUserByPhone).toHaveBeenCalledWith('+351912345678', 'ttamigosnatal2026');
  });
});
