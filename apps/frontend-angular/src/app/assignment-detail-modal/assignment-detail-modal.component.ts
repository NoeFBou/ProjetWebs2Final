import {Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import { CommonModule, DatePipe,DecimalPipe } from '@angular/common'; // Import DatePipe
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Assignment } from '../assignment.service'; // Votre interface Assignment
import { environment } from '../../environments/environment';

// PrimeNG Modules for display
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

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
  selector: 'app-assignment-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    AvatarModule,
    TagModule,
    ButtonModule,
    TooltipModule,
    DatePipe,
    DecimalPipe,
    SafeHtmlPipe
  ],
  templateUrl: './assignment-detail-modal.component.html',
  styleUrls: ['./assignment-detail-modal.component.scss']
})

export class AssignmentDetailModalComponent implements OnInit {
  assignment: Assignment | null = null;
  serverBaseUrl = environment.serverBaseUrl || '';

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    if (this.config.data && this.config.data.assignment) {
      this.assignment = this.config.data.assignment;
    } else {
      // Gérer le cas où l'assignment n'est pas passé, peut-être fermer le modal
      console.error("Aucun assignment fourni au modal de détails.");
      this.ref.close();
    }
  }

  getAvatarLabelForUser(name: string | undefined): string {
    if (name) {
      const parts = name.split(' ');
      const prenomInitial = parts[0] ? parts[0][0].toUpperCase() : '';
      const nomInitial = parts.length > 1 && parts[parts.length -1] ? parts[parts.length -1][0].toUpperCase() : '';
      return prenomInitial + nomInitial || 'U';
    }
    return '??';
  }



  closeDialog(): void {
    this.ref.close();
  }

  getStatutSeverity(statut: "en cours" | "terminé" | "en attente") {
    switch (statut) {
      case 'terminé': return 'success';
      case 'en cours': return 'info';
      case 'en attente': return 'warning';
      default: return 'secondary';
    }  }

  getProfilePictureFullUrl(profilePicture: string | undefined) {
    if (profilePicture) {
      return `${this.serverBaseUrl}/uploads/profile-pictures/${profilePicture}`;
    }
    return undefined;
  }
}
