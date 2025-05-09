import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, finalize, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {

  private items: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private success: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private error: BehaviorSubject<HttpErrorResponse|null> = new BehaviorSubject<HttpErrorResponse|null>(null);

  public items$: Observable<any[]> = this.items.asObservable();
  public loading$: Observable<boolean> = this.loading.asObservable();
  public success$: Observable<boolean> = this.success.asObservable();
  public error$: Observable<HttpErrorResponse|null> = this.error.asObservable();

  private addLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public addSuccess: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private addError: BehaviorSubject<HttpErrorResponse|null> = new BehaviorSubject<HttpErrorResponse|null>(null);

  public addLoading$: Observable<boolean> = this.addLoading.asObservable();
  public addSuccess$: Observable<boolean> = this.addSuccess.asObservable();
  public addError$: Observable<HttpErrorResponse|null> = this.addError.asObservable();

  constructor(private http: HttpClient) { 

  }

  getRooms() {
    this.loading.next(true);
    this.error.next(null);
    this.success.next(false);
    const url= 'http://localhost:8080/rooms';
    return this.http.get<any[]>(url).pipe(
      tap((res)=>{
        this.items.next(res);
        this.success.next(true);
      }),
      finalize(()=>{
        this.loading.next(false);
      }),

      catchError((err)=>{
        console.log(err);
        this.error.next(err);
        return EMPTY
      })
    )
  }

  addRoom(room: any) {
    this.addLoading.next(true);
    this.addError.next(null);
    this.addSuccess.next(false);
    const url = 'http://localhost:8080/rooms';
    return this.http.post(url, room).pipe(
      tap((res)=>{
        this.addSuccess.next(true);
        this.getRooms().subscribe();
      }),
      finalize(()=>{
        this.addLoading.next(false);
      }),
      catchError((err)=>{
        console.log(err);
        this.addError.next(err);
        return EMPTY;
      })
    )
  }
}
