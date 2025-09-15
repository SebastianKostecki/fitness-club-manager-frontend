import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log("🔐 AuthInterceptor - request URL:", req.url);
    const jwt = this.authService.jwt.getValue();
    const role = this.authService.role.getValue();   // np. "admin", "trener", "użytkownik"
    
    console.log("🔐 AuthInterceptor - JWT:", jwt ? "present" : "missing");
    console.log("🔐 AuthInterceptor - Role:", role);

    let headers = req.headers;

    if (jwt) {
      headers = headers.set('auth-token', `${jwt}`);
      console.log(headers);
    }

    if (role) {
      headers = headers.set('auth-role', role);  // Możesz zmienić nagłówek na dowolny
    }

    const authReq = req.clone({ headers });

    return next.handle(authReq);
  }
}