import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAssignmentComponent } from './import-assignment.component';

describe('ImportAssignmentComponent', () => {
  let component: ImportAssignmentComponent;
  let fixture: ComponentFixture<ImportAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportAssignmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
