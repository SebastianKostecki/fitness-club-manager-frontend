import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, tap } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public jwt: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  public jwt$: Observable<string | null> = this.jwt.asObservable();

  public role: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  public role$: Observable<string | null> = this.role.asObservable();

  constructor(private http: HttpClient, private router:Router){}

  login(login: any){
    const url = 'http://localhost:8080/login';
    return this.http.post<{jwt:string; role:string}>(url, login).pipe(
      tap((res: {jwt:string; role:string})=>{
        console.log(res)
        this.jwt.next(res.jwt)
        this.role.next(res.role)
        localStorage.setItem('jwt', res.jwt)
        localStorage.setItem('role', res.role)
        this.router.navigate(['/dashboard']);
      })
    )
  }

  getInitJwt(): void {
    const value = localStorage.getItem('jwt');
    if (value){
      this.jwt.next(value)
    }
  }

  getInitRole(): void {
    const value = localStorage.getItem('role');
    if (value){
      this.role.next(value)
    }
  }

  logout(): void {
    this.jwt.next(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }



}

