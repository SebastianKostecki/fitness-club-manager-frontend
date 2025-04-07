import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import { UsersService } from './services/users.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { HttpErrorResponse } from '@angular/common/http';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { AddEditUserDialogComponent } from './components/add-edit-user-dialog/add-edit-user-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

export interface UsersTable{
id: number;
role: string;
name: string;
email: string;
}

const ELEMENT_DATA: UsersTable[] = [
  {id: 1, role: 'admin', name: 'Seba', email: 'seba@wp.pl'},
  {id: 2, role: 'admin', name: 'Seba1', email: 'seba1@wp.pl'},
  {id: 3, role: 'admin', name: 'Seba2', email: 'seba2@wp.pl'},
  
];

@Component({
  selector: 'app-users',
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
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit{
  users$: Observable<any[]> = this.usersService.items$;
  loading$: Observable<boolean> = this.usersService.loading$;
  error$: Observable<HttpErrorResponse|null> = this.usersService.error$;
  displayedColumns: string[] = ['id', 'role', 'name', 'email', 'actions'];
  //dataSource = ELEMENT_DATA;

  constructor(private usersService: UsersService, private dialog: MatDialog){

  }

  ngOnInit(): void {
    this.usersService.getUsers().subscribe((users)=>{

      console.log(users)
    })
  }

  add(): void {
    const dialogRef = this.dialog.open(AddEditUserDialogComponent);

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed');
    //   if (result !== undefined) {
    //     this.animal.set(result);
    //   }
    // });
  }

  onDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe((value)=>{
      console.log(value);
    })
  }

}
