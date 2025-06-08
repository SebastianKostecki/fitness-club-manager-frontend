import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditRoomEquipmentsDialogComponent } from './add-edit-room-equipments-dialog.component';

describe('AddEditRoomEquipmentsDialogComponent', () => {
  let component: AddEditRoomEquipmentsDialogComponent;
  let fixture: ComponentFixture<AddEditRoomEquipmentsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditRoomEquipmentsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddEditRoomEquipmentsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
