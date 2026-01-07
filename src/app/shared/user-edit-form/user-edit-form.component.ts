import { Component, Inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventsRegisterApiService, UserModel, People } from '../../events-register-api.service';
import { Subscription } from 'rxjs';

export interface UserEditDialogData {
  user: UserModel;
  eventName: string;
}

@Component({
  selector: 'app-user-edit-form',
  templateUrl: './user-edit-form.component.html',
  styleUrls: ['./user-edit-form.component.css'],
  standalone: false
})
export class UserEditFormComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  isLoading = false;
  vehicleTypes = ['car', 'motorcycle', 'quad'];
  guestTypes = ['driver', 'guest'];
  private subscriptions: Subscription[] = [];
  private visualViewportHandler?: () => void;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserEditFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserEditDialogData,
    private apiService: EventsRegisterApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupMobileKeyboardHandling();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Cleanup viewport listener
    if (this.visualViewportHandler && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.visualViewportHandler);
    }
  }

  private initializeForm(): void {
    const user = this.data.user;
    
    // Get driver info (first person with type 'driver')
    const driver = user.metadata.people.find(p => p.type === 'driver') || new People();
    
    this.userForm = this.fb.group({
      // Driver information
      driverName: [driver.name, Validators.required],
      driverCC: [driver.cc],
      driverPhone: [driver.phoneNumber],
      
      // Vehicle information
      vehicleType: [user.vehicleType, Validators.required],
      vehiclePlate: [user.metadata.vehicle.plate, Validators.required],
      vehicleMake: [user.metadata.vehicle.make],
      vehicleModel: [user.metadata.vehicle.model],
      
      // Guests (FormArray)
      guests: this.fb.array([]),
      
      // Payment & Status
      paymentInfo: [user.metadata.paymentInfo.byWho || ''],
      paid: [user.paid],
      comment: [user.metadata.comment || '']
    });

    // Initialize guests array with existing people (excluding driver)
    const guests = user.metadata.people.filter(p => p.type !== 'driver');
    guests.forEach(guest => {
      this.addGuest(guest);
    });

    // If no guests exist yet, add one empty guest slot
    if (this.guestsArray.length === 0) {
      this.addGuest(new People());
    }
  }

  get guestsArray(): FormArray {
    return this.userForm.get('guests') as FormArray;
  }

  createGuestFormGroup(guest: People = new People()): FormGroup {
    return this.fb.group({
      type: [guest.type || 'guest'],
      name: [guest.name],
      cc: [guest.cc],
      phoneNumber: [guest.phoneNumber]
    });
  }

  addGuest(guest: People = new People()): void {
    this.guestsArray.push(this.createGuestFormGroup(guest));
  }

  removeGuest(index: number): void {
    this.guestsArray.removeAt(index);
  }

  trackByIndex(index: number): number {
    return index;
  }

  onCancel(): void {
    if (this.userForm.dirty) {
      const confirmClose = confirm('Tem alterações não guardadas. Tem certeza que deseja fechar?');
      if (!confirmClose) {
        return;
      }
    }
    this.dialogRef.close({ success: false });
  }

  onSave(): void {
    if (this.userForm.invalid) {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios.', 'Fechar', {
        duration: 3000
      });
      return;
    }

    this.isLoading = true;
    const formValue = this.userForm.value;
    
    // Build updated user model
    const updatedUser: UserModel = {
      ...this.data.user,
      vehicleType: formValue.vehicleType,
      paid: formValue.paid,
      metadata: {
        ...this.data.user.metadata,
        vehicle: {
          plate: formValue.vehiclePlate.toUpperCase(),
          make: formValue.vehicleMake,
          model: formValue.vehicleModel
        },
        people: [
          // Driver
          {
            type: 'driver',
            name: formValue.driverName,
            cc: formValue.driverCC,
            phoneNumber: formValue.driverPhone,
            driversLicense: ''
          },
          // Guests
          ...formValue.guests.filter((g: any) => g.name && g.name.trim() !== '')
        ],
        paymentInfo: {
          ...this.data.user.metadata.paymentInfo,
          byWho: formValue.paymentInfo
        },
        comment: formValue.comment || undefined
      }
    };

    const sub = this.apiService.updateUser(
      this.data.user.userEmail,
      this.data.eventName,
      updatedUser
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Utilizador atualizado com sucesso!', 'Fechar', {
          duration: 3000
        });
        this.dialogRef.close({ success: true, user: response });
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Erro ao atualizar utilizador. Tente novamente.', 'Fechar', {
          duration: 3000
        });
        console.error('Error updating user:', error);
      }
    });

    this.subscriptions.push(sub);
  }

  private setupMobileKeyboardHandling(): void {
    // Only apply on mobile devices
    if (typeof window !== 'undefined' && window.visualViewport && window.innerWidth <= 767) {
      this.visualViewportHandler = () => {
        const dialogContent = document.querySelector('mat-dialog-content');
        if (dialogContent && window.visualViewport) {
          // Adjust height when keyboard appears
          const viewportHeight = window.visualViewport.height;
          (dialogContent as HTMLElement).style.maxHeight = `${viewportHeight * 0.6}px`;
        }
      };
      
      window.visualViewport.addEventListener('resize', this.visualViewportHandler);
    }
  }

  dismissKeyboardAndScroll(): void {
    // Blur active element to dismiss keyboard
    (document.activeElement as HTMLElement)?.blur();
    
    // Small delay to allow keyboard to close, then scroll to actions
    setTimeout(() => {
      const actions = document.querySelector('mat-dialog-actions');
      actions?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  get hasComment(): boolean {
    return !!this.data.user.metadata.comment;
  }
}
