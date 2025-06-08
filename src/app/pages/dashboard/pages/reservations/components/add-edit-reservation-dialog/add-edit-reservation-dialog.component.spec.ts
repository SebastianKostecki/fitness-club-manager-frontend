import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditReservationDialogComponent } from './add-edit-reservation-dialog.component';

describe('AddEditReservationDialogComponent', () => {
  let component: AddEditReservationDialogComponent;
  let fixture: ComponentFixture<AddEditReservationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditReservationDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddEditReservationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
