import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


import { RoomsService } from '../../rooms/services/rooms.service';
import { EquipmentsService } from '../../equipments/services/equipments.service';
import { RoomEquipmentsService } from '../services/room-equipments.service';


@Component({
  selector: 'app-add-edit-room-equipments-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
  templateUrl: './add-edit-room-equipments-dialog.component.html',
  styleUrl: './add-edit-room-equipments-dialog.component.scss'
})
export class AddEditRoomEquipmentsDialogComponent implements OnInit {
  formGroup!: FormGroup;

  rooms: any[] = [];
  equipments: any[] = [];

  addLoading$ = this.roomEquipmentsService.addLoading$;
  editLoading$ = this.roomEquipmentsService.editLoading$;

  constructor(
    private fb: FormBuilder,
    private roomEquipmentsService: RoomEquipmentsService,
    private equipmentsService: EquipmentsService,
    private roomsService: RoomsService,
    private dialogRef: MatDialogRef<AddEditRoomEquipmentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      RoomID: ['', Validators.required],
      EquipmentID: ['', Validators.required],
      Quantity: ['', [Validators.required, Validators.min(1)]]
    });

    if (this.data?.isEdit) {
      this.formGroup.patchValue(this.data.roomEquipment);
    }

    this.roomEquipmentsService.addSuccess.subscribe(success => {
      if (success) {
        this.dialogRef.close();
        this.roomEquipmentsService.addSuccess.next(false);
      }
    });

    this.roomEquipmentsService.editSuccess.subscribe(success => {
      if (success) {
        this.dialogRef.close();
        this.roomEquipmentsService.editSuccess.next(false);
      }
    });

    this.loadDropdowns();
  }

  loadDropdowns(): void {
    this.roomsService.getRooms().subscribe(res => this.rooms = res);
    this.equipmentsService.getEquipments().subscribe(res => this.equipments = res);
  }

  onSubmit(): void {
    const formValue = this.formGroup.value;

    if (this.data?.isEdit) {
      const { RoomID, EquipmentID } = this.data.roomEquipment;
      this.roomEquipmentsService.editRoomEquipment(RoomID, EquipmentID, formValue).subscribe();
    } else {
      this.roomEquipmentsService.addRoomEquipment(formValue).subscribe();
    }
  }
}
