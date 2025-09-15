import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, finalize, Observable, tap } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomEquipmentsService {
  private items = new BehaviorSubject<any[]>([]);
  private loading = new BehaviorSubject<boolean>(false);
  private error = new BehaviorSubject<HttpErrorResponse | null>(null);

  public items$ = this.items.asObservable();
  public loading$ = this.loading.asObservable();
  public error$ = this.error.asObservable();

  private addLoading = new BehaviorSubject<boolean>(false);
  public addSuccess = new BehaviorSubject<boolean>(false);
  private addError = new BehaviorSubject<HttpErrorResponse | null>(null);

  public addLoading$ = this.addLoading.asObservable();
  public addError$ = this.addError.asObservable();

  private deleteLoading = new BehaviorSubject<boolean>(false);
  private deleteSuccess = new BehaviorSubject<boolean>(false);
  private deleteError = new BehaviorSubject<HttpErrorResponse | null>(null);

  public deleteLoading$ = this.deleteLoading.asObservable();
  public deleteError$ = this.deleteError.asObservable();

  private editLoading = new BehaviorSubject<boolean>(false);
  public editSuccess = new BehaviorSubject<boolean>(false);
  private editError = new BehaviorSubject<HttpErrorResponse | null>(null);

  public editLoading$ = this.editLoading.asObservable();
  public editError$ = this.editError.asObservable();

  constructor(private http: HttpClient) {}

  getRoomEquipments() {
    this.loading.next(true);
    this.error.next(null);
    const url = '${environment.apiUrl}/room-equipment';
    return this.http.get<any[]>(url).pipe(
      tap((res) => {
        this.items.next(res);
      }),
      finalize(() => {
        this.loading.next(false);
      }),
      catchError((err) => {
        console.log(err);
        this.error.next(err);
        return EMPTY;
      })
    );
  }

  addRoomEquipment(data: any) {
    this.addLoading.next(true);
    this.addError.next(null);
    this.addSuccess.next(false);
    const url = '${environment.apiUrl}/room-equipment';
    return this.http.post(url, data).pipe(
      tap(() => {
        this.addSuccess.next(true);
        this.getRoomEquipments().subscribe();
      }),
      finalize(() => {
        this.addLoading.next(false);
      }),
      catchError((err) => {
        console.log(err);
        this.addError.next(err);
        return EMPTY;
      })
    );
  }

  deleteRoomEquipment(roomId: number, equipmentId: number) {
    this.deleteLoading.next(true);
    this.deleteError.next(null);
    this.deleteSuccess.next(false);
    const url = `${environment.apiUrl}/room-equipment/${roomId}/${equipmentId}`;
    return this.http.delete(url).pipe(
      tap(() => {
        this.deleteSuccess.next(true);
        this.getRoomEquipments().subscribe();
      }),
      finalize(() => {
        this.deleteLoading.next(false);
      }),
      catchError((err) => {
        console.log(err);
        this.deleteError.next(err);
        return EMPTY;
      })
    );
  }

  editRoomEquipment(roomId: number, equipmentId: number, updated: any) {
    this.editLoading.next(true);
    this.editError.next(null);
    this.editSuccess.next(false);
    const url = `${environment.apiUrl}/room-equipment/${roomId}/${equipmentId}`;
    return this.http.put(url, updated).pipe(
      tap(() => {
        this.editSuccess.next(true);
        this.getRoomEquipments().subscribe();
      }),
      finalize(() => {
        this.editLoading.next(false);
      }),
      catchError((err) => {
        console.log(err);
        this.editError.next(err);
        return EMPTY;
      })
    );
  }
}
