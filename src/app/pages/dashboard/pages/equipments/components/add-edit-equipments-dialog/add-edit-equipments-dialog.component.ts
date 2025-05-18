import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EquipmentsService } from '../../services/equipments.service';

@Component({
  selector: 'app-add-edit-equipments-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-edit-equipments-dialog.component.html',
  styleUrl: './add-edit-equipments-dialog.component.scss'
})
export class AddEditEquipmentsDialogComponent implements OnInit {
  formGroup!: FormGroup;
  addLoading$ = this.equipmentsService.addLoading$;

  constructor(
    private fb: FormBuilder,
    private equipmentsService: EquipmentsService,
    private dialogRef: MatDialogRef<AddEditEquipmentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      EquipmentName: ['', Validators.required],
      Description: ['', Validators.required]
    });

    if (this.data?.isEdit) {
      this.formGroup.patchValue(this.data.equipment);
    }

    this.equipmentsService.addSuccess$.subscribe((success) => {
      if (success) {
        this.dialogRef.close();
        this.equipmentsService.addSuccess.next(false);
      }
    });

    this.equipmentsService.editSuccess$.subscribe((success) => {
      if (success) {
        this.dialogRef.close();
        this.equipmentsService.editSuccess.next(false);
      }
    });
  }

  onSubmit(): void {
    const formValue = this.formGroup.value;
    if (this.data?.isEdit) {
      const id = this.data.equipment?.EquipmentID;
      this.equipmentsService.editEquipment(id, formValue).subscribe();
    } else {
      this.equipmentsService.addEquipment(formValue).subscribe();
    }
  }
}
