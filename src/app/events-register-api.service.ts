import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


export class UserModel {
  eventName: string = "";
  userEmail: string = "";
  paid: boolean = false;
  checkedIn: boolean = false;
  vehicleType: string = "";
  metadata: Metadata = new Metadata();
}



export class Metadata {
  vehicle: Vehicle = new Vehicle();
  people: People[] = [];
  phoneNumber: string = "";
  registeredAt: Date | undefined;
  paidAt: Date | undefined;
  checkIn: CheckIn = new CheckIn();
  paymentInfo: PaymentInfo = new PaymentInfo();
  comment: string | undefined;
  changeHistory: ChangeHistoryEntry[] = [];
}

export class Vehicle {
  plate: string = "";
  make: string = "";
  model: string = "";
}

export class PaymentInfo {
  amount: number = 0;
  byWho: string = "";
  confirmedAt: Date | undefined;
  paymentFile: string = "";
}

export class People {
  type: string = "";
  name: string = "";
  driversLicense: string = "";
  phoneNumber: string = "";
  cc: string = "";
}

export class CheckIn {
  checkInAt: Date | undefined;
  byWho: string = "";
}

export class ChangeHistoryEntry {
  timestamp: Date | undefined;
  action: string = "";
  description: string = "";
}

export class Counters {
  total: number = 0;
  totalCar: number = 0;
  totalMotorcycle: number = 0;
  totalQuad: number = 0;
  totalParticipants: number = 0;
  paid: number = 0;
  paidCar: number = 0;
  paidMotorcycle: number = 0;
  paidQuad: number = 0;
  checkedIn: number = 0;
  checkedInCar: number = 0;
  checkedInMotorcycle: number = 0;
  checkedInQuad: number = 0;
  participantsCheckedIn: number = 0;
  participantsNotCheckedIn: number = 0;
}

export interface ReconcileCountersResponse {
  eventId: string;
  status: string;
  before: Counters;
  after: Counters;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventsRegisterApiService {


  constructor(private http: HttpClient) { }

  api = 'https://3692kus1h1.execute-api.eu-north-1.amazonaws.com';

  getUser(email: string, eventName: string) {
    return this.http.get<UserModel>(this.api + '/v1/' + eventName + '/' + email)
      .pipe(catchError(this.handleError));
  }

  getUserByPhone(phoneNumber: string, eventName: string) {
    return this.http.get<UserModel>(this.api + '/v1/' + eventName + '/phone/' + phoneNumber)
      .pipe(catchError(this.handleError));
  }

  getCounters(eventName: string) {
    return this.http.get<Counters>(this.api + '/v1/' + eventName + '/counters')
      .pipe(catchError(this.handleError));
  }

  checkInUser(email: string, eventName: string) {
    // todo, send byWho
    return this.http.put<UserModel>(this.api + '/v2/' + eventName + '/' + email + '/checkin', null)
      .pipe(catchError(this.handleError));
  }

  cancelCheckInUser(email: string, eventName: string) {
    // todo, send byWho
    return this.http.delete<UserModel>(this.api + '/v2/' + eventName + '/' + email + '/checkin')
      .pipe(catchError(this.handleError));
  }

  updateUser(email: string, eventName: string, userData: UserModel) {
    return this.http.put<UserModel>(this.api + '/v2/' + eventName + '/' + email, userData)
      .pipe(catchError(this.handleError));
  }

  reconcileCounters(eventName: string) {
    return this.http.post<ReconcileCountersResponse>(this.api + '/v1/reconcile-counters/' + eventName, null)
      .pipe(catchError(this.handleError));
  }



  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }
}
