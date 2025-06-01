import {Component, OnInit, Pipe, PipeTransform, ViewChild} from '@angular/core';
import {Assignment, AssignmentService} from "../assignment.service";
import { CommonModule } from '@angular/common';
import {NgbCarouselModule} from "@ng-bootstrap/ng-bootstrap";
import { CarouselModule } from 'primeng/carousel';
import {TagModule} from "primeng/tag";
import {Button, ButtonDirective, ButtonModule} from "primeng/button";
import {FilterComponent, FilterCriteria} from "../filter/filter.component";
import {AuthServiceService, DecodedToken} from "../auth-service.service";
import {PaginatorModule} from "primeng/paginator";
import {TabViewModule} from "primeng/tabview";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {TooltipModule} from "primeng/tooltip";
import { SplitterModule } from 'primeng/splitter';
import {EditAssignmentModalComponent} from "../edit-assignment-modal/edit-assignment-modal.component";
import {ConfirmationService, MessageService} from "primeng/api";
import {ConfirmPopupModule} from "primeng/confirmpopup";
import {ToastModule} from "primeng/toast";
import {environment} from "../../environments/environment";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {UserProfileViewModalComponent} from "../user-profile-view-modal/user-profile-view-modal.component";
import {AvatarModule} from "primeng/avatar";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {
  AssignmentDetailModalComponent
} from "../assignment-detail-modal/assignment-detail-modal.component";

