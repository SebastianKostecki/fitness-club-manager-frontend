import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EventColor } from 'calendar-utils';
import { BehaviorSubject, catchError, EMPTY, finalize, map, Observable, startWith, tap } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

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
          id: item.id,
          title: item.title,
          start: new Date(item.start),
          end: new Date(item.end),
          type: item.type,
          roomName: item.roomName,
          status: item.status,
          meta: item.meta || {  // Preserve the original meta object from backend
            type: item.type,
            roomName: item.roomName,
            status: item.status
          }
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
    const url = `${environment.apiUrl}/reservations/all`;
    return this.http.get<any[]>(url).pipe(
      tap(res => {
        console.log('🎫 Dane z backendu (all reservations):', res.length, 'rekordów');
        console.log('🔍 Pierwszy rekord:', res[0]);
        console.log('📊 Typy rezerwacji:', res.map(r => r.reservation_type).reduce((acc, type) => {
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {}));
        this.items.next(res);
        this.success.next(true);
      }),
      finalize(() => this.loading.next(false)),
      catchError(err => {
        console.error('❌ Błąd pobierania rezerwacji:', err);
        this.error.next(err);
        return EMPTY;
      })
    );
  }

  getCalendarEvents() {
    this.loading.next(true);
    this.error.next(null);
    this.success.next(false);
    
    // Get extended range to ensure we capture upcoming trainer classes
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 3, 0); // 3 months ahead
    
    // Add cache busting parameter
    const timestamp = new Date().getTime();
    const url = `${environment.apiUrl}/calendar/user?from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}&_t=${timestamp}`;
    
    return this.http.get<{events: any[]}>(url).pipe(
      tap(res => {
        console.log('Calendar events from backend:', res);
        this.items.next(res.events || []);
        // schedulerItems$ is a pipe, we don't need to call .next() on it
        this.success.next(true);
      }),
      finalize(() => this.loading.next(false)),
      catchError(err => {
        console.error('Error fetching calendar events:', err);
        this.error.next(err);
        return EMPTY;
      })
    );
  }

  addReservation(reservation: any) {
    this.addLoading.next(true);
    this.addError.next(null);
    this.addSuccess.next(false);
    const url = `${environment.apiUrl}/reservations`;
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
    const url = `${environment.apiUrl}/reservations/${reservationId}`;
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
    const url = `${environment.apiUrl}/reservations/${reservationId}`;
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

  // Delete room reservation
  deleteRoomReservation(reservationId: string) {
    this.deleteLoading.next(true);
    this.deleteError.next(null);
    this.deleteSuccess.next(false);
    const url = `${environment.apiUrl}/calendar/room-reservations/${reservationId}`;
    return this.http.delete(url).pipe(
      tap(() => {
        this.deleteSuccess.next(true);
        // Force immediate refresh
        this.getCalendarEvents().subscribe();
        // Also refresh after delay
        setTimeout(() => {
          this.getCalendarEvents().subscribe();
        }, 100);
        // One more refresh
        setTimeout(() => {
          this.getCalendarEvents().subscribe();
        }, 300);
        // Final refresh
        setTimeout(() => {
          this.getCalendarEvents().subscribe();
        }, 600);
      }),
      finalize(() => this.deleteLoading.next(false)),
      catchError(err => {
        this.deleteError.next(err);
        return EMPTY;
      })
    );
  }

  // Delete class reservation
  deleteClassReservation(reservationId: string) {
    this.deleteLoading.next(true);
    this.deleteError.next(null);
    this.deleteSuccess.next(false);
    const url = `${environment.apiUrl}/reservations/${reservationId}`;
    return this.http.delete(url).pipe(
      tap(() => {
        this.deleteSuccess.next(true);
        // Force immediate refresh
        this.getCalendarEvents().subscribe();
        // Also refresh after delay
        setTimeout(() => {
          this.getCalendarEvents().subscribe();
        }, 100);
        // One more refresh
        setTimeout(() => {
          this.getCalendarEvents().subscribe();
        }, 300);
        // Final refresh
        setTimeout(() => {
          this.getCalendarEvents().subscribe();
        }, 600);
      }),
      finalize(() => this.deleteLoading.next(false)),
      catchError(err => {
        this.deleteError.next(err);
        return EMPTY;
      })
    );
  }
}
