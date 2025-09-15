import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FitnessClassesService } from './services/fitness-classes.service';
import { UserService } from '../../../../shared/services/user.service';
import { AddEditClassDialogComponent } from './components/add-edit-class-dialog/add-edit-class-dialog.component';
import { Observable, map } from 'rxjs';

export interface FitnessClass {
  ClassID: number;
  TrainerID: number | null;
  RoomID: string;
  Title: string;
  StartTime: string;
  EndTime: string;
  Capacity: number;
  Status: string;
  CreatedAt: string;
  UpdatedAt: string;
  currentReservations?: number;
  availableSpots?: number;
  isFull?: boolean;
  trainer?: {
    UserID: number;
    Username: string;
  };
  room?: {
    RoomID: number;
    RoomName: string;
  };
}

@Component({
  selector: 'app-fitness-classes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './fitness-classes.component.html',
  styleUrls: ['./fitness-classes.component.scss']
})
export class FitnessClassesComponent implements OnInit {
  allClasses$: Observable<FitnessClass[]>;
  upcomingClasses$: Observable<FitnessClass[]>;
  pastClasses$: Observable<FitnessClass[]>;
  currentUser: any;

  constructor(
    private fitnessClassesService: FitnessClassesService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.currentUser = this.userService.getCurrentUserValue();
    this.allClasses$ = this.fitnessClassesService.items$;
    
    this.upcomingClasses$ = this.allClasses$.pipe(
      map(classes => classes.filter(cls => new Date(cls.StartTime) > new Date()))
    );
    
    this.pastClasses$ = this.allClasses$.pipe(
      map(classes => classes.filter(cls => new Date(cls.StartTime) <= new Date()))
    );
  }

  ngOnInit(): void {
    this.fitnessClassesService.getClasses().subscribe();
  }

  bookClass(fitnessClass: FitnessClass): void {
    if (!this.currentUser) {
      this.snackBar.open('Musisz być zalogowany, aby zapisać się na zajęcia', 'Zamknij', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (fitnessClass.isFull) {
      this.snackBar.open('Brak wolnych miejsc na te zajęcia', 'Zamknij', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.fitnessClassesService.bookClass(fitnessClass.ClassID, this.currentUser.UserID).subscribe({
      next: (response) => {
        this.snackBar.open('Pomyślnie zapisano na zajęcia!', 'Zamknij', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error booking class:', error);
        const errorMessage = error.error?.message || 'Wystąpił błąd podczas zapisywania na zajęcia';
        this.snackBar.open(errorMessage, 'Zamknij', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  addClass(): void {
    const dialogRef = this.dialog.open(AddEditClassDialogComponent, {
      width: '600px',
      data: { class: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fitnessClassesService.getClasses().subscribe();
      }
    });
  }

  editClass(fitnessClass: FitnessClass): void {
    const dialogRef = this.dialog.open(AddEditClassDialogComponent, {
      width: '600px',
      data: { class: fitnessClass }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fitnessClassesService.getClasses().subscribe();
      }
    });
  }

  deleteClass(fitnessClass: FitnessClass): void {
    if (confirm(`Czy na pewno chcesz usunąć zajęcia "${fitnessClass.Title}"?`)) {
      this.fitnessClassesService.deleteClass(fitnessClass.ClassID).subscribe({
        next: () => {
          this.snackBar.open('Zajęcia zostały usunięte pomyślnie!', 'Zamknij', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Error deleting class:', error);
          const errorMessage = error.error?.message || 'Wystąpił błąd podczas usuwania zajęć';
          this.snackBar.open(errorMessage, 'Zamknij', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'primary';
      case 'cancelled': return 'warn';
      case 'completed': return 'accent';
      default: return 'primary';
    }
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'Aktywne';
      case 'cancelled': return 'Anulowane';
      case 'completed': return 'Zakończone';
      default: return status;
    }
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
}