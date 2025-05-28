import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {CommonModule, DatePipe, DecimalPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import { Subscription } from 'rxjs';

import { Assignment, AssignmentService, PaginatedAssignments } from '../assignment.service';
import { AuthServiceService, DecodedToken } from '../auth-service.service';
import { EditAssignmentModalComponent } from '../edit-assignment-modal/edit-assignment-modal.component'; // For opening edit modal
import { UserProfileViewModalComponent } from '../user-profile-view-modal/user-profile-view-modal.component';

// PrimeNG Modules
import { DropdownModule } from 'primeng/dropdown';
import {ButtonDirective, ButtonModule} from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { PaginatorModule, PaginatorState } from 'primeng/paginator'; // For DataView paginator
import { CardModule } from 'primeng/card'; // If you want to wrap cards in p-card
import { SafeHtmlPipe } from '../carousel/carousel.component'; // Assuming SafeHtmlPipe is in carousel or shared
import { environment } from '../../environments/environment';
import { DataViewModule } from 'primeng/dataview';
import {TableModule} from "primeng/table";

@Component({
  selector: 'app-assignment2',
  imports: [
    EditAssignmentModalComponent,
    ConfirmPopupModule,
    NgIf,
    DataViewModule,
    DropdownModule,
    PaginatorModule,
    TabViewModule,
    TagModule,
    AvatarModule,
    DatePipe,
    DecimalPipe,
    ButtonDirective,
    TooltipModule,
    TableModule
  ],
  templateUrl: './assignment2.component.html',
  standalone: true,
  styleUrl: './assignment2.component.scss'
})
export class Assignment2Component implements OnInit, OnDestroy {
  @ViewChild('editModal') editModal!: EditAssignmentModalComponent;

  assignments: Assignment[] = [];
  totalRecords: number = 0;
  rows: number = 10; // Items per page for table
  first: number = 0; // First record index for paginator

  // Sorting state for server-side sorting
  sortField: string = 'dateDeRendu'; // Default sort field
  sortOrder: number = -1; // Default sort order (descending, -1 for PrimeNG)

  isLoading: boolean = true;
  private subscriptions = new Subscription();
  private currentUser: DecodedToken | null;
  private dialogRef: DynamicDialogRef | undefined;
  serverBaseUrl = environment.serverBaseUrl || '';

  constructor(
    private assignmentService: AssignmentService,
    public authService: AuthServiceService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    // Initial load driven by table's lazy load or directly if not lazy
    //this.loadAssignments({ first: this.first, rows: this.rows, sortField: this.sortField, sortOrder: this.sortOrder });
  }

  // Called by p-table's (onLazyLoad) event
  loadAssignments(event: any): void { // PrimeNG's LazyLoadEvent or custom
    this.isLoading = true;
    this.first = event.first || 0;
    this.rows = event.rows || 10;

    const page = Math.floor(this.first / this.rows) + 1;

    // Use sortField and sortOrder from the event if provided by p-table column sorting
    this.sortField = event.sortField || this.sortField;
    this.sortOrder = event.sortOrder || this.sortOrder;


    this.subscriptions.add(
      this.assignmentService.getMyAssignments(page, this.rows, this.sortField, this.sortOrder).subscribe({
        next: (response) => {
          this.assignments = response.assignments || [];
          this.totalRecords = response.assignments.length || 0;
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Erreur chargement 'mes assignments':", err);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Impossible de charger vos assignments." });
          this.isLoading = false;
        }
      })
    );
  }

  // If using global sort dropdown (user example had one, but p-table headers are more common)
  // onSortChange(event: any) { ... } // Removed for column sorting focus

  // --- Methods copied/adapted from CarouselComponent ---
  getAvatarLabelForUser(name: string | undefined): string { /* ... same as before ... */
    if (name) {
      const parts = name.split(' ');
      const prenomInitial = parts[0] ? parts[0][0].toUpperCase() : '';
      const nomInitial = parts.length > 1 && parts[parts.length -1] ? parts[parts.length -1][0].toUpperCase() : '';
      return prenomInitial + nomInitial;
    }
    return '??';
  }





  isEditDisabled(assignment: Assignment): boolean { /* ... same as before ... */
    if (!assignment.locked) return false;
    if (this.currentUser && this.currentUser.isAdmin) {
      return this.currentUser.id !== assignment.professeur?.idProf;
    }
    return true;
  }

  openEditModal(assignment: Assignment): void { /* ... same as before ... */
    if (this.editModal) {
      this.editModal.assignment = assignment;
      this.editModal.show();
    } else {
      console.error("EditModal is not available");
    }
  }

  onAssignmentUpdated(updatedAssignment: Assignment): void { /* ... same as before, but might need to reload table data for sort/page consistency ... */
    const index = this.assignments.findIndex(a => a._id === updatedAssignment._id);
    if (index !== -1) {
      this.assignments[index] = updatedAssignment;
      this.assignments = [...this.assignments]; // Trigger change detection for table
      this.messageService.add({severity: 'success', summary: 'Succès', detail: 'Assignment mis à jour.'});
      // Consider reloading current page of table to reflect potential sort order changes
      // this.loadAssignments({ first: this.first, rows: this.rows, sortField: this.sortField, sortOrder: this.sortOrder });
    }
  }

  confirmDelete(event: Event, assignmentId: string | undefined): void { /* ... same as before ... */
    if (!assignmentId) return;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Voulez-vous vraiment supprimer cet assignment ?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui', rejectLabel: 'Non',
      accept: () => this.deleteAssignmentInternal(assignmentId), // Renamed to avoid conflict if global deleteAssignment exists
      reject: () => this.messageService.add({severity:'info', summary:'Annulé', detail:'Suppression annulée.'})
    });
  }

  private deleteAssignmentInternal(id: string): void { /* ... same as before ... */
    this.subscriptions.add(
      this.assignmentService.deleteAssignment(id).subscribe({
        next: () => {
          this.messageService.add({severity:'success', summary:'Succès', detail:'Assignment supprimé.'});
          // Reload data, accounting for potential page change
          const currentFirstRecord = this.first;
          const currentPageRecordCount = this.assignments.length;
          if (currentPageRecordCount === 1 && this.first > 0) {
            this.first = this.first - this.rows;
          }
          this.loadAssignments({first: this.first, rows: this.rows, sortField: this.sortField, sortOrder: this.sortOrder });
        },
        error: (err) => {
          this.messageService.add({severity:'error', summary:'Erreur', detail:'La suppression a échoué.'});
          console.error("Delete error:", err);
        }
      })
    );
  }

  openUserProfileModal(userId: string | undefined): void { /* ... same as before ... */
    if (!userId) return;
    this.dialogRef = this.dialogService.open(UserProfileViewModalComponent, {
      header: 'Détails du Profil Utilisateur',
      width: '60%', contentStyle: {"max-height": "80vh", "overflow": "auto"},
      baseZIndex: 10000, maximizable: true, data: { userId: userId }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  getProfilePictureFullUrl(profilePicture: any) {
    if (profilePicture) {
      return `${this.serverBaseUrl}/uploads/profile-pictures/${profilePicture}`;
    }
    return undefined;
  }

  getStatutSeverity(statut: any) {
    switch (statut) {
      case 'terminé': return 'success';
      case 'en cours': return 'info';
      case 'en attente': return 'warning';
      default: return 'secondary';
    }
  }
}
