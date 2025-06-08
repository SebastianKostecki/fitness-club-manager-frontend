import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FitnessClassesService } from '../../services/fitness-classes.service';

@Component({
  selector: 'app-add-edit-fitness-class-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './add-edit-fitness-class-dialog.component.html',
  styleUrl: './add-edit-fitness-class-dialog.component.scss'
})
export class AddEditFitnessClassDialogComponent implements OnInit {
  formGroup!: FormGroup;
  addLoading$ = this.fitnessClassesService.addLoading$;

  constructor(
    private fb: FormBuilder,
    private fitnessClassesService: FitnessClassesService,
    private dialogRef: MatDialogRef<AddEditFitnessClassDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      TrainerID: ['', Validators.required],
      RoomID: ['', Validators.required],
      Title: ['', Validators.required],
      StartTime: ['', Validators.required],
      EndTime: ['', Validators.required],
      Capacity: ['', Validators.required],
      Status: ['Active', Validators.required]
    });

    if (this.data?.isEdit && this.data?.fitnessClass) {
      this.formGroup.patchValue(this.data.fitnessClass);
    }

    this.fitnessClassesService.addSuccess$.subscribe((success) => {
      if (success) {
        this.dialogRef.close();
        this.fitnessClassesService.addSuccess.next(false);
      }
    });

    this.fitnessClassesService.editSuccess$.subscribe((success) => {
      if (success) {
        this.dialogRef.close();
        this.fitnessClassesService.editSuccess.next(false);
      }
    });
  }

  onSubmit(): void {
    const formValue = this.formGroup.value;

    if (this.data?.isEdit) {
      const classId = this.data?.fitnessClass?.ClassID;
      this.fitnessClassesService.editClass(classId, formValue).subscribe();
    } else {
      this.fitnessClassesService.addClass(formValue).subscribe();
    }
  }
}
