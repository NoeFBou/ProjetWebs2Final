// add-assignment-modal.component.ts
import {Component, OnInit} from '@angular/core';
import { Assignment, AssignmentService } from "../assignment.service";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import {CheckboxModule} from "primeng/checkbox";
import {User} from "../auth-service.service";
import {ToggleButtonModule} from "primeng/togglebutton";
import {SelectButtonModule} from "primeng/selectbutton";
import {ChipsModule} from "primeng/chips";
import {SliderModule} from "primeng/slider";
import {CalendarModule} from "primeng/calendar";
import {EditorModule} from "primeng/editor";
import {DropdownModule} from "primeng/dropdown";
import {forkJoin} from "rxjs";
import {UserService} from "../user.service";
import {NgIf} from "@angular/common";

interface DisplayUser extends User { // Interface for dropdown display
  fullName: string;
}

@Component({
  selector: 'app-add-assignment-modal',
  standalone: true,
  imports: [FormsModule, CheckboxModule, ToggleButtonModule, SelectButtonModule, ChipsModule, SliderModule, CalendarModule, EditorModule, DropdownModule, NgIf],
  templateUrl: './add-assignment-modal.component.html',
  styleUrls: ['./add-assignment-modal.component.scss']
})
export class AddAssignmentModalComponent implements OnInit {
  assignment: Assignment = {
    nom: '',
    matiere: '',
    exercice: '',
    note: 0,
    tags: [],
    statut: 'en attente',
    dateDeRendu: new Date(),
    visible: true,
    locked: false,
    professeur: { idProf: '', nomProf: '' },
    eleve: { idEleve: '', nomEleve: '' }
  };

  allTeachers: DisplayUser[] = [];
  allStudents: DisplayUser[] = [];
  selectedTeacher!: DisplayUser | null; // Allow null for clearing
  selectedStudent!: DisplayUser | null; // Allow null for clearing

  matieresOptions: { label: string, value: string }[] = [
    { label: 'Physique', value: 'Physique' },
    { label: 'Mathématiques', value: 'Mathématiques' },
    // ... other matieres
  ];

  statutOptions: { label: string, value: 'en cours' | 'terminé' | 'en attente' }[] = [
    { label: 'En Cours', value: 'en cours' },
    { label: 'Terminé', value: 'terminé' },
    { label: 'En Attente', value: 'en attente' }
  ];

  dateDeRenduModel: Date = new Date();
  isLoadingUsers: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private assignmentService: AssignmentService,
    private userService: UserService // Inject UserService
  ) {}

  ngOnInit(): void {
    this.dateDeRenduModel = this.assignment.dateDeRendu ? new Date(this.assignment.dateDeRendu) : new Date();
    this.loadUsersForSelection();
  }

  loadUsersForSelection(): void {
    this.isLoadingUsers = true;
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
      },
      error: (err) => {
        console.error("Erreur lors du chargement des utilisateurs:", err);
        // Handle error display to user, e.g., using a toast message
        this.isLoadingUsers = false;
      }
    });
  }

  generateRandomNote(): void {
    this.assignment.note = parseFloat((Math.random() * 20).toFixed(1));
  }

  addAssignment() {
    this.assignment.dateDeRendu = this.dateDeRenduModel;

    if (this.selectedTeacher && this.selectedTeacher._id) {
      this.assignment.professeur = {
        idProf: this.selectedTeacher._id,
        nomProf: this.selectedTeacher.fullName
      };
    } else {
      console.error("Professeur non sélectionné");
      alert("Veuillez sélectionner un professeur."); // Basic error feedback
      return;
    }

    if (this.selectedStudent && this.selectedStudent._id) {
      this.assignment.eleve = {
        idEleve: this.selectedStudent._id,
        nomEleve: this.selectedStudent.fullName
      };
    } else {
      console.error("Élève non sélectionné");
      alert("Veuillez sélectionner un élève."); // Basic error feedback
      return;
    }

    this.assignment.note = Number(this.assignment.note);
    console.log("Assignment à envoyer :", this.assignment);

    this.assignmentService.addAssignment(this.assignment).subscribe({
      next: (data: Assignment) => {
        console.log("Assignment ajouté :", data);
        this.activeModal.close(data);
      },
      error: (error) => {
        console.error("Erreur lors de l'ajout de l'assignment", error);
        alert(`Erreur lors de l'ajout: ${error.error?.error || error.message}`);
      }
    });
  }

  protected readonly String = String;
}
