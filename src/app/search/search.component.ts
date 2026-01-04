import { Component } from '@angular/core';
import { EventsRegisterApiService, UserModel } from '../events-register-api.service';
import { CheckInModeService } from '../shared/check-in-mode.service';

const EVENT_NAME = 'ttamigosnatal2026';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css'],
    standalone: false
})
export class SearchComponent {
  phoneNumber: string = '';
  email: string = '';
  currentUser: UserModel = new UserModel();
  userNotFound: boolean = false;
  isLoading: boolean = false;
  searchPerformed: boolean = false;
  liveMode: boolean = false; // "modo checkin" flag
  alreadyCheckedIn: boolean = false;
  userHasComment: boolean = false;

  constructor(
    private eventsRegisterApiService: EventsRegisterApiService,
    private checkInModeService: CheckInModeService
  ) { }

  public searchUser(): void {
    // Reset states
    this.userNotFound = false;
    this.searchPerformed = true;
    this.currentUser = new UserModel();
    this.alreadyCheckedIn = false;
    this.userHasComment = false;

    // Validate that at least one field is filled
    if (!this.phoneNumber.trim() && !this.email.trim()) {
      return;
    }

    this.isLoading = true;

    // Priority: phone number search first, then email
    if (this.phoneNumber.trim()) {
      this.eventsRegisterApiService.getUserByPhone(this.phoneNumber.trim(), EVENT_NAME)
        .subscribe(this.createSearchResultHandler());
    } else if (this.email.trim()) {
      this.eventsRegisterApiService.getUser(this.email.trim(), EVENT_NAME)
        .subscribe(this.createSearchResultHandler());
    }
  }

  private createSearchResultHandler() {
    return {
      next: (data: UserModel | null) => {
        this.isLoading = false;
        if (data != null) {
          this.currentUser = { ...data };
          this.userNotFound = false;
          this.userHasComment = data.metadata.comment != undefined;
          
          // If in live mode, automatically attempt check-in
          if (this.liveMode) {
            this.performCheckIn(data.userEmail, false);
          }
        } else {
          this.currentUser = new UserModel();
          this.userNotFound = true;
          this.alreadyCheckedIn = false;
          this.userHasComment = false;
        }
      },
      error: () => {
        this.isLoading = false;
        this.currentUser = new UserModel();
        this.userNotFound = true;
        this.alreadyCheckedIn = false;
        this.userHasComment = false;
      }
    };
  }

  public clearSelectedUser(): void {
    this.phoneNumber = '';
    this.email = '';
    this.currentUser = new UserModel();
    this.userNotFound = false;
    this.searchPerformed = false;
    this.isLoading = false;
    this.alreadyCheckedIn = false;
    this.userHasComment = false;
  }

  public setLiveMode(e: any): void {
    this.liveMode = e.checked;
  }

  public manualCheckInUser(): void {
    this.performCheckIn(this.currentUser.userEmail, true);
  }

  public cancelCheckInUser(): void {
    this.checkInModeService.cancelCheckIn(this.currentUser.userEmail, EVENT_NAME)
      .subscribe(result => {
        this.clearSelectedUser();
      });
  }

  private performCheckIn(email: string, overrideComment: boolean): void {
    this.checkInModeService.performCheckIn(email, EVENT_NAME, overrideComment)
      .subscribe(result => {
        this.currentUser = result.user;
        this.userNotFound = result.userNotFound;
        this.alreadyCheckedIn = result.alreadyCheckedIn;
        this.userHasComment = result.userHasComment;
      });
  }
}
