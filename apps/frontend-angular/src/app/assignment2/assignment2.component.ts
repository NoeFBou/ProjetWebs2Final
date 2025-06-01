import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {CommonModule, DatePipe, DecimalPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import { Subscription } from 'rxjs';

import { Assignment, AssignmentService } from '../assignment.service';
import { AuthServiceService, DecodedToken } from '../auth-service.service';
import { EditAssignmentModalComponent } from '../edit-assignment-modal/edit-assignment-modal.component';
import { UserProfileViewModalComponent } from '../user-profile-view-modal/user-profile-view-modal.component';
import { DropdownModule } from 'primeng/dropdown';
import {ButtonDirective} from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';
import { environment } from '../../environments/environment';
import { DataViewModule } from 'primeng/dataview';
import {TableModule} from "primeng/table";
import {AssignmentDetailModalComponent} from "../assignment-detail-modal/assignment-detail-modal.component";

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
  rows: number = 10;
  first: number = 0;
  sortField: string = 'dateDeRendu';
  sortOrder: number = -1;

  isLoading: boolean = true;
  private subscriptions = new Subscription();
  private currentUser: DecodedToken | null;
  private dialogRef: DynamicDialogRef | undefined;
  serverBaseUrl = environment.serverBaseUrl || '';
  detailDialogRef: DynamicDialogRef | undefined;

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
    //this.loadAssignments({ first: this.first, rows: this.rows, sortField: this.sortField, sortOrder: this.sortOrder });
  }

  loadAssignments(event: any): void {
    this.isLoading = true;
    this.first = event.first || 0;
    this.rows = event.rows || 10;

    const page = Math.floor(this.first / this.rows) + 1;

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

  getAvatarLabelForUser(name: string | undefined): string {
    if (name) {
      const parts = name.split(' ');
      const prenomInitial = parts[0] ? parts[0][0].toUpperCase() : '';
      const nomInitial = parts.length > 1 && parts[parts.length -1] ? parts[parts.length -1][0].toUpperCase() : '';
      return prenomInitial + nomInitial;
    }
    return '??';
  }





  isEditDisabled(assignment: Assignment): boolean {
    if (!assignment.locked) return false;
    if (this.currentUser && this.currentUser.isAdmin) {
      return this.currentUser.id !== assignment.professeur?.idProf;
    }
    return true;
  }

  openEditModal(assignment: Assignment): void {
    if (this.editModal) {
      this.editModal.assignment = assignment;
      this.editModal.show();
    } else {
      console.error("EditModal is not available");
    }
  }

  onAssignmentUpdated(updatedAssignment: Assignment): void {
    const index = this.assignments.findIndex(a => a._id === updatedAssignment._id);
    if (index !== -1) {
      this.assignments[index] = updatedAssignment;
      this.assignments = [...this.assignments];
      this.messageService.add({severity: 'success', summary: 'Succès', detail: 'Assignment mis à jour.'});
      // this.loadAssignments({ first: this.first, rows: this.rows, sortField: this.sortField, sortOrder: this.sortOrder });
    }
  }

  confirmDelete(event: Event, assignmentId: string | undefined): void {
    if (!assignmentId) return;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Voulez-vous vraiment supprimer cet assignment ?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui', rejectLabel: 'Non',
      accept: () => this.deleteAssignmentInternal(assignmentId),
      reject: () => this.messageService.add({severity:'info', summary:'Annulé', detail:'Suppression annulée.'})
    });
  }

  private deleteAssignmentInternal(id: string): void {
    this.subscriptions.add(
      this.assignmentService.deleteAssignment(id).subscribe({
        next: () => {
          this.messageService.add({severity:'success', summary:'Succès', detail:'Assignment supprimé.'});
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

  openUserProfileModal(userId: string | undefined): void {
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

  openAssignmentDetailModal(assignment: Assignment): void {
    this.detailDialogRef = this.dialogService.open(AssignmentDetailModalComponent, {
      header: `Détails: ${assignment.nom}`,
      width: '70%',
      contentStyle: {"max-height": "85vh", "overflow": "auto"},
      baseZIndex: 10000,
      maximizable: true,
      data: {
        assignment: assignment
      }
    });
  }
}
