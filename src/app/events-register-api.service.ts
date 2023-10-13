import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


export class UserModel {
  eventName: string = "";
  userEmail: string = "";
  paid: boolean = false;
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

}

export class Vehicle {
  plate: string = "";
  make: string = "";
  model: string = "";
}

export class People {
  type: string = "";
  name: string = "";
  driversLicense: string = "";
  phoneNumber: string = "";
}

export class CheckIn {
  checkInAt: Date | undefined;
  byWho: string = "";
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

  checkInUser(email: string, eventName: string) {
    return this.http.put<UserModel>(this.api + '/v1/' + eventName + '/' + email, null)
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
