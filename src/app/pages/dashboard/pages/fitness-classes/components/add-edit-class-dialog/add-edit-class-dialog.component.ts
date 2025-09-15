import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { FitnessClassesService } from '../../services/fitness-classes.service';
import { UserService } from '../../../../../../shared/services/user.service';
import { RoomsService } from '../../../rooms/services/rooms.service';

@Component({
  selector: 'app-add-edit-class-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-edit-class-dialog.component.html',
  styleUrls: ['./add-edit-class-dialog.component.scss']
})
export class AddEditClassDialogComponent implements OnInit {
  classForm: FormGroup;
  isEdit = false;
  loading = false;
  currentUser: any;
  rooms$: Observable<any[]>;

  constructor(
    public dialogRef: MatDialogRef<AddEditClassDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private fitnessClassesService: FitnessClassesService,
    private userService: UserService,
    private roomsService: RoomsService
  ) {
    this.currentUser = this.userService.getCurrentUserValue();
    this.isEdit = !!data?.class;
    this.rooms$ = this.roomsService.items$;
    
    this.classForm = this.fb.group({
      Title: ['', [Validators.required, Validators.maxLength(100)]],
      StartTime: ['', Validators.required],
      EndTime: ['', Validators.required],
      Capacity: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      RoomID: ['', Validators.required],
      Status: ['Active', Validators.required]
    });

    if (this.isEdit && data.class) {
      // Convert dates to datetime-local format (YYYY-MM-DDTHH:mm)
      const startDate = new Date(data.class.StartTime);
      const endDate = new Date(data.class.EndTime);
      
      this.classForm.patchValue({
        Title: data.class.Title,
        StartTime: this.formatDateForInput(startDate),
        EndTime: this.formatDateForInput(endDate),
        Capacity: data.class.Capacity,
        RoomID: data.class.RoomID,
        Status: data.class.Status
      });
    }
  }

  ngOnInit(): void {
    // Load rooms for dropdown
    this.roomsService.getRooms().subscribe();
    
    // Set default trainer to current user if they are a trainer
    if (this.currentUser?.Role === 'trainer' && !this.isEdit) {
      // TrainerID will be set in the form submission
    }
  }

  formatDateForInput(date: Date): string {
    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSubmit(): void {
    if (this.classForm.valid) {
      this.loading = true;
      const formData = this.classForm.value;
      
      // Add TrainerID for new classes
      if (!this.isEdit && this.currentUser?.Role === 'trainer') {
        formData.TrainerID = this.currentUser.UserID;
      }

      // Convert datetime-local format to ISO string
      formData.StartTime = new Date(formData.StartTime).toISOString();
      formData.EndTime = new Date(formData.EndTime).toISOString();

      if (this.isEdit) {
        this.fitnessClassesService.editClass(this.data.class.ClassID, formData).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error updating class:', error);
            this.loading = false;
          }
        });
      } else {
        this.fitnessClassesService.addClass(formData).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error creating class:', error);
            this.loading = false;
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
