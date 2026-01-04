import { Injectable } from "@angular/core";
import { fetchAuthSession } from "aws-amplify/auth";
import { HttpInterceptor, HttpRequest, HttpHandler } from "@angular/common/http";
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  authToken = "";

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return from(fetchAuthSession()).pipe(
      switchMap((session) => {
        const token = session.tokens?.idToken?.toString() || '';
        const authReq = req.clone({
          headers: req.headers.set('Authorization', 'Bearer ' + token)
        });
      return next.handle(authReq);
      })
    )
  }
}
