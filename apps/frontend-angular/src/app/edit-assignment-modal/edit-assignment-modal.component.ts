import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Assignment, AssignmentService} from "../assignment.service";
import {DialogModule} from "primeng/dialog";
import {FormsModule} from "@angular/forms";
import {ButtonDirective} from "primeng/button";
import { CommonModule } from '@angular/common';
import {CheckboxModule} from "primeng/checkbox";

@Component({
  selector: 'app-edit-assignment-modal',
  imports: [
    CommonModule,
    DialogModule,
    FormsModule,
    ButtonDirective,
    CheckboxModule
  ],
  templateUrl: './edit-assignment-modal.component.html',
  standalone: true,
  styleUrl: './edit-assignment-modal.component.scss'
})
export class EditAssignmentModalComponent {
  display: boolean = false;
  assignmentCopy!: Assignment;
  datetemp: string = "";

  @Input() set assignment(value: Assignment) {
    if (value) {
      this.assignmentCopy = { ...value };
    }
  }

  @Output() assignmentUpdated = new EventEmitter<Assignment>();

  constructor(private assignmentService: AssignmentService) {}

  show(): void {
    console.log("Affichage de la modale");
    this.display = true;
  }

  hide(): void {
    this.display = false;
  }

  onSubmit(): void {
    this.assignmentCopy.date = new Date(this.assignmentCopy.date);

    this.assignmentCopy.nombre = Number(this.assignmentCopy.nombre);
    this.assignmentCopy.termine = Boolean(this.assignmentCopy.termine);

    this.assignmentService.updateAssignment(this.assignmentCopy.id, this.assignmentCopy).subscribe({
      next: (updatedAssignment) => {

        this.assignmentUpdated.emit(updatedAssignment);
        this.hide();
      },
      error: (error) => {
        console.error("Erreur lors de la mise à jour", error);
      }
    });
  }

  protected readonly Date = Date;

  onDateChange($event: any) {
    this.assignmentCopy.date = new Date($event);

  }
}
