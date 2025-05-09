import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private jwt: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  public jwt$: Observable<string | null> = this.jwt.asObservable();

  constructor(private http: HttpClient){}

  login(login: any){
    const url = 'http://localhost:8080/login';
    return this.http.post<{jwt:string}>(url, login).pipe(
      tap((res: {jwt:string})=>{
        console.log(res)
        this.jwt.next(res.jwt)
      })
    )
  }
}

