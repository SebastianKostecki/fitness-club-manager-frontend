import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RoomsService } from './services/rooms.service';
import { Observable, of } from 'rxjs';
import { AddEditUserDialogComponent } from '../users/components/add-edit-user-dialog/add-edit-user-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { AddEditRoomDialogComponent } from './components/add-edit-room-dialog/add-edit-room-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    AddEditUserDialogComponent,
    MatIconModule
  ],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit{
  // rooms$: Observable<any[]> = of([
  //   {
  //     "RoomID": 1,
  //     "RoomName": "Salka 1",
  //     "Capacity": 20,
  //     "Location": "Berlin"
  // },
  // {
  //     "RoomID": 2,
  //     "RoomName": "Sala 2",
  //     "Capacity": 30,
  //     "Location": "Bremen"
  // }
  // ]);
  rooms$: Observable<any[]> = this.roomsService.items$;
  loading$: Observable<boolean> = this.roomsService.loading$;
  error$: Observable<HttpErrorResponse|null> = this.roomsService.error$;
  displayedColumns: string[] = ['id', 'RoomName', 'Capacity', 'Lokalizacja', 'actions'];
  constructor(private roomsService: RoomsService, private dialog: MatDialog) {};
  
  ngOnInit(): void {
    this.roomsService.getRooms().subscribe((rooms)=>{
      console.log(rooms)
    })
  }


  add(): void {
      const dialogRef = this.dialog.open(AddEditRoomDialogComponent);
  
      // dialogRef.afterClosed().subscribe(result => {
      //   console.log('The dialog was closed');
      //   if (result !== undefined) {
      //     this.animal.set(result);
      //   }
      // });
    }

  delete(roomId: number): void {
      const dialogRef = this.dialog.open(ConfirmDialogComponent);
      dialogRef.afterClosed().subscribe((value)=>{
        if (value == true) {
          this.roomsService.deleteRoom(roomId).subscribe();
        }
      })
    }
  
  edit(room: any): void {
    const dialogRef = this.dialog.open(AddEditRoomDialogComponent, {
      data: {
        room: room,
        isEdit: true
      }
    })
  }
    



}
