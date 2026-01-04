import { Component } from '@angular/core';
import { EventsRegisterApiService, UserModel } from '../events-register-api.service';

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

  constructor(private eventsRegisterApiService: EventsRegisterApiService) { }

  public searchUser(): void {
    // Reset states
    this.userNotFound = false;
    this.searchPerformed = true;
    this.currentUser = new UserModel();

    // Validate that at least one field is filled
    if (!this.phoneNumber.trim() && !this.email.trim()) {
      return;
    }

    this.isLoading = true;

    // Priority: phone number search first, then email
    if (this.phoneNumber.trim()) {
      this.searchByPhone(this.phoneNumber.trim());
    } else if (this.email.trim()) {
      this.searchByEmail(this.email.trim());
    }
  }

  private searchByPhone(phoneNumber: string): void {
    this.eventsRegisterApiService.getUserByPhone(phoneNumber, 'ttamigosnatal2025')
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          if (data != null) {
            this.currentUser = { ...data };
            this.userNotFound = false;
          } else {
            this.currentUser = new UserModel();
            this.userNotFound = true;
          }
        },
        error: () => {
          this.isLoading = false;
          this.currentUser = new UserModel();
          this.userNotFound = true;
        }
      });
  }

  private searchByEmail(email: string): void {
    this.eventsRegisterApiService.getUser(email, 'ttamigosnatal2025')
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          if (data != null) {
            this.currentUser = { ...data };
            this.userNotFound = false;
          } else {
            this.currentUser = new UserModel();
            this.userNotFound = true;
          }
        },
        error: () => {
          this.isLoading = false;
          this.currentUser = new UserModel();
          this.userNotFound = true;
        }
      });
  }

  public clearSelectedUser(): void {
    this.phoneNumber = '';
    this.email = '';
    this.currentUser = new UserModel();
    this.userNotFound = false;
    this.searchPerformed = false;
    this.isLoading = false;
  }

  public manualCheckInUser(): void {
    this.checkInUser(this.currentUser.userEmail, true);
  }

  public cancelCheckInUser(): void {
    this.eventsRegisterApiService.cancelCheckInUser(this.currentUser.userEmail, 'ttamigosnatal2025')
      .subscribe({
        next: () => {
          this.clearSelectedUser();
        },
        error: () => {
          this.currentUser = new UserModel();
          this.userNotFound = true;
        }
      });
  }

  private checkInUser(email: string, overrideComment: boolean): void {
    this.eventsRegisterApiService.getUser(email, 'ttamigosnatal2025')
      .subscribe({
        next: (data) => {
          if (data == null) {
            this.currentUser = new UserModel();
            this.userNotFound = true;
          } else if (data.checkedIn) {
            this.currentUser = { ...data };
          } else if (!data.paid || (data.metadata.comment != undefined && !overrideComment)) {
            this.currentUser = { ...data };
          } else {
            this.eventsRegisterApiService.checkInUser(email, 'ttamigosnatal2025')
              .subscribe({
                next: (data) => {
                  this.currentUser = { ...data };
                  this.userNotFound = false;
                },
                error: () => {
                  this.currentUser = new UserModel();
                  this.userNotFound = true;
                }
              });
          }
        },
        error: () => {
          this.currentUser = new UserModel();
          this.userNotFound = true;
        }
      });
  }
}
