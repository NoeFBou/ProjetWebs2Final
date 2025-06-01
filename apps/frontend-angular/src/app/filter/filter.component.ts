import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import {Assignment, AssignmentService} from "../assignment.service";
import {CalendarModule} from "primeng/calendar";
import {MultiSelectModule} from "primeng/multiselect";
import {SliderModule} from "primeng/slider";
import {SelectButtonModule} from "primeng/selectbutton";
import {ChipsModule} from "primeng/chips";
import {ButtonModule} from "primeng/button";
import {UserService} from "../user.service";
import {forkJoin, map} from "rxjs";
import {FocusTrapModule} from "primeng/focustrap";

export interface FilterCriteria {
  nom?: string; // Keep if you still want to filter by assignment name
  dateDeRenduRange?: Date[]; // For p-calendar [startDate, endDate]
  selectedTags?: string[];    // For p-multiSelect
  noteRange?: number[];       // For p-slider [minNote, maxNote]
  locked?: boolean | null;    // null for 'Any', true for 'Locked', false for 'Unlocked'
  selectedMatieres?: string[];// For p-multiSelect
  selectedProfesseurIds?: string[]; // For p-multiSelect (User IDs)
  selectedEleveIds?: string[];    // For p-multiSelect (User IDs)
  selectedStatuts?: string[]; // For p-selectButton (multiple)
  exerciceKeywords?: string[];// For p-chips
}

interface DisplayUser {
  _id: string;
  fullName: string;
}

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    MultiSelectModule,
    SliderModule,
    SelectButtonModule,
    ChipsModule,
    ButtonModule,
    FocusTrapModule
  ],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  criteria: FilterCriteria = {
    noteRange: [0, 20], // Default note range
    locked: null // Default to 'Any'
  };

  // Options for dropdowns/multiselects
  allTags: { label: string, value: string }[] = [];
  allMatieres: { label: string, value: string }[] = [];
  allProfesseurs: DisplayUser[] = [];
  allEleves: DisplayUser[] = [];

  statutOptions: { label: string, value: string }[] = [
    { label: 'En Cours', value: 'en cours' },
    { label: 'Terminé', value: 'terminé' },
    { label: 'En Attente', value: 'en attente' }
  ];

  lockedOptions: { label: string, value: boolean | null }[] = [
    { label: 'Tous', value: null }, // 'Any' state
    { label: 'Verrouillé', value: true },
    { label: 'Déverrouillé', value: false }
  ];

  isLoadingOptions: boolean = false;

  @Output() filterChange = new EventEmitter<FilterCriteria>();

  constructor(
    private assignmentService: AssignmentService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadFilterOptions();
  }

  loadFilterOptions(): void {
    this.isLoadingOptions = true;
    forkJoin({
      // Remplacer la récupération de tous les assignments pour les tags/matières
      tags: this.assignmentService.getDistinctTags(),
      matieres: this.assignmentService.getDistinctMatieres(),
      professeurs: this.userService.getUsers({ isAdmin: true }),
      eleves: this.userService.getUsers({ isAdmin: false })
    }).pipe(
      map(results => {
        return {
          tags: results.tags.map(tag => ({ label: tag, value: tag })),
          matieres: results.matieres.map(matiere => ({ label: matiere, value: matiere })),
          professeurs: results.professeurs.map(p => ({ _id: p._id, fullName: `${p.prenom} ${p.nom}` })),
          eleves: results.eleves.map(e => ({ _id: e._id, fullName: `${e.prenom} ${e.nom}` }))
        };
      })
    ).subscribe({
      next: (options) => {
        this.allTags = options.tags;
        this.allMatieres = options.matieres;
        this.allProfesseurs = options.professeurs;
        this.allEleves = options.eleves;
        this.isLoadingOptions = false;
      },
      error: (err) => {
        console.error("Erreur lors du chargement des options de filtre:", err);
        this.isLoadingOptions = false;
        // Handle error (e.g., show a message to the user)
      }
    });
  }

  onFilterChange(): void {
    // Create a deep copy to avoid issues with object references if criteria is modified elsewhere
    const criteriaToEmit = JSON.parse(JSON.stringify(this.criteria));
    this.filterChange.emit(criteriaToEmit);
  }

  resetFilters(): void {
    this.criteria = {
      noteRange: [0, 20], // Reset to default
      locked: null // Reset to default 'Any'
    };
    // To clear p-calendar range, set to an empty array or [null, null]
    this.criteria.dateDeRenduRange = undefined; // Or []
    this.onFilterChange();
  }
}
