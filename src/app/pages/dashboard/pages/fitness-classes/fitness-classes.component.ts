import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { FitnessClassesService } from './services/fitness-classes.service';
import { AddEditFitnessClassDialogComponent } from './components/add-edit-fitness-class-dialog/add-edit-fitness-class-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-fitness-classes',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    AddEditFitnessClassDialogComponent,
    MatIconModule
  ],
  templateUrl: './fitness-classes.component.html',
  styleUrl: './fitness-classes.component.scss'
})
export class FitnessClassesComponent implements OnInit {
  fitnessClasses$: Observable<any[]> = this.fitnessClassesService.items$;
  loading$: Observable<boolean> = this.fitnessClassesService.loading$;
  error$: Observable<HttpErrorResponse | null> = this.fitnessClassesService.error$;

  displayedColumns: string[] = ['id', 'title', 'trainer', 'room', 'start', 'end', 'capacity', 'status', 'actions'];

  constructor(
    private fitnessClassesService: FitnessClassesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fitnessClassesService.getClasses().subscribe();
  }

  add(): void {
    this.dialog.open(AddEditFitnessClassDialogComponent);
  }

  delete(classId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.fitnessClassesService.deleteClass(classId).subscribe();
      }
    });
  }

  edit(fitnessClass: any): void {
    this.dialog.open(AddEditFitnessClassDialogComponent, {
      data: {
        fitnessClass: fitnessClass,
        isEdit: true
      }
    });
  }
}
