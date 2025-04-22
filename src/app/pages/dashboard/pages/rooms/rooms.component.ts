import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Observable, of } from 'rxjs';
import { AddEditUserDialogComponent } from '../users/components/add-edit-user-dialog/add-edit-user-dialog.component';

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
export class RoomsComponent {
  rooms$: Observable<any[]> = of([
    {
      "RoomID": 1,
      "RoomName": "Salka 1",
      "Capacity": 20,
      "Location": "Berlin"
  },
  {
      "RoomID": 2,
      "RoomName": "Sala 2",
      "Capacity": 30,
      "Location": "Bremen"
  }
  ]);
  displayedColumns: string[] = ['id', 'RoomName', 'Capacity', 'Lokalizacja', 'actions'];
  //


  add(): void {
      // const dialogRef = this.dialog.open(AddEditUserDialogComponent);
  
      // dialogRef.afterClosed().subscribe(result => {
      //   console.log('The dialog was closed');
      //   if (result !== undefined) {
      //     this.animal.set(result);
      //   }
      // });
    }

  delete(userId: number): void {
      // const dialogRef = this.dialog.open(ConfirmDialogComponent);
      // dialogRef.afterClosed().subscribe((value)=>{
      //   if (value == true) {
      //     this.usersService.deleteUser(userId).subscribe();
      //   }
      // })
    }
  
  edit(user: any): void {
    // const dialogRef = this.dialog.open(AddEditUserDialogComponent, {
    //   data: {
    //     user: user,
    //     isEdit: true
    //   }
    // })
  }
    



}
