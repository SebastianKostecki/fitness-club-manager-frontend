import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomEquipmentsComponent } from './room-equipments.component';

describe('RoomEquipmentsComponent', () => {
  let component: RoomEquipmentsComponent;
  let fixture: ComponentFixture<RoomEquipmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomEquipmentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoomEquipmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
