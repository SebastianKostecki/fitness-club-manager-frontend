import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({
    providedIn: 'root'
  })
  export class AuthGuard implements CanActivate {
  
    constructor(private authService: AuthService, private router: Router) {}
  
    canActivate(): boolean {
      const jwt = localStorage.getItem('jwt');
      if (jwt) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    }
  }