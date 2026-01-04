import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EventsRegisterApiService, UserModel } from '../events-register-api.service';

/**
 * Service to manage check-in mode logic and user state management.
 * This service centralizes the business logic for check-in/check-out workflows
 * and makes it reusable across different components (QR Reader, Search, etc.)
 */
@Injectable({
  providedIn: 'root'
})
export class CheckInModeService {

  constructor(private eventsRegisterApiService: EventsRegisterApiService) { }

  /**
   * Get user from API and update state flags
   * @param email User email
   * @param eventName Event name
   * @returns Observable with user data, userNotFound, alreadyCheckedIn, and userHasComment flags
   */
  public getUserWithState(email: string, eventName: string): Observable<UserStateResult> {
    return new Observable(observer => {
      this.eventsRegisterApiService.getUser(email, eventName)
        .subscribe({
          next: (data) => {
            if (data != null) {
              observer.next({
                user: { ...data },
                userNotFound: false,
                alreadyCheckedIn: false,
                userHasComment: data.metadata.comment != undefined
              });
            } else {
              observer.next({
                user: new UserModel(),
                userNotFound: true,
                alreadyCheckedIn: false,
                userHasComment: false
              });
            }
            observer.complete();
          },
          error: () => {
            observer.next({
              user: new UserModel(),
              userNotFound: true,
              alreadyCheckedIn: false,
              userHasComment: false
            });
            observer.complete();
          }
        });
    });
  }

  /**
   * Perform check-in with validation logic
   * @param email User email
   * @param eventName Event name
   * @param overrideComment Whether to override comment validation (for manual check-in)
   * @returns Observable with check-in result
   */
  public performCheckIn(email: string, eventName: string, overrideComment: boolean): Observable<CheckInResult> {
    return new Observable(observer => {
      this.eventsRegisterApiService.getUser(email, eventName)
        .subscribe({
          next: (data) => {
            if (data == null) {
              observer.next({
                user: new UserModel(),
                userNotFound: true,
                alreadyCheckedIn: false,
                userHasComment: false,
                success: false
              });
              observer.complete();
            } else if (data.checkedIn) {
              // User is already checked in
              observer.next({
                user: { ...data },
                userNotFound: false,
                alreadyCheckedIn: true,
                userHasComment: data.metadata.comment != undefined,
                success: false
              });
              observer.complete();
            } else if (!data.paid || (data.metadata.comment != undefined && !overrideComment)) {
              // User hasn't paid or has a comment that needs manual verification
              observer.next({
                user: { ...data },
                userNotFound: false,
                alreadyCheckedIn: false,
                userHasComment: data.metadata.comment != undefined,
                success: false
              });
              observer.complete();
            } else {
              // All validations passed, perform check-in
              this.eventsRegisterApiService.checkInUser(email, eventName)
                .subscribe({
                  next: (checkedInData) => {
                    observer.next({
                      user: { ...checkedInData },
                      userNotFound: false,
                      alreadyCheckedIn: false,
                      userHasComment: false,
                      success: true
                    });
                    observer.complete();
                  },
                  error: () => {
                    observer.next({
                      user: new UserModel(),
                      userNotFound: true,
                      alreadyCheckedIn: false,
                      userHasComment: false,
                      success: false
                    });
                    observer.complete();
                  }
                });
            }
          },
          error: () => {
            observer.next({
              user: new UserModel(),
              userNotFound: true,
              alreadyCheckedIn: false,
              userHasComment: false,
              success: false
            });
            observer.complete();
          }
        });
    });
  }

  /**
   * Cancel user check-in
   * @param email User email
   * @param eventName Event name
   * @returns Observable with cancellation result
   */
  public cancelCheckIn(email: string, eventName: string): Observable<CancelCheckInResult> {
    return new Observable(observer => {
      this.eventsRegisterApiService.cancelCheckInUser(email, eventName)
        .subscribe({
          next: () => {
            observer.next({
              success: true,
              userNotFound: false
            });
            observer.complete();
          },
          error: () => {
            observer.next({
              success: false,
              userNotFound: true
            });
            observer.complete();
          }
        });
    });
  }
}

/**
 * Result of getting user with state
 */
export interface UserStateResult {
  user: UserModel;
  userNotFound: boolean;
  alreadyCheckedIn: boolean;
  userHasComment: boolean;
}

/**
 * Result of performing check-in
 */
export interface CheckInResult extends UserStateResult {
  success: boolean;
}

/**
 * Result of cancelling check-in
 */
export interface CancelCheckInResult {
  success: boolean;
  userNotFound: boolean;
}
