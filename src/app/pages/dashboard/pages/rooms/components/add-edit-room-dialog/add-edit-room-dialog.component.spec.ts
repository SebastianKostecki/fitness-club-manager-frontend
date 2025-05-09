import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditRoomDialogComponent } from './add-edit-room-dialog.component';

describe('AddEditRoomDialogComponent', () => {
  let component: AddEditRoomDialogComponent;
  let fixture: ComponentFixture<AddEditRoomDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditRoomDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddEditRoomDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
