import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { EquipmentsService } from './services/equipments.service';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AddEditEquipmentsDialogComponent } from './components/add-edit-equipments-dialog/add-edit-equipments-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-equipments',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    AddEditEquipmentsDialogComponent
  ],
  templateUrl: './equipments.component.html',
  styleUrl: './equipments.component.scss'
})
export class EquipmentsComponent implements OnInit {
  equipments$: Observable<any[]> = this.equipmentsService.items$;
  loading$: Observable<boolean> = this.equipmentsService.loading$;
  error$: Observable<HttpErrorResponse | null> = this.equipmentsService.error$;
  displayedColumns: string[] = ['id', 'EquipmentName', 'Description', 'actions'];

  constructor(private equipmentsService: EquipmentsService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.equipmentsService.getEquipments().subscribe();
  }

  add(): void {
    this.dialog.open(AddEditEquipmentsDialogComponent);
  }

  edit(equipment: any): void {
    this.dialog.open(AddEditEquipmentsDialogComponent, {
      data: {
        equipment,
        isEdit: true
      }
    });
  }

  delete(equipmentId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.equipmentsService.deleteEquipment(equipmentId).subscribe();
      }
    });
  }
}
