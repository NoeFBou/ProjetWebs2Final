import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AssignmentService} from "../assignment.service";
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
  nom?: string;
  dateDeRenduRange?: Date[];
  selectedTags?: string[];
  noteRange?: number[];
  locked?: boolean | null;
  selectedMatieres?: string[];
  selectedProfesseurIds?: string[];
  selectedEleveIds?: string[];
  selectedStatuts?: string[];
  exerciceKeywords?: string[];
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
    noteRange: [0, 20],
    locked: null
  };

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
    { label: 'Tous', value: null },
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
      }
    });
  }

  onFilterChange(): void {
    const criteriaToEmit = JSON.parse(JSON.stringify(this.criteria));
    this.filterChange.emit(criteriaToEmit);
  }

  resetFilters(): void {
    this.criteria = {
      noteRange: [0, 20],
      locked: null
    };
    this.criteria.dateDeRenduRange = undefined;
    this.onFilterChange();
  }
}
