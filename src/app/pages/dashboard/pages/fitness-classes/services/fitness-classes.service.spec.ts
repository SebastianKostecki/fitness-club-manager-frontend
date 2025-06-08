import { TestBed } from '@angular/core/testing';

import { FitnessClassesService } from './fitness-classes.service';

describe('FitnessClassesService', () => {
  let service: FitnessClassesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FitnessClassesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
