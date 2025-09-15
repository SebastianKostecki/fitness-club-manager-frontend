import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReservationsService } from '../../services/reservations.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-edit-reservation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-edit-reservation-dialog.component.html',
  styleUrl: './add-edit-reservation-dialog.component.scss'
})
export class AddEditReservationDialogComponent implements OnInit {
  formGroup!: FormGroup;
  addLoading$ = this.reservationsService.addLoading$;

  users: any[] = [];
  classes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private reservationsService: ReservationsService,
    private dialogRef: MatDialogRef<AddEditReservationDialogComponent>,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      UserID: ['', Validators.required],
      ClassID: ['', Validators.required],
      Status: ['', Validators.required]
    });

    if (this.data?.isEdit) {
      this.formGroup.patchValue(this.data.reservation);
    }

    this.http.get<any[]>('http://localhost:8080/users').subscribe((users) => (this.users = users));
    this.http.get<any[]>('http://localhost:8080/classes').subscribe((classes) => (this.classes = classes));

    this.reservationsService.addSuccess$.subscribe((success) => {
      if (success) {
        this.dialogRef.close();
        this.reservationsService.addSuccess.next(false);
      }
    });

    this.reservationsService.editSuccess$.subscribe((success) => {
      if (success) {
        this.dialogRef.close();
        this.reservationsService.editSuccess.next(false);
      }
    });
  }

  onSubmit(): void {
    const formValue = this.formGroup.value;
    if (this.data?.isEdit) {
      const id = this.data.reservation?.ReservationID;
      this.reservationsService.editReservation(id, formValue).subscribe();
    } else {
      this.reservationsService.addReservation(formValue).subscribe();
    }
  }
}
