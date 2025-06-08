import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { combineLatest, map, Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EquipmentsService } from '../equipments/services/equipments.service';
import { RoomsService } from '../rooms/services/rooms.service';
import { AddEditRoomEquipmentsDialogComponent } from './add-edit-room-equipments-dialog/add-edit-room-equipments-dialog.component';
import { RoomEquipmentsService } from './services/room-equipments.service';

@Component({
  selector: 'app-room-equipments',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    AddEditRoomEquipmentsDialogComponent
  ],
  templateUrl: './room-equipments.component.html',
  styleUrl: './room-equipments.component.scss'
})
export class RoomEquipmentsComponent implements OnInit {
  data$: Observable<any[]>;

  loading$ = this.roomEquipmentsService.loading$;
  error$ = this.roomEquipmentsService.error$;

  displayedColumns: string[] = ['RoomName', 'EquipmentName', 'Quantity', 'actions'];

  constructor(
    private roomEquipmentsService: RoomEquipmentsService,
    private roomsService: RoomsService,
    private equipmentsService: EquipmentsService,
    private dialog: MatDialog
  ) {
    this.data$ = combineLatest([
      this.roomEquipmentsService.items$,
      this.roomsService.items$,
      this.equipmentsService.items$
    ]).pipe(
      map(([assignments, rooms, equipment]) =>
        assignments.map(item => ({
          ...item,
          RoomName: rooms.find(r => r.RoomID === item.RoomID)?.RoomName ?? item.RoomID,
          EquipmentName: equipment.find(e => e.EquipmentID === item.EquipmentID)?.EquipmentName ?? item.EquipmentID
        }))
      )
    );
  }

  ngOnInit(): void {
    this.roomEquipmentsService.getRoomEquipments().subscribe();
    this.roomsService.getRooms().subscribe();
    this.equipmentsService.getEquipments().subscribe();
  }

  add(): void {
    this.dialog.open(AddEditRoomEquipmentsDialogComponent);
  }

  edit(item: any): void {
    this.dialog.open(AddEditRoomEquipmentsDialogComponent, {
      data: {
        roomEquipment: item,
        isEdit: true
      }
    });
  }

  delete(roomId: number, equipmentId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.roomEquipmentsService.deleteRoomEquipment(roomId, equipmentId).subscribe();
      }
    });
  }
}
