import { Component } from '@angular/core';
import { EventsRegisterApiService } from '../events-register-api.service';
import {
  ScannerQRCodeConfig,
  ScannerQRCodeResult,
  NgxScannerQrcodeService,
  NgxScannerQrcodeComponent,
  ScannerQRCodeSelectedFiles,
} from 'ngx-scanner-qrcode';
import { ViewChild } from '@angular/core';
import { UserModel } from '../events-register-api.service';
import { UserCardComponent } from '../shared/user-card/user-card.component';


@Component({
  selector: 'app-qr-reader',
  templateUrl: './qr-reader.component.html',
  styleUrls: ['./qr-reader.component.css'],
  providers: [EventsRegisterApiService, UserCardComponent]
})
export class QrReaderComponent {


  @ViewChild('action') action!: NgxScannerQrcodeComponent;


  constructor(private eventsRegisterApiService: EventsRegisterApiService) {

  }


  liveMode = false;

  currentQrCodeValue = "";
  currentUser: UserModel = new UserModel();
  userNotFound = false;
  alreadyCheckedIn = false;
  userHasComment = false;

  ngAfterViewInit(): void {
    this.action.isReady.subscribe((res: any) => {
      this.handle(this.action, 'start');
    });
  }

  ngOnDestroy() {
    this.action.stop();
  }

  public onEvent(e: ScannerQRCodeResult[], action?: any): void {

    let value = e[0].value;
    if (this.currentQrCodeValue !== value) {
      this.currentQrCodeValue = value;
      console.log(e);
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
    this.action.isStart ? this.action.stop() : this.action.start()
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

  private handle(action: any, fn: string): void {
    const playDeviceFacingBack = (devices: any[]) => {
      // front camera or back camera check here!
      const device = devices.find(f => (/back|rear|environment/gi.test(f.label))); // Default Back Facing Camera
      action.playDevice(device ? device.deviceId : devices[0].deviceId);
    }

    if (fn === 'start') {
      action[fn](playDeviceFacingBack).subscribe((r: any) => console.log(fn, r), alert);
    } else {
      action[fn]().subscribe((r: any) => console.log(fn, r), alert);
    }
  }



  private getUserFromApi(email: string) {
    this.currentUser = new UserModel();
    this.eventsRegisterApiService.getUser(email, 'ttamigosnatal2023')
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
    this.eventsRegisterApiService.getUser(email, 'ttamigosnatal2023')
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
            this.eventsRegisterApiService.checkInUser(email, 'ttamigosnatal2023')
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
    this.eventsRegisterApiService.cancelCheckInUser(email, 'ttamigosnatal2023')
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
