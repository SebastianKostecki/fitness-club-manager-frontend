import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EventColor } from 'calendar-utils';
import { BehaviorSubject, catchError, EMPTY, finalize, map, Observable, startWith, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {

  private items = new BehaviorSubject<any[]>([]);
  private loading = new BehaviorSubject<boolean>(false);
  private success = new BehaviorSubject<boolean>(false);
  private error = new BehaviorSubject<HttpErrorResponse | null>(null);
  
  public items$: Observable<any[]> = this.items.asObservable();
  public loading$: Observable<boolean> = this.loading.asObservable();
  public success$: Observable<boolean> = this.success.asObservable();
  public error$: Observable<HttpErrorResponse | null> = this.error.asObservable();

  public colors: Record<string, EventColor> = {
    red: {
      primary: '#ad2121',
      secondary: '#FAE3E3',
    },
    blue: {
      primary: '#1e90ff',
      secondary: '#D1E8FF',
    },
    yellow: {
      primary: '#e3bc08',
      secondary: '#FDF1BA',
    },
  };

  public schedulerItems$ = this.items$.pipe(
    startWith([]),
    map((items)=>{
      return items.map((item)=>{
        return {
          title: item.fitness_class.Title,
          start: new Date(item.fitness_class.StartTime),
          end: new Date(item.fitness_class.EndTime), 
          color: this.colors['yellow']
        }
      })
    })
  )

  private addLoading = new BehaviorSubject<boolean>(false);
  public addSuccess = new BehaviorSubject<boolean>(false);
  private addError = new BehaviorSubject<HttpErrorResponse | null>(null);

  public addLoading$ = this.addLoading.asObservable();
  public addSuccess$ = this.addSuccess.asObservable();
  public addError$ = this.addError.asObservable();

  private deleteLoading = new BehaviorSubject<boolean>(false);
  private deleteSuccess = new BehaviorSubject<boolean>(false);
  private deleteError = new BehaviorSubject<HttpErrorResponse | null>(null);

  public deleteLoading$ = this.deleteLoading.asObservable();
  public deleteSuccess$ = this.deleteSuccess.asObservable();
  public deleteError$ = this.deleteError.asObservable();

  private editLoading = new BehaviorSubject<boolean>(false);
  public editSuccess = new BehaviorSubject<boolean>(false);
  private editError = new BehaviorSubject<HttpErrorResponse | null>(null);

  public editLoading$ = this.editLoading.asObservable();
  public editSuccess$ = this.editSuccess.asObservable();
  public editError$ = this.editError.asObservable();

  constructor(private http: HttpClient) {}

  getReservations() {
    this.loading.next(true);
    this.error.next(null);
    this.success.next(false);
    const url = 'https://fitness-club-manager-backend.onrender.com/reservations';
    return this.http.get<any[]>(url).pipe(
      tap(res => {
        console.log('Dane z backendu:', res);
        this.items.next(res);
        this.success.next(true);
      }),
      finalize(() => this.loading.next(false)),
      catchError(err => {
        this.error.next(err);
        return EMPTY;
      })
    );
  }

  addReservation(reservation: any) {
    this.addLoading.next(true);
    this.addError.next(null);
    this.addSuccess.next(false);
    const url = 'https://fitness-club-manager-backend.onrender.com/reservations';
    return this.http.post(url, reservation).pipe(
      tap(() => {
        this.addSuccess.next(true);
        this.getReservations().subscribe();
      }),
      finalize(() => this.addLoading.next(false)),
      catchError(err => {
        this.addError.next(err);
        return EMPTY;
      })
    );
  }

  deleteReservation(reservationId: number) {
    this.deleteLoading.next(true);
    this.deleteError.next(null);
    this.deleteSuccess.next(false);
    const url = `https://fitness-club-manager-backend.onrender.com/reservations/${reservationId}`;
    return this.http.delete(url).pipe(
      tap(() => {
        this.deleteSuccess.next(true);
        this.getReservations().subscribe();
      }),
      finalize(() => this.deleteLoading.next(false)),
      catchError(err => {
        this.deleteError.next(err);
        return EMPTY;
      })
    );
  }

  editReservation(reservationId: number, reservation: any) {
    this.editLoading.next(true);
    this.editError.next(null);
    this.editSuccess.next(false);
    const url = `https://fitness-club-manager-backend.onrender.com/reservations/${reservationId}`;
    return this.http.put(url, reservation).pipe(
      tap(() => {
        this.editSuccess.next(true);
        this.getReservations().subscribe();
      }),
      finalize(() => this.editLoading.next(false)),
      catchError(err => {
        this.editError.next(err);
        return EMPTY;
      })
    );
  }
}
