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
import { ChangeRoleDialogComponent } from './components/change-role-dialog/change-role-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserService, User } from '../../../../shared/services/user.service';

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
    ChangeRoleDialogComponent,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit{
  users$: Observable<any[]> = this.usersService.items$;
  loading$: Observable<boolean> = this.usersService.loading$;
  error$: Observable<HttpErrorResponse|null> = this.usersService.error$;
  currentUser$: Observable<User | null>;
  displayedColumns: string[] = ['id', 'role', 'name', 'email', 'actions'];
  //dataSource = ELEMENT_DATA;

  constructor(
    private usersService: UsersService, 
    private dialog: MatDialog,
    private userService: UserService
  ){
    this.currentUser$ = this.userService.currentUser$;

  }

  ngOnInit(): void {
    // Załaduj dane o obecnym użytkowniku
    this.userService.getCurrentUser().subscribe();
    
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

  delete(userId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe((value)=>{
      if (value == true) {
        this.usersService.deleteUser(userId).subscribe();
      }
    })
  }

  edit(user: any): void {
    const dialogRef = this.dialog.open(AddEditUserDialogComponent, {
      data: {
        user: user,
        isEdit: true
      }
    })
  }

  changeRole(user: any): void {
    const dialogRef = this.dialog.open(ChangeRoleDialogComponent, {
      data: {
        user: user
      }
    });
    
    dialogRef.afterClosed().subscribe((newRole) => {
      if (newRole && newRole !== user.Role) {
        this.usersService.changeUserRole(user.UserID, newRole).subscribe();
      }
    });
  }

  canChangeRole(user: any): boolean {
    // Sprawdź czy obecny użytkownik ma uprawnienia
    const currentUser = this.userService.getCurrentUserValue();
    console.log('🔍 canChangeRole - currentUser:', currentUser, 'target user:', user);
    
    if (!currentUser) {
      console.log('❌ No current user found');
      return false;
    }
    
    // Admin może zmieniać wszystkie role
    if (currentUser.Role === 'admin') {
      console.log('✅ Admin can change all roles');
      return true;
    }
    
    // Recepcjonista może zmieniać role między regular a trener
    if (currentUser.Role === 'receptionist') {
      const canChange = user.Role === 'regular' || user.Role === 'trener';
      console.log('🔍 Receptionist can change role:', canChange, 'for user role:', user.Role);
      return canChange;
    }
    
    console.log('❌ No permissions for role:', currentUser.Role);
    return false;
  }

  canEditUser(user: any): boolean {
    // Sprawdź czy obecny użytkownik ma uprawnienia
    const currentUser = this.userService.getCurrentUserValue();
    console.log('🔍 canEditUser - currentUser:', currentUser, 'target user:', user);
    
    if (!currentUser) {
      console.log('❌ No current user found');
      return false;
    }
    
    // Admin może edytować wszystkich
    if (currentUser.Role === 'admin') {
      console.log('✅ Admin can edit all users');
      return true;
    }
    
    // Recepcjonista może edytować konta regular i trener
    if (currentUser.Role === 'receptionist') {
      const canEdit = user.Role === 'regular' || user.Role === 'trener';
      console.log('🔍 Receptionist can edit user:', canEdit, 'for user role:', user.Role);
      return canEdit;
    }
    
    console.log('❌ No permissions for role:', currentUser.Role);
    return false;
  }

  canDeleteUser(user: any): boolean {
    // Sprawdź czy obecny użytkownik ma uprawnienia
    const currentUser = this.userService.getCurrentUserValue();
    
    if (!currentUser) return false;
    
    // Admin może usuwać wszystkich oprócz siebie
    if (currentUser.Role === 'admin') {
      return user.UserID !== currentUser.UserID;
    }
    
    // Recepcjonista może usuwać konta regular i trener
    if (currentUser.Role === 'receptionist') {
      return user.Role === 'regular' || user.Role === 'trener';
    }
    
    return false;
  }

}
