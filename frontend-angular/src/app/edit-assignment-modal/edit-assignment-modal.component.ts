import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Assignment, AssignmentService} from "../assignment.service";
import {DialogModule} from "primeng/dialog";
import {FormsModule} from "@angular/forms";
import {ButtonDirective} from "primeng/button";

@Component({
  selector: 'app-edit-assignment-modal',
  imports: [
    DialogModule,
    FormsModule,
    ButtonDirective
  ],
  templateUrl: './edit-assignment-modal.component.html',
  standalone: true,
  styleUrl: './edit-assignment-modal.component.scss'
})
export class EditAssignmentModalComponent {
  display: boolean = false;
  // Utilisation d'une copie locale pour ne pas modifier directement l'objet parent avant validation
  assignmentCopy!: Assignment;

  @Input() set assignment(value: Assignment) {
    // Clonage de l'objet pour modification
    this.assignmentCopy = { ...value };
  }
  @Output() assignmentUpdated = new EventEmitter<Assignment>();

  constructor(private assignmentService: AssignmentService) {}

  show(): void {
    this.display = true;
  }

  hide(): void {
    this.display = false;
  }

  onSubmit(): void {
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
}
