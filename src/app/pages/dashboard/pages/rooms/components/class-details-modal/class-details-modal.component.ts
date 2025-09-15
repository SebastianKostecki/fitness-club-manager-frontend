import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FitnessClassesService } from '../../../fitness-classes/services/fitness-classes.service';
import { UserService } from '../../../../../../shared/services/user.service';

export interface ClassDetailsData {
  classId: number;
  title: string;
  startTime: string;
  endTime: string;
  capacity: number;
  currentReservations?: number;
  availableSpots?: number;
  isFull?: boolean;
  trainerName?: string;
  roomName?: string;
  userReservation?: {
    id: number;
    status: string;
  } | null;
}

@Component({
  selector: 'app-class-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './class-details-modal.component.html',
  styleUrls: ['./class-details-modal.component.scss']
})
export class ClassDetailsModalComponent implements OnInit {
  loading = false;
  booking = false;
  currentUser: any;
  classDetails: ClassDetailsData;

  constructor(
    public dialogRef: MatDialogRef<ClassDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClassDetailsData,
    private fitnessClassesService: FitnessClassesService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.currentUser = this.userService.getCurrentUserValue();
    this.classDetails = data;
  }

  ngOnInit(): void {
    // Load current user if not already loaded
    if (!this.currentUser) {
      this.userService.getCurrentUser().subscribe({
        next: (user) => {
          this.currentUser = user;
          console.log('Current user loaded in modal:', this.currentUser);
          console.log('User role:', this.currentUser?.Role);
        },
        error: (error) => {
          console.error('Error loading current user:', error);
        }
      });
    } else {
      console.log('Current user in modal:', this.currentUser);
      console.log('User role:', this.currentUser?.Role);
    }
    
    // Load fresh class details to get current availability
    this.loadClassDetails();
  }

  loadClassDetails(): void {
    this.loading = true;
    
    // Fetch fresh data from the server
    this.fitnessClassesService.getClassById(this.data.classId).subscribe({
      next: (classData) => {
        console.log('🔄 Fresh class data loaded:', classData);
        this.classDetails = {
          classId: classData.ClassID,
          title: classData.Title,
          startTime: classData.StartTime,
          endTime: classData.EndTime,
          capacity: classData.Capacity,
          currentReservations: classData.currentReservations || 0,
          availableSpots: classData.availableSpots || classData.Capacity,
          isFull: classData.isFull || false,
          trainerName: classData.trainer?.Username || 'Nieznany trener',
          roomName: classData.room?.RoomName || 'Nieznana sala',
          userReservation: classData.userReservation
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading class details:', error);
        // Fallback to calendar data if API fails
        this.classDetails = {
          ...this.data,
          currentReservations: this.data.currentReservations || 0,
          availableSpots: this.data.availableSpots || this.data.capacity,
          isFull: this.data.isFull || false,
          trainerName: this.data.trainerName || 'Nieznany trener',
          roomName: this.data.roomName || 'Nieznana sala'
        };
        this.loading = false;
      }
    });
  }

  bookClass(): void {
    console.log('🎯 Attempting to book class:', {
      classId: this.classDetails.classId,
      userId: this.currentUser?.UserID,
      userRole: this.currentUser?.Role
    });

    if (!this.currentUser) {
      console.log('❌ No current user');
      this.snackBar.open('Musisz być zalogowany, aby zapisać się na zajęcia', 'Zamknij', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (this.classDetails.isFull) {
      console.log('❌ Class is full');
      this.snackBar.open('Brak wolnych miejsc na te zajęcia', 'Zamknij', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    console.log('✅ Proceeding with booking...');
    this.booking = true;
    this.fitnessClassesService.bookClass(this.classDetails.classId, this.currentUser.UserID).subscribe({
      next: (response) => {
        console.log('✅ Booking successful:', response);
        this.snackBar.open('Pomyślnie zapisano na zajęcia!', 'Zamknij', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.booking = false;
        // Refresh class details
        this.loadClassDetails();
      },
      error: (error) => {
        console.error('❌ Booking error:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', error.error);
        
        const errorMessage = error.error?.message || `Wystąpił błąd podczas zapisywania na zajęcia (${error.status})`;
        this.snackBar.open(errorMessage, 'Zamknij', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.booking = false;
      }
    });
  }

  cancelReservation(): void {
    if (!this.classDetails.userReservation) {
      console.log('❌ No reservation to cancel');
      return;
    }

    console.log('🗑️ Cancelling reservation:', this.classDetails.userReservation.id);
    this.booking = true;
    
    this.fitnessClassesService.cancelReservation(this.classDetails.userReservation.id).subscribe({
      next: (response) => {
        console.log('✅ Reservation cancelled successfully:', response);
        this.snackBar.open('Rezerwacja została anulowana!', 'Zamknij', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.booking = false;
        // Refresh class details
        this.loadClassDetails();
      },
      error: (error) => {
        console.error('❌ Cancel reservation error:', error);
        const errorMessage = error.error?.message || `Wystąpił błąd podczas anulowania rezerwacji (${error.status})`;
        this.snackBar.open(errorMessage, 'Zamknij', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.booking = false;
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
