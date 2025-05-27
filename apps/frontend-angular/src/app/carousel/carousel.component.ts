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
    PaginatorModule, EditAssignmentModalComponent, ConfirmPopupModule, ToastModule],

  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {
  assignments: Assignment[] = [];
  filteredAssignments: Assignment[] = [];
  responsiveOptions: any[] | undefined;

  @ViewChild('editModal', { static: true }) editModal!: EditAssignmentModalComponent;
  protected page: number = 0; // Current page for pagination display
  private currentUser: DecodedToken | null;

  constructor(
    private assignmentService: AssignmentService,
    public authService: AuthServiceService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.currentUser = this.authService.getCurrentUser();
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
    this.loadAssignments();

    // Responsive options for the carousel can remain the same
    this.responsiveOptions = [
      { breakpoint: '1400px', numVisible: 3, numScroll: 1 }, // Adjusted for potentially more content
      { breakpoint: '1199px', numVisible: 2, numScroll: 1 },
      { breakpoint: '767px', numVisible: 1, numScroll: 1 }
    ];
  }

  loadAssignments(): void {
    this.assignmentService.getAssignments(1, 10000).subscribe({ // Consider actual pagination
      next: (data: Assignment[]) => {
        console.log('Assignments loaded:', data);
        this.assignments = data;
        this.filteredAssignments = data; // Initialize filtered list
        // this.page = 0; // Already initialized
      },
      error: (error) => {
        console.error('Erreur lors du chargement des assignments', error);
      }
    });
  }
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
}
