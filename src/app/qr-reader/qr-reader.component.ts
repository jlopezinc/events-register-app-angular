import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventsRegisterApiService } from '../events-register-api.service';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { ViewChild } from '@angular/core';
import { UserModel } from '../events-register-api.service';
import { UserCardComponent } from '../shared/user-card/user-card.component';
import { CheckInModeService } from '../shared/check-in-mode.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserEditFormComponent } from '../shared/user-edit-form/user-edit-form.component';

const EVENT_NAME = 'ttamigosnatal2026';

@Component({
    selector: 'app-qr-reader',
    templateUrl: './qr-reader.component.html',
    styleUrls: ['./qr-reader.component.css'],
    providers: [EventsRegisterApiService, UserCardComponent],
    standalone: false
})
export class QrReaderComponent implements OnInit, OnDestroy {


  @ViewChild('action') action!: ZXingScannerComponent;


  constructor(
    private eventsRegisterApiService: EventsRegisterApiService,
    private checkInModeService: CheckInModeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {

  }

  /**
   * Subscription to the check-in mode state from the shared service
   */
  private checkInModeSubscription?: Subscription;

  /**
   * Local variable to track the check-in mode state
   * Synchronized with the shared service
   */
  liveMode = false;

  currentQrCodeValue = "";
  currentUser: UserModel = new UserModel();
  userNotFound = false;
  alreadyCheckedIn = false;
  userHasComment = false;
  availableDevices: MediaDeviceInfo[] = [];
  selectedDevice: MediaDeviceInfo | undefined;
  scannerEnabled = true;
  isLoading = true;

  ngOnInit(): void {
    // Subscribe to the shared check-in mode state
    this.checkInModeSubscription = this.checkInModeService.getCheckInModeState()
      .subscribe(enabled => {
        this.liveMode = enabled;
      });
  }

  ngAfterViewInit(): void {
    // Camera will autostart with the first available device
  }

  ngOnDestroy(): void {
    // Scanner cleanup handled by component
    // Unsubscribe from the check-in mode state
    if (this.checkInModeSubscription) {
      this.checkInModeSubscription.unsubscribe();
    }
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.isLoading = false;
    // Try to select back camera by default if devices are available
    if (devices.length > 0) {
      const backCamera = devices.find(d => /back|rear|environment/gi.test(d.label));
      this.selectedDevice = backCamera || devices[0];
    }
  }

  public onScanSuccess(result: string): void {
    if (this.currentQrCodeValue !== result) {
      this.currentQrCodeValue = result;
      console.log('QR Code scanned:', result);
      if (this.liveMode) {
        this.checkInUser(this.currentQrCodeValue, false);
      } else {
        this.getUserFromApi(this.currentQrCodeValue);
      }
    }
  }
  
  public onCameraSlideChange(e: any) {
    this.scannerEnabled = e.checked;
  }

  public onDeviceSelectChange(selectedIndex: number): void {
    // selectedIndex 0 is the "Select device" option, actual devices start at index 1
    const deviceIndex = selectedIndex - 1;
    if (selectedIndex > 0 && deviceIndex < this.availableDevices.length) {
      this.selectedDevice = this.availableDevices[deviceIndex];
    }
  }

  public getUserInContext() {
    this.getUserFromApi(this.currentQrCodeValue);
  }

  public manualCheckInUser() {
    // if manual check in, we assume the "comment" was already verified.
    this.checkInUser(this.currentUser.userEmail, true);
  }

  public cancelCheckInUser() {
    this.cancelCheckIn(this.currentUser.userEmail);
  }

  public clearSelectedUser() {
    this.currentQrCodeValue = "";
    this.currentUser = new UserModel();
    this.userNotFound = false;
    this.alreadyCheckedIn = false;
    this.userHasComment = false;
  }

  private getUserFromApi(email: string) {
    this.currentUser = new UserModel();
    this.checkInModeService.getUserWithState(email, EVENT_NAME)
      .subscribe(result => {
        this.currentUser = result.user;
        this.userNotFound = result.userNotFound;
        this.alreadyCheckedIn = result.alreadyCheckedIn;
        this.userHasComment = result.userHasComment;
      });
  }


  private checkInUser(email: string, overrideComment: boolean) {
    this.checkInModeService.performCheckIn(email, EVENT_NAME, overrideComment)
      .subscribe(result => {
        this.currentUser = result.user;
        this.userNotFound = result.userNotFound;
        this.alreadyCheckedIn = result.alreadyCheckedIn;
        this.userHasComment = result.userHasComment;
      });
  }

  public cancelCheckIn(email: string) {
    this.checkInModeService.cancelCheckIn(email, EVENT_NAME)
      .subscribe(result => {
        this.currentUser = new UserModel();
        this.userNotFound = result.userNotFound;
        this.alreadyCheckedIn = false;
        this.userHasComment = false;
      });
  }

  public onEditUser() {
    const dialogRef = this.dialog.open(UserEditFormComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        user: this.currentUser,
        eventName: EVENT_NAME
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        // Refresh user data and handle auto check-in
        this.checkInModeService.handleUserEditRefresh(
          this.currentUser.userEmail,
          EVENT_NAME,
          this.liveMode
        ).subscribe(refreshResult => {
          this.currentUser = refreshResult.user;
          this.userNotFound = refreshResult.userNotFound;
          this.alreadyCheckedIn = refreshResult.alreadyCheckedIn;
          this.userHasComment = refreshResult.userHasComment;

          if (refreshResult.autoCheckedIn) {
            this.snackBar.open('Utilizador atualizado e check-in efetuado!', 'Fechar', {
              duration: 3000
            });
          }
        });
      }
    });
  }
}
