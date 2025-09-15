import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, finalize, Observable, tap } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EquipmentsService {

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

  private deleteLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private deleteSuccess: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private deleteError: BehaviorSubject<HttpErrorResponse|null> = new BehaviorSubject<HttpErrorResponse|null>(null);

  public deleteLoading$: Observable<boolean> = this.deleteLoading.asObservable();
  public deleteSuccess$: Observable<boolean> = this.deleteSuccess.asObservable();
  public deleteError$: Observable<HttpErrorResponse|null> = this.deleteError.asObservable();

  private editLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public editSuccess: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private editError: BehaviorSubject<HttpErrorResponse|null> = new BehaviorSubject<HttpErrorResponse|null>(null);

  public editLoading$: Observable<boolean> = this.editLoading.asObservable();
  public editSuccess$: Observable<boolean> = this.editSuccess.asObservable();
  public editError$: Observable<HttpErrorResponse|null> = this.editError.asObservable();

  constructor(private http: HttpClient) {}

  getEquipments() {
    this.loading.next(true);
    this.error.next(null);
    this.success.next(false);
    const url = `${environment.apiUrl}/equipment`;
    return this.http.get<any[]>(url).pipe(
      tap((res) => {
        this.items.next(res);
        this.success.next(true);
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

  addEquipment(equipment: any) {
    this.addLoading.next(true);
    this.addError.next(null);
    this.addSuccess.next(false);
    const url = `${environment.apiUrl}/equipment`;
    return this.http.post(url, equipment).pipe(
      tap(() => {
        this.addSuccess.next(true);
        this.getEquipments().subscribe();
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

  deleteEquipment(equipmentId: number) {
    this.deleteLoading.next(true);
    this.deleteError.next(null);
    this.deleteSuccess.next(false);
    const url = `${environment.apiUrl}/equipment/` + equipmentId;
    return this.http.delete(url).pipe(
      tap(() => {
        this.deleteSuccess.next(true);
        this.getEquipments().subscribe();
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

  editEquipment(equipmentId: number, equipment: any) {
    this.editLoading.next(true);
    this.editError.next(null);
    this.editSuccess.next(false);
    const url = `${environment.apiUrl}/equipment/` + equipmentId;
    return this.http.put(url, equipment).pipe(
      tap(() => {
        this.editSuccess.next(true);
        this.getEquipments().subscribe();
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
