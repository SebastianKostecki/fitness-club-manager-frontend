import { TestBed } from '@angular/core/testing';

import { RoomEquipmentsService } from './room-equipments.service';

describe('RoomEquipmentsService', () => {
  let service: RoomEquipmentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomEquipmentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