@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: string | null | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value || '');
  }
}
export interface PaginatedAssignments {
  assignments: Assignment[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}
@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule,
    CarouselModule,
    ButtonModule,
    TagModule,
    TabViewModule,
    TooltipModule,
    FilterComponent,
    SafeHtmlPipe,
    TooltipModule,
    SplitterModule,
    PaginatorModule, EditAssignmentModalComponent, ConfirmPopupModule, ToastModule, AvatarModule, ProgressSpinnerModule],

  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {
  assignments: Assignment[] = [];
  filteredAssignments: Assignment[] = [];
  responsiveOptions: any[] | undefined;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalAssignmentsFromServer: number = 0;
  isLoading: boolean = false;

  @ViewChild('editModal', { static: true }) editModal!: EditAssignmentModalComponent;
  protected page: number = 0; // Current page for pagination display
  private currentUser: DecodedToken | null | undefined;
  dialogRef: DynamicDialogRef | undefined;
  detailDialogRef: DynamicDialogRef | undefined;

  serverBaseUrl = environment.serverBaseUrl || '';

  constructor(
    private assignmentService: AssignmentService,
    public authService: AuthServiceService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    public dialogService: DialogService
  ) {
   // this.currentUser = this.authService.getCurrentUser();
  }
  isEditDisabled(assignment: Assignment): boolean {
    if (!assignment.locked) {
      return false;
    }
    if (this.currentUser && this.currentUser.isAdmin) {
      return this.currentUser.id !== assignment.professeur?.idProf;
    }
    return true;
  }

  ngOnInit(): void {
    this.fetchAssignments();
    this.currentUser = this.authService.getCurrentUser();

    // Responsive options for the carousel can remain the same
    this.responsiveOptions = [
      { breakpoint: '1400px', numVisible: 4, numScroll: 1 },
      { breakpoint: '1199px', numVisible: 2, numScroll: 1 },
      { breakpoint: '767px', numVisible: 1, numScroll: 1 }
    ];
  }
  fetchAssignments(): void {
    this.isLoading = true;
    this.assignmentService.getAssignmentsfiltre(
      this.currentPage,
      this.itemsPerPage,
      this.currentFilterCriteria
    ).subscribe({
      next: (data: PaginatedAssignments) => {
        console.log("Assignments data received from server:", data);
        this.assignments = data.assignments;
        this.filteredAssignments = data.assignments;
        this.totalAssignmentsFromServer = data.totalItems;
        this.page = 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des assignments', error);
        this.messageService.add({severity:'error', summary:'Erreur de chargement', detail: 'Impossible de récupérer les devoirs.'});
        this.isLoading = false;
      }
    });
  }
/*
  loadAssignments(): void {
    this.assignmentService.getAssignments(1, 10000).subscribe({ // Consider actual pagination
      next: (data: PaginatedAssignments) => {
        console.log("Assignments data received from service:", data);
        if (data && Array.isArray(data.assignments)) {
          this.assignments = data.assignments;
          this.filteredAssignments = data.assignments; // Initialize filtered list
          // Update your component's totalPages and currentPage if using them for display
          // this.totalPages = response.totalPages;
          // this.page = response.currentPage -1; // If your 'page' is 0-indexed
        } else {
          console.error("Received data is not in the expected paginated format or assignments array is missing.", data);
          this.assignments = [];
          this.filteredAssignments = [];
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des assignments', error);
      }
    });
  }*/
/*
  deleteAssignment(id: string | undefined): void { // id is now _id (string)
    if (!id) return;
    if (confirm("Voulez-vous vraiment supprimer cet assignment ?")) {
      this.assignmentService.deleteAssignment(id).subscribe({
        next: () => {
          this.assignments = this.assignments.filter(a => a._id !== id);
          // Re-apply current filter to refresh filteredAssignments
          // Assuming you have a variable to store the last applied criteria, e.g., this.currentCriteria
          // For simplicity, if not, refetch or just filter the main list:
          this.applyFilter(this.currentFilterCriteria || {}); // Assuming currentFilterCriteria exists
        },
        error: (error) => {
          console.error('Erreur lors de la suppression', error);
        }
      });
    }
  }*/

  // Store current filter criteria to re-apply after delete/update
  private currentFilterCriteria: FilterCriteria = {};

  applyFilter(criteria: FilterCriteria): void {
    this.currentFilterCriteria = criteria;
    this.currentPage = 1;
    this.fetchAssignments();
  }

  onPaginatorPageChange(event: any): void {
    this.currentPage = event.page + 1;
    this.itemsPerPage = event.rows;
    this.fetchAssignments();
  }

  /*
  applyFilter(criteria: FilterCriteria): void {
    this.filteredAssignments = this.assignments.filter(item => {
      let match = true;

      // Nom
      if (criteria.nom && item.nom && !item.nom.toLowerCase().includes(criteria.nom.toLowerCase())) {
        match = false;
      }

      // Date de Rendu Range
      if (match && criteria.dateDeRenduRange && criteria.dateDeRenduRange.length === 2) {
        const itemDate = new Date(item.dateDeRendu).getTime();
        const startDate = criteria.dateDeRenduRange[0] ? new Date(criteria.dateDeRenduRange[0]).setHours(0,0,0,0) : null;
        const endDate = criteria.dateDeRenduRange[1] ? new Date(criteria.dateDeRenduRange[1]).setHours(23,59,59,999) : null;

        if (startDate && itemDate < startDate) {
          match = false;
        }
        if (match && endDate && itemDate > endDate) {
          match = false;
        }
      }

      // Tags (item must have at least one of the selected tags)
      if (match && criteria.selectedTags && criteria.selectedTags.length > 0) {
        if (!item.tags || !criteria.selectedTags.some(tag => item.tags!.includes(tag))) {
          match = false;
        }
      }

      // Note Range
      if (match && criteria.noteRange && typeof item.note !== 'undefined') {
        if (item.note < criteria.noteRange[0] || item.note > criteria.noteRange[1]) {
          match = false;
        }
      } else if (match && criteria.noteRange && typeof item.note === 'undefined') {
        // If filtering by note, items without a note don't match unless explicitly handled
        // match = false; // Or specific logic if null notes should match e.g. 0
      }


      // Locked Status
      if (match && criteria.locked !== null && typeof criteria.locked !== 'undefined') { // Check for null explicitly for 'Any'
        if (item.locked !== criteria.locked) {
          match = false;
        }
      }

      // Matières (item's matiere must be one of the selected matieres)
      if (match && criteria.selectedMatieres && criteria.selectedMatieres.length > 0) {
        if (!item.matiere || !criteria.selectedMatieres.includes(item.matiere)) {
          match = false;
        }
      }

      // Professeurs (item's professeur ID must be one of the selected IDs)
      if (match && criteria.selectedProfesseurIds && criteria.selectedProfesseurIds.length > 0) {
        if (!item.professeur || !criteria.selectedProfesseurIds.includes(item.professeur.idProf)) {
          match = false;
        }
      }

      // Élèves (item's eleve ID must be one of the selected IDs)
      if (match && criteria.selectedEleveIds && criteria.selectedEleveIds.length > 0) {
        if (!item.eleve || !criteria.selectedEleveIds.includes(item.eleve.idEleve)) {
          match = false;
        }
      }

      // Statuts (item's statut must be one of the selected statuts)
      if (match && criteria.selectedStatuts && criteria.selectedStatuts.length > 0) {
        if (!item.statut || !criteria.selectedStatuts.includes(item.statut)) {
          match = false;
        }
      }

      // Exercice Keywords (item's exercice must contain all keywords)
      if (match && criteria.exerciceKeywords && criteria.exerciceKeywords.length > 0) {
        if (!item.exercice) {
          match = false; // No exercice to search in
        } else {
          const exerciceLower = item.exercice.toLowerCase();
          for (const keyword of criteria.exerciceKeywords) {
            if (!exerciceLower.includes(keyword.toLowerCase())) {
              match = false;
              break;
            }
          }
        }
      }

      return match;
    });
    this.page = 0; // Reset to first page of carousel after filtering
  }
*/

  openEditModal(assignment: Assignment): void {
    if (this.authService.isAdmin()) {
      this.editModal.assignment = assignment; // Pass the whole assignment object
      this.editModal.show();
    }
  }

  onAssignmentUpdated(updatedAssignment: Assignment): void {
    const index = this.assignments.findIndex(a => a._id === updatedAssignment._id);
    if (index !== -1) {
      this.assignments[index] = updatedAssignment;
      // Re-apply filter to refresh filteredAssignments
      this.applyFilter(this.currentFilterCriteria || {});
    }
  }

  // This pageChange is for the PrimeNG Carousel's (onPage) event
  pageChange(event: any) {
    // event.first = index of the first item displayed
    // event.rows = number of items per page (numVisible)
    this.page = event.page; // event.page is the current page index (0-based)
  }

  get totalPages(): number {
    if (!this.filteredAssignments || this.filteredAssignments.length === 0) return 0;
    const numVisible = this.responsiveOptions?.find(opt => window.innerWidth <= parseInt(opt.breakpoint?.replace('px',''), 10))?.numVisible || this.responsiveOptions?.[0]?.numVisible || 3; // Default to 3 or a sensible value
    return Math.ceil(this.filteredAssignments.length / numVisible);
  }

  get totalPagesForDisplay(): number {
    if (this.totalAssignmentsFromServer === 0 || this.itemsPerPage === 0) return 0;
    return Math.ceil(this.totalAssignmentsFromServer / this.itemsPerPage);
  }

  pageChangeCarousel(event: any) {
    // event.first = index du premier item affiché dans le lot actuel
    // event.rows = nombre d'items par "vue" du carrousel (numVisible)
    this.page = event.page; // event.page est l'index de la "vue" actuelle du carrousel (0-indexed)
  }

  getStatutSeverity(statut: any) {
    switch (statut) {
      case 'terminé':
        return 'success';
      case 'en cours':
        return 'info';
      case 'en attente':
        return 'warning';
      default:
        return 'secondary';
    }  }

  confirmDelete(event: Event, assignmentId: string | undefined): void {
    if (!assignmentId) return;
    this.confirmationService.confirm({
      target: event.target as EventTarget, // Anchor the popup to the button
      message: 'Voulez-vous vraiment supprimer cet assignment ?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.deleteAssignment(assignmentId);
      },
      reject: () => {
        this.messageService.add({severity:'info', summary:'Annulé', detail:'Suppression annulée.'});
      }
    });
  }

  private deleteAssignment(id: string): void {
    this.assignmentService.deleteAssignment(id).subscribe({
      next: () => {
        this.assignments = this.assignments.filter(a => a._id !== id);
        this.applyFilter(this.currentFilterCriteria || {});
        this.messageService.add({severity:'success', summary:'Succès', detail:'Assignment supprimé.'});
      },
      error: (error) => {
        console.error('Erreur lors de la suppression', error);
        this.messageService.add({severity:'error', summary:'Erreur', detail:'La suppression a échoué.'});
      }
    });
  }

  openUserProfileModal(userId: string | undefined): void {
    if (!userId) {
      console.error("User ID is undefined, cannot open profile modal.");
      return;
    }
    this.dialogRef = this.dialogService.open(UserProfileViewModalComponent, {
      header: 'Détails du Profil Utilisateur',
      width: '60%', // Or '700px', '50vw', etc.
      contentStyle: {"max-height": "80vh", "overflow": "auto"},
      baseZIndex: 10000,
      maximizable: true,
      data: { // Pass data to the modal
        userId: userId
      }
    });
  }

  getAvatarLabelForUser(name: string | undefined): string {
    if (name) {
      const parts = name.split(' ');
      const prenomInitial = parts[0] ? parts[0][0].toUpperCase() : '';
      const nomInitial = parts.length > 1 && parts[parts.length -1] ? parts[parts.length -1][0].toUpperCase() : '';
      return prenomInitial + nomInitial;
    }
    return '??';
  }

  getProfilePictureFullUrl(profilePicture: any) {
    if (profilePicture) {
      return `${this.serverBaseUrl}/uploads/profile-pictures/${profilePicture}`;
    }
    return undefined;
  }

  openAssignmentDetailModal(assignment: Assignment): void {
    this.detailDialogRef = this.dialogService.open(AssignmentDetailModalComponent, {
      header: `Détails de l'Assignment: ${assignment.nom}`,
      width: '70%', // Ou une taille fixe comme '800px'
      contentStyle: {"max-height": "85vh", "overflow": "auto"},
      baseZIndex: 10000,
      maximizable: true,
      data: { // Passer l'objet assignment complet
        assignment: assignment
      }
    });
  }

  protected readonly Math = Math;
}
