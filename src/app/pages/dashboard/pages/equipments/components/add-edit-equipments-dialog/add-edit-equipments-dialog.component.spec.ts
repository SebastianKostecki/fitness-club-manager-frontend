import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditEquipmentsDialogComponent } from './add-edit-equipments-dialog.component';

describe('AddEditEquipmentsDialogComponent', () => {
  let component: AddEditEquipmentsDialogComponent;
  let fixture: ComponentFixture<AddEditEquipmentsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditEquipmentsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddEditEquipmentsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
