import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { EventsRegisterApiService, UserModel } from '../events-register-api.service';

/**
 * Service to manage check-in mode logic and user state management.
 * This service centralizes the business logic for check-in/check-out workflows
 * and makes it reusable across different components (QR Reader, Search, etc.)
 * 
 * It also manages the global "modo checkin" (live mode) toggle state,
 * ensuring it stays synchronized across all views.
 */
@Injectable({
  providedIn: 'root'
})
export class CheckInModeService {

  /**
   * BehaviorSubject to manage the "modo checkin" (live mode) state.
   * When enabled, users are automatically checked in when scanned/searched.
   */
  private checkInModeEnabled$ = new BehaviorSubject<boolean>(false);

  constructor(private eventsRegisterApiService: EventsRegisterApiService) { }

  /**
   * Get an observable of the current check-in mode state.
   * Subscribe to this to react to changes in the check-in mode toggle.
   * @returns Observable<boolean> - emits true when check-in mode is enabled
   */
  public getCheckInModeState(): Observable<boolean> {
    return this.checkInModeEnabled$.asObservable();
  }

  /**
   * Get the current check-in mode state as a boolean value.
   * @returns boolean - true if check-in mode is enabled
   */
  public isCheckInModeEnabled(): boolean {
    return this.checkInModeEnabled$.value;
  }

  /**
   * Set the check-in mode state.
   * This will notify all subscribers of the state change.
   * @param enabled - true to enable check-in mode, false to disable
   */
  public setCheckInMode(enabled: boolean): void {
    this.checkInModeEnabled$.next(enabled);
  }

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

  /**
   * Handle post-edit user refresh and auto check-in logic
   * @param email User email
   * @param eventName Event name
   * @param liveMode Whether live mode is enabled
   * @returns Observable with refresh result and auto check-in status
   */
  public handleUserEditRefresh(email: string, eventName: string, liveMode: boolean): Observable<UserEditRefreshResult> {
    return this.eventsRegisterApiService.getUser(email, eventName).pipe(
      switchMap(data => {
        if (data === null) {
          return of({
            user: new UserModel(),
            userNotFound: true,
            alreadyCheckedIn: false,
            userHasComment: false,
            autoCheckedIn: false
          });
        }

        const userHasComment = data.metadata.comment !== undefined;
        const isValidForCheckIn = liveMode && data.paid && !data.checkedIn && !data.metadata.comment;

        if (isValidForCheckIn) {
          // Auto check-in the user
          return this.performCheckIn(email, eventName, false).pipe(
            map(checkInResult => ({
              user: checkInResult.user,
              userNotFound: checkInResult.userNotFound,
              alreadyCheckedIn: false,
              userHasComment: false,
              autoCheckedIn: checkInResult.success
            }))
          );
        } else {
          return of({
            user: { ...data },
            userNotFound: false,
            alreadyCheckedIn: data.checkedIn,
            userHasComment: userHasComment,
            autoCheckedIn: false
          });
        }
      }),
      catchError(() => of({
        user: new UserModel(),
        userNotFound: true,
        alreadyCheckedIn: false,
        userHasComment: false,
        autoCheckedIn: false
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

/**
 * Result of user edit refresh with auto check-in
 */
export interface UserEditRefreshResult extends UserStateResult {
  autoCheckedIn: boolean;
}
