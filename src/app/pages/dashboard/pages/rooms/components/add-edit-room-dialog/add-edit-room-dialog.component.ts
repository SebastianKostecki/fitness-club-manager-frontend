import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { RoomsService } from '../../services/rooms.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-add-edit-room-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-edit-room-dialog.component.html',
  styleUrl: './add-edit-room-dialog.component.scss'
})
export class AddEditRoomDialogComponent implements OnInit {
  formGroup!: FormGroup;
  addLoading$ = this.roomsService.addLoading$;

  constructor(
    private fb:FormBuilder,
    private roomsService: RoomsService,
    private dialogRef: MatDialogRef<AddEditRoomDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){}
  
  ngOnInit(){
    console.log(this.data)
    this.formGroup = this.fb.group({
      RoomName: ["", [Validators.required]],
      Capacity: ["", [Validators.required]],
      Location: ["", [Validators.required]]
    })

    this.roomsService.addSuccess$.subscribe((addSuccess)=>{
      if (addSuccess == true){
        this.dialogRef.close();
        this.roomsService.addSuccess.next(false);
      }
    })
  }

  onSubmit(){
    const formValue=this.formGroup.value;
    console.log(formValue);
    if (this.data?.isEdit){
      const roomID = this.data?.room?.RoomID;
      // this.roomsService.ed 
    }
    else {
      this.roomsService.addRoom(formValue).subscribe();
    }
  }


}
