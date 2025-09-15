import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  UserID: number;
  Username: string;
  Email: string;
  Role: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<User> {
    return this.http.get<User>('http://localhost:8080/users/me').pipe(
      tap(user => {
        console.log('👤 Current user loaded:', user);
        this.currentUserSubject.next(user);
      })
    );
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getSystemMetrics(): Observable<any> {
    return this.http.get<any>('http://localhost:8080/users/metrics').pipe(
      tap(metrics => {
        console.log('📊 System metrics loaded:', metrics);
      })
    );
  }

  clearUser(): void {
    this.currentUserSubject.next(null);
  }
}
