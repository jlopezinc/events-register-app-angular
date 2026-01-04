import { Component } from '@angular/core';
import { EventsRegisterApiService } from '../events-register-api.service';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { ViewChild } from '@angular/core';
import { UserModel } from '../events-register-api.service';
import { UserCardComponent } from '../shared/user-card/user-card.component';


@Component({
    selector: 'app-qr-reader',
    templateUrl: './qr-reader.component.html',
    styleUrls: ['./qr-reader.component.css'],
    providers: [EventsRegisterApiService, UserCardComponent],
    standalone: false
})
export class QrReaderComponent {


  @ViewChild('action') action!: ZXingScannerComponent;


  constructor(private eventsRegisterApiService: EventsRegisterApiService) {

  }


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

  ngAfterViewInit(): void {
    // Camera will autostart with the first available device
  }

  ngOnDestroy() {
    // Scanner cleanup handled by component
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

  public setLiveMode(e: any) {
    this.liveMode = e.checked;
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
    this.eventsRegisterApiService.getUser(email, 'ttamigosnatal2025')
      .subscribe({
        next: (data) => {
          if (data != null) {
            this.currentUser = { ...data }
            this.userNotFound = false;
            this.alreadyCheckedIn = false;
            this.userHasComment = data.metadata.comment != undefined;
          } else {
            this.currentUser = new UserModel();
            this.userNotFound = true;
            this.alreadyCheckedIn = false;
            this.userHasComment = false;
          }
        },
        error: () => {
          this.currentUser = new UserModel();
          this.userNotFound = true;
          this.alreadyCheckedIn = false;
          this.userHasComment = false;
        }

      })
  }


  private checkInUser(email: string, overrideComment: boolean) {
    this.eventsRegisterApiService.getUser(email, 'ttamigosnatal2025')
      .subscribe({
        next: (data) => {
          if (data == null) {
            this.currentUser = new UserModel();
            this.userNotFound = true;
            this.alreadyCheckedIn = false;
            this.userHasComment = false;
          }
          else if (data.checkedIn) {
            this.currentUser = { ...data };
            // already checked in
            this.alreadyCheckedIn = true;
          } else if (!data.paid || (data.metadata.comment != undefined && !overrideComment)) {
            this.currentUser = { ...data };
            this.userHasComment = data.metadata.comment != undefined;
          } else {
            this.eventsRegisterApiService.checkInUser(email, 'ttamigosnatal2025')
              .subscribe({
                next: (data) => {
                  this.currentUser = { ...data }
                  this.userNotFound = false;
                  this.alreadyCheckedIn = false;
                  this.userHasComment = false;
                },
                error: () => {
                  this.currentUser = new UserModel()
                  this.userNotFound = true;
                  this.alreadyCheckedIn = false;
                  this.userHasComment = false;
                }
              })
          }
        },
        error: () => {
          this.currentUser = new UserModel()
          this.userNotFound = true;
          this.alreadyCheckedIn = false;
          this.userHasComment = false;
        }
      })


  }

  public cancelCheckIn(email: string) {
    this.eventsRegisterApiService.cancelCheckInUser(email, 'ttamigosnatal2025')
      .subscribe({
        next: () => {
          this.currentUser = new UserModel();
          this.userNotFound = false;
          this.alreadyCheckedIn = false;
          this.userHasComment = false;
        },
        error: () => {
          this.currentUser = new UserModel();
          this.userNotFound = true;
          this.alreadyCheckedIn = false;
          this.userHasComment = false;
        }
      })
  }
}
