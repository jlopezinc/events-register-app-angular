import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventsRegisterApiService, UserModel } from '../events-register-api.service';
import { CheckInModeService } from '../shared/check-in-mode.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserEditFormComponent } from '../shared/user-edit-form/user-edit-form.component';

const EVENT_NAME = 'ttamigosnatal2026';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css'],
    standalone: false
})
export class SearchComponent implements OnInit, OnDestroy {
  phoneNumber: string = '';
  email: string = '';
  currentUser: UserModel = new UserModel();
  userNotFound: boolean = false;
  isLoading: boolean = false;
  searchPerformed: boolean = false;
  /**
   * Local variable to track the check-in mode state
   * Synchronized with the shared service
   */
  liveMode: boolean = false;
  alreadyCheckedIn: boolean = false;
  userHasComment: boolean = false;

  /**
   * Subscription to the check-in mode state from the shared service
   */
  private checkInModeSubscription?: Subscription;

  constructor(
    private eventsRegisterApiService: EventsRegisterApiService,
    private checkInModeService: CheckInModeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Subscribe to the shared check-in mode state
    this.checkInModeSubscription = this.checkInModeService.getCheckInModeState()
      .subscribe(enabled => {
        this.liveMode = enabled;
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from the check-in mode state
    if (this.checkInModeSubscription) {
      this.checkInModeSubscription.unsubscribe();
    }
  }

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
      // Remove all spaces from phone number before sending to API
      const phoneNumberNoSpaces = this.phoneNumber.replace(/\s/g, '');
      if (phoneNumberNoSpaces) {
        this.eventsRegisterApiService.getUserByPhone(phoneNumberNoSpaces, EVENT_NAME)
          .subscribe(this.createSearchResultHandler());
      }
    } else if (this.email.trim()) {
      this.eventsRegisterApiService.getUser(this.email.trim(), EVENT_NAME)
        .subscribe(this.createSearchResultHandler());
    }
  }

  private createSearchResultHandler() {
    return {
      next: (data: UserModel | null) => {
        this.isLoading = false;
        if (data !== null) {
          this.currentUser = { ...data };
          this.userNotFound = false;
          this.userHasComment = data.metadata.comment !== undefined;
          
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

  public onEditUser(): void {
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
