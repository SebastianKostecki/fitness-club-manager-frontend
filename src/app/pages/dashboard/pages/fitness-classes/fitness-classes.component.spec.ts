import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FitnessClassesComponent } from './fitness-classes.component';

describe('FitnessClassesComponent', () => {
  let component: FitnessClassesComponent;
  let fixture: ComponentFixture<FitnessClassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FitnessClassesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FitnessClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
