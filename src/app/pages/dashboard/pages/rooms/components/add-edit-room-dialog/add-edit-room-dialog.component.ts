import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RoomsService } from '../../services/rooms.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-add-edit-room-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
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
    public dialogRef: MatDialogRef<AddEditRoomDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){}
  
  ngOnInit(){
    console.log(this.data)
    this.formGroup = this.fb.group({
      RoomName: ["", [Validators.required]],
      Capacity: ["", [Validators.required]],
      Location: ["", [Validators.required]]
    })

    if (this.data?.isEdit) {
      this.formGroup.patchValue(this.data.room)
    }

    this.roomsService.addSuccess$.subscribe((addSuccess)=>{
      if (addSuccess == true){
        this.dialogRef.close();
        this.roomsService.addSuccess.next(false);
      }
    })

    this.roomsService.editSuccess$.subscribe((editSuccess)=>{
      if (editSuccess == true){
        this.dialogRef.close();
        this.roomsService.editSuccess.next(false);
      }
    })
  }

  onSubmit(){
    const formValue=this.formGroup.value;
    console.log(formValue);
    if (this.data?.isEdit){
      const roomID = this.data?.room?.RoomID;
      this.roomsService.editRoom(roomID, formValue).subscribe();
    }
    else {
      this.roomsService.addRoom(formValue).subscribe();
    }
  }


}
