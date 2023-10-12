import { Injectable } from "@angular/core";
import { Auth } from "aws-amplify";
import { HttpInterceptor, HttpRequest, HttpHandler } from "@angular/common/http";
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  authToken = "";

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return from(Auth.currentSession()).pipe(
      switchMap((data) => {
        const authReq = req.clone({
          headers: req.headers.set('Authorization', 'Bearer ' + data.getIdToken().getJwtToken())
        });
      return next.handle(authReq);
      })
    )
  }
}
