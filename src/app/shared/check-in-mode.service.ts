import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
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
    return this.eventsRegisterApiService.getUser(email, eventName).pipe(
      map(data => {
        if (data != null) {
          return {
            user: { ...data },
            userNotFound: false,
            alreadyCheckedIn: data.checkedIn,
            userHasComment: data.metadata.comment !== undefined
          };
        } else {
          return {
            user: new UserModel(),
            userNotFound: true,
            alreadyCheckedIn: false,
            userHasComment: false
          };
        }
      }),
      catchError(() => of({
        user: new UserModel(),
        userNotFound: true,
        alreadyCheckedIn: false,
        userHasComment: false
      }))
    );
  }

  /**
   * Perform check-in with validation logic
   * @param email User email
   * @param eventName Event name
   * @param overrideComment Whether to override comment validation (for manual check-in)
   * @returns Observable with check-in result
   */
  public performCheckIn(email: string, eventName: string, overrideComment: boolean): Observable<CheckInResult> {
    return this.eventsRegisterApiService.getUser(email, eventName).pipe(
      switchMap(data => {
        if (data == null) {
          return of({
            user: new UserModel(),
            userNotFound: true,
            alreadyCheckedIn: false,
            userHasComment: false,
            success: false
          });
        } else if (data.checkedIn) {
          return of({
            user: { ...data },
            userNotFound: false,
            alreadyCheckedIn: true,
            userHasComment: data.metadata.comment !== undefined,
            success: false
          });
        } else if (!data.paid || (data.metadata.comment !== undefined && !overrideComment)) {
          return of({
            user: { ...data },
            userNotFound: false,
            alreadyCheckedIn: false,
            userHasComment: data.metadata.comment !== undefined,
            success: false
          });
        } else {
          // All validations passed, perform check-in
          return this.eventsRegisterApiService.checkInUser(email, eventName).pipe(
            map(checkedInData => ({
              user: { ...checkedInData },
              userNotFound: false,
              alreadyCheckedIn: false,
              userHasComment: false,
              success: true
            })),
            catchError(() => of({
              user: new UserModel(),
              userNotFound: true,
              alreadyCheckedIn: false,
              userHasComment: false,
              success: false
            }))
          );
        }
      }),
      catchError(() => of({
        user: new UserModel(),
        userNotFound: true,
        alreadyCheckedIn: false,
        userHasComment: false,
        success: false
      }))
    );
  }

  /**
   * Cancel user check-in
   * @param email User email
   * @param eventName Event name
   * @returns Observable with cancellation result
   */
  public cancelCheckIn(email: string, eventName: string): Observable<CancelCheckInResult> {
    return this.eventsRegisterApiService.cancelCheckInUser(email, eventName).pipe(
      map(() => ({
        success: true,
        userNotFound: false
      })),
      catchError(() => of({
        success: false,
        userNotFound: true
      }))
    );
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
