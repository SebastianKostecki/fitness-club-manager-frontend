import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { UsersService } from '../../services/users.service';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-edit-user-dialog.component.html',
  styleUrl: './add-edit-user-dialog.component.scss'
})
export class AddEditUserDialogComponent {
  formGroup!:FormGroup;
  addLoading$ = this.usersService.addLoading$;
  
   constructor(
    private fb:FormBuilder, 
    private usersService: UsersService, 
    private dialogRef: MatDialogRef<AddEditUserDialogComponent>
  ){}
  
   ngOnInit(){
    this.formGroup=this.fb.group({
      Email: ["", [Validators.required, Validators.email]],
      Password: ["", [Validators.required]],
      Role: ["", [Validators.required]],
      Username: ["", [Validators.required]]

    })
    this.usersService.addSuccess$.subscribe((addSuccess)=>{
      if (addSuccess == true){
        this.dialogRef.close();
        this.usersService.addSuccess.next(false);
      }
    })
   }
  
   onSubmit(){
    const formValue=this.formGroup.value;
    console.log(formValue);
    this.usersService.addUser(formValue).subscribe();
   }
  
  }


