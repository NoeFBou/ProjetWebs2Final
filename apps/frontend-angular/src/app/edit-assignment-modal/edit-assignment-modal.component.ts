import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Assignment, AssignmentService} from "../assignment.service";
import {DialogModule} from "primeng/dialog";
import {FormsModule} from "@angular/forms";
import {ButtonDirective} from "primeng/button";
import { CommonModule } from '@angular/common';
import {CheckboxModule} from "primeng/checkbox";
import {forkJoin} from "rxjs";
import {UserService} from "../user.service";
import {User} from "../auth-service.service";
import {DropdownModule} from "primeng/dropdown";
import {EditorModule} from "primeng/editor";
import {CalendarModule} from "primeng/calendar";
import {ChipsModule} from "primeng/chips";
import {SliderModule} from "primeng/slider";
import {SelectButtonModule} from "primeng/selectbutton";
import {ToggleButtonModule} from "primeng/togglebutton";


interface DisplayUser extends User { // Interface for dropdown display
  fullName: string;
}
@Component({
  selector: 'app-edit-assignment-modal',
  imports: [
    CommonModule,
    DialogModule,
    FormsModule,
    ButtonDirective,
    CheckboxModule,
    DropdownModule,
    EditorModule,
    CalendarModule,
    ChipsModule,
    SliderModule,
    SelectButtonModule,
    ToggleButtonModule
  ],
  templateUrl: './edit-assignment-modal.component.html',
  standalone: true,
  styleUrl: './edit-assignment-modal.component.scss'
})
export class EditAssignmentModalComponent implements OnInit, OnChanges {
  display: boolean = false;
  assignmentCopy!: Assignment; // Will hold a copy of the assignment to edit

  // Properties for PrimeNG components
  dateDeRenduModel!: Date;
  allTeachers: DisplayUser[] = [];
  allStudents: DisplayUser[] = [];
  selectedTeacher!: DisplayUser | null;
  selectedStudent!: DisplayUser | null;

  matieresOptions: { label: string, value: string }[] = [
    { label: 'Physique', value: 'Physique' },
    { label: 'Mathématiques', value: 'Mathématiques' },
    { label: 'Chimie', value: 'Chimie' },
    { label: 'Informatique', value: 'Informatique' },
    { label: 'Français', value: 'Français' },
    { label: 'Histoire', value: 'Histoire' }
  ];

  statutOptions: { label: string, value: 'en cours' | 'terminé' | 'en attente' }[] = [
    { label: 'En Cours', value: 'en cours' },
    { label: 'Terminé', value: 'terminé' },
    { label: 'En Attente', value: 'en attente' }
  ];

  isLoadingUsers: boolean = false;
  private usersLoaded: boolean = false;

  @Input() set assignment(value: Assignment | undefined) {
    if (value) {
      // Create a deep copy to avoid modifying the original object directly
      this.assignmentCopy = JSON.parse(JSON.stringify(value));
      this.initializeFormFields();
    }
  }
  @Output() assignmentUpdated = new EventEmitter<Assignment>();

  constructor(
    private assignmentService: AssignmentService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUsersForSelection();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['assignment'] && changes['assignment'].currentValue) {
    // This logic is now handled by the setter of the @Input() assignment
    // }
  }

  initializeFormFields(): void {
    if (!this.assignmentCopy) return;

    this.dateDeRenduModel = new Date(this.assignmentCopy.dateDeRendu);
    // Ensure tags is an array
    this.assignmentCopy.tags = Array.isArray(this.assignmentCopy.tags) ? this.assignmentCopy.tags : [];

    // If users are already loaded, set selected teacher/student
    if (this.usersLoaded) {
      this.setSelectedUsers();
    }
    // If users are not loaded yet, setSelectedUsers will be called in loadUsersForSelection callback
  }

  setSelectedUsers(): void {
    if (this.assignmentCopy && this.assignmentCopy.professeur && this.allTeachers.length > 0) {
      this.selectedTeacher = this.allTeachers.find(t => t._id === this.assignmentCopy.professeur.idProf) || null;
    }
    if (this.assignmentCopy && this.assignmentCopy.eleve && this.allStudents.length > 0) {
      this.selectedStudent = this.allStudents.find(s => s._id === this.assignmentCopy.eleve.idEleve) || null;
    }
  }

  loadUsersForSelection(): void {
    this.isLoadingUsers = true;
    this.usersLoaded = false;
    forkJoin({
      teachers: this.userService.getUsers({ isAdmin: true }),
      students: this.userService.getUsers({ isAdmin: false })
    }).subscribe({
      next: (results) => {
        this.allTeachers = results.teachers.map(user => ({
          ...user,
          fullName: `${user.prenom} ${user.nom}`
        }));
        this.allStudents = results.students.map(user => ({
          ...user,
          fullName: `${user.prenom} ${user.nom}`
        }));
        this.isLoadingUsers = false;
        this.usersLoaded = true;
        // Now that users are loaded, try to set selected users again if assignmentCopy is available
        if (this.assignmentCopy) {
          this.setSelectedUsers();
        }
      },
      error: (err) => {
        console.error("Erreur lors du chargement des utilisateurs:", err);
        this.isLoadingUsers = false;
      }
    });
  }

  generateRandomNote(): void {
    if (this.assignmentCopy) {
      this.assignmentCopy.note = parseFloat((Math.random() * 20).toFixed(1));
    }
  }

  show(): void {
    this.display = true;
    // Re-initialize form fields when modal is shown, in case assignment input was set before ngOnInit or users loaded
    if (this.assignmentCopy) {
      this.initializeFormFields();
    }
  }

  hide(): void {
    this.display = false;
  }

  onSubmit(): void {
    if (!this.assignmentCopy || !this.assignmentCopy._id) {
      console.error("Aucun assignment à mettre à jour ou ID manquant.");
      return;
    }

    // Update assignmentCopy with values from PrimeNG component models
    this.assignmentCopy.dateDeRendu = this.dateDeRenduModel;

    if (this.selectedTeacher && this.selectedTeacher._id) {
      this.assignmentCopy.professeur = {
        idProf: this.selectedTeacher._id,
        nomProf: this.selectedTeacher.fullName
      };
    } else {
      alert("Veuillez sélectionner un professeur.");
      return;
    }

    if (this.selectedStudent && this.selectedStudent._id) {
      this.assignmentCopy.eleve = {
        idEleve: this.selectedStudent._id,
        nomEleve: this.selectedStudent.fullName
      };
    } else {
      alert("Veuillez sélectionner un élève.");
      return;
    }

    this.assignmentCopy.note = Number(this.assignmentCopy.note);

    // Tags, nom, matiere, exercice, statut, locked, visible are already updated via [(ngModel)]="assignmentCopy.X"

    console.log("Assignment à mettre à jour :", this.assignmentCopy);

    this.assignmentService.updateAssignment(this.assignmentCopy._id, this.assignmentCopy).subscribe({
      next: (updatedAssignment) => {
        this.assignmentUpdated.emit(updatedAssignment);
        this.hide();
      },
      error: (error) => {
        console.error("Erreur lors de la mise à jour", error);
        alert(`Erreur lors de la mise à jour: ${error.error?.error || error.message}`);
      }
    });
  }

  onDateChange($event: any) {
    this.assignmentCopy.dateDeRendu = new Date($event);

  }

  protected readonly String = String;
}
