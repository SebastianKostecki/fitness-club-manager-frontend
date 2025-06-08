import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditFitnessClassDialogComponent } from './add-edit-fitness-class-dialog.component';

describe('AddEditFitnessClassDialogComponent', () => {
  let component: AddEditFitnessClassDialogComponent;
  let fixture: ComponentFixture<AddEditFitnessClassDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditFitnessClassDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddEditFitnessClassDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
