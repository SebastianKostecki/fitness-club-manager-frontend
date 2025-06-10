import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, finalize, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FitnessClassesService {

  private items: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private success: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private error: BehaviorSubject<HttpErrorResponse | null> = new BehaviorSubject<HttpErrorResponse | null>(null);

  public items$: Observable<any[]> = this.items.asObservable();
  public loading$: Observable<boolean> = this.loading.asObservable();
  public success$: Observable<boolean> = this.success.asObservable();
  public error$: Observable<HttpErrorResponse | null> = this.error.asObservable();

  private addLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public addSuccess: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private addError: BehaviorSubject<HttpErrorResponse | null> = new BehaviorSubject<HttpErrorResponse | null>(null);

  public addLoading$: Observable<boolean> = this.addLoading.asObservable();
  public addSuccess$: Observable<boolean> = this.addSuccess.asObservable();
  public addError$: Observable<HttpErrorResponse | null> = this.addError.asObservable();

  private deleteLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private deleteSuccess: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private deleteError: BehaviorSubject<HttpErrorResponse | null> = new BehaviorSubject<HttpErrorResponse | null>(null);

  public deleteLoading$: Observable<boolean> = this.deleteLoading.asObservable();
  public deleteSuccess$: Observable<boolean> = this.deleteSuccess.asObservable();
  public deleteError$: Observable<HttpErrorResponse | null> = this.deleteError.asObservable();

  private editLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public editSuccess: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private editError: BehaviorSubject<HttpErrorResponse | null> = new BehaviorSubject<HttpErrorResponse | null>(null);

  public editLoading$: Observable<boolean> = this.editLoading.asObservable();
  public editSuccess$: Observable<boolean> = this.editSuccess.asObservable();
  public editError$: Observable<HttpErrorResponse | null> = this.editError.asObservable();

  constructor(private http: HttpClient) {}

  getClasses() {
    this.loading.next(true);
    this.error.next(null);
    this.success.next(false);
    const url = 'https://fitness-club-manager-backend.onrender.com/classes';
    return this.http.get<any[]>(url).pipe(
      tap((res) => {
        this.items.next(res);
        this.success.next(true);
      }),
      finalize(() => this.loading.next(false)),
      catchError((err) => {
        console.log(err);
        this.error.next(err);
        return EMPTY;
      })
    );
  }

  addClass(fitnessClass: any) {
    this.addLoading.next(true);
    this.addError.next(null);
    this.addSuccess.next(false);
    const url = 'https://fitness-club-manager-backend.onrender.com/classes';
    return this.http.post(url, fitnessClass).pipe(
      tap((res) => {
        this.addSuccess.next(true);
        this.getClasses().subscribe();
      }),
      finalize(() => this.addLoading.next(false)),
      catchError((err) => {
        console.log(err);
        this.addError.next(err);
        return EMPTY;
      })
    );
  }

  deleteClass(classId: number) {
    this.deleteLoading.next(true);
    this.deleteError.next(null);
    this.deleteSuccess.next(false);
    const url = 'https://fitness-club-manager-backend.onrender.com/classes/' + classId;
    return this.http.delete(url).pipe(
      tap((res) => {
        this.deleteSuccess.next(true);
        this.getClasses().subscribe();
      }),
      finalize(() => this.deleteLoading.next(false)),
      catchError((err) => {
        console.log(err);
        this.deleteError.next(err);
        return EMPTY;
      })
    );
  }

  editClass(classId: number, fitnessClass: any) {
    this.editLoading.next(true);
    this.editError.next(null);
    this.editSuccess.next(false);
    const url = 'https://fitness-club-manager-backend.onrender.com/classes/' + classId;
    return this.http.put(url, fitnessClass).pipe(
      tap((res) => {
        this.editSuccess.next(true);
        this.getClasses().subscribe();
      }),
      finalize(() => this.editLoading.next(false)),
      catchError((err) => {
        console.log(err);
        this.editError.next(err);
        return EMPTY;
      })
    );
  }
}
