import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserEditFormComponent } from './user-edit-form.component';
import { EventsRegisterApiService, UserModel, Metadata, People, Vehicle, PaymentInfo, CheckIn } from '../../events-register-api.service';
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('UserEditFormComponent', () => {
  let component: UserEditFormComponent;
  let fixture: ComponentFixture<UserEditFormComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<UserEditFormComponent>>;
  let mockApiService: jasmine.SpyObj<EventsRegisterApiService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const createMockUser = (): UserModel => {
    const user = new UserModel();
    user.userEmail = 'test@example.com';
    user.eventName = 'testEvent';
    user.paid = false;
    user.checkedIn = false;
    user.vehicleType = 'car';
    user.metadata = new Metadata();
    user.metadata.vehicle = new Vehicle();
    user.metadata.vehicle.plate = 'AB-12-CD';
    user.metadata.vehicle.make = 'Toyota';
    user.metadata.vehicle.model = 'Camry';
    user.metadata.people = [];
    const driver = new People();
    driver.type = 'driver';
    driver.name = 'Test Driver';
    driver.cc = '123456789';
    driver.phoneNumber = '+351912345678';
    user.metadata.people.push(driver);
    user.metadata.paymentInfo = new PaymentInfo();
    user.metadata.checkIn = new CheckIn();
    return user;
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockApiService = jasmine.createSpyObj('EventsRegisterApiService', ['updateUser']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      declarations: [UserEditFormComponent],
      imports: [
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatDialogModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { user: createMockUser(), eventName: 'testEvent' } },
        { provide: EventsRegisterApiService, useValue: mockApiService },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with user data', () => {
    expect(component.userForm).toBeDefined();
    expect(component.userForm.get('driverName')?.value).toBe('Test Driver');
    expect(component.userForm.get('vehicleType')?.value).toBe('car');
    expect(component.userForm.get('vehiclePlate')?.value).toBe('AB-12-CD');
  });

  it('should validate required fields', () => {
    const form = component.userForm;
    form.get('driverName')?.setValue('');
    form.get('vehicleType')?.setValue('');
    form.get('vehiclePlate')?.setValue('');
    
    expect(form.get('driverName')?.hasError('required')).toBeTruthy();
    expect(form.get('vehicleType')?.hasError('required')).toBeTruthy();
    expect(form.get('vehiclePlate')?.hasError('required')).toBeTruthy();
    expect(form.invalid).toBeTruthy();
  });

  it('should add a guest to the form array', () => {
    const initialLength = component.guestsArray.length;
    component.addGuest();
    expect(component.guestsArray.length).toBe(initialLength + 1);
  });

  it('should remove a guest from the form array', () => {
    component.addGuest();
    const lengthAfterAdd = component.guestsArray.length;
    component.removeGuest(0);
    expect(component.guestsArray.length).toBe(lengthAfterAdd - 1);
  });

  it('should close dialog on cancel', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.userForm.markAsDirty();
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ success: false });
  });

  it('should not close dialog on cancel if user declines confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.userForm.markAsDirty();
    component.onCancel();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should save user successfully', () => {
    const updatedUser = createMockUser();
    mockApiService.updateUser.and.returnValue(of(updatedUser));
    
    component.onSave();
    
    expect(mockApiService.updateUser).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Utilizador atualizado com sucesso!',
      'Fechar',
      { duration: 3000 }
    );
    expect(mockDialogRef.close).toHaveBeenCalledWith({ success: true, user: updatedUser });
  });

  it('should handle save error', () => {
    mockApiService.updateUser.and.returnValue(throwError(() => new Error('API Error')));
    
    component.onSave();
    
    expect(mockApiService.updateUser).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Erro ao atualizar utilizador. Tente novamente.',
      'Fechar',
      { duration: 3000 }
    );
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should not save if form is invalid', () => {
    component.userForm.get('driverName')?.setValue('');
    component.onSave();
    
    expect(mockApiService.updateUser).not.toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Por favor, preencha todos os campos obrigatórios.',
      'Fechar',
      { duration: 3000 }
    );
  });

  it('should uppercase vehicle plate', () => {
    const updatedUser = createMockUser();
    mockApiService.updateUser.and.returnValue(of(updatedUser));
    
    component.userForm.get('vehiclePlate')?.setValue('ab-12-cd');
    component.onSave();
    
    expect(mockApiService.updateUser).toHaveBeenCalledWith(
      jasmine.any(String),
      jasmine.any(String),
      jasmine.objectContaining({
        metadata: jasmine.objectContaining({
          vehicle: jasmine.objectContaining({
            plate: 'AB-12-CD'
          })
        })
      })
    );
  });
});
