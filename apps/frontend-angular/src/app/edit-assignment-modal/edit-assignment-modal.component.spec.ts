import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAssignmentModalComponent } from './edit-assignment-modal.component';

describe('EditAssignmentModalComponent', () => {
  let component: EditAssignmentModalComponent;
  let fixture: ComponentFixture<EditAssignmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAssignmentModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAssignmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
