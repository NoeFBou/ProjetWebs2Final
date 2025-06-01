import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {forkJoin, Observable} from "rxjs";
import {environment} from "../environments/environment";
import { FilterCriteria } from './filter/filter.component';

export interface ProfesseurInfo {
  idProf: string;
  nomProf: string;
  profilePicture?: string;
}

export interface EleveInfo {
  idEleve: string;
  nomEleve: string;
  profilePicture?: string;
}
export interface PaginatedAssignments {
  assignments: Assignment[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export interface Assignment {
  _id?: string;
  nom: string;
  matiere: string;
  exercice?: string;
  note?: number;
  tags?: string[];
  statut: 'en cours' | 'terminé' | 'en attente';
  dateDeRendu: Date;
  visible?: boolean;
  locked?: boolean;
  professeur: ProfesseurInfo;
  eleve: EleveInfo;
}

@Injectable({
  providedIn: 'root'
})

export class AssignmentService {

  private baseApiUrl = environment.apiUrl + '/assignments';

  constructor(private http: HttpClient) { }

  //old
  getAssignments(page: number = 1, limit: number = 10): Observable<PaginatedAssignments> {
    return this.http.get<PaginatedAssignments>(`${this.baseApiUrl}?page=${page}&limit=${limit}`);
  }

  getDistinctTags(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseApiUrl}/distinct/tags`);
  }

  getDistinctMatieres(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseApiUrl}/distinct/matieres`);
  }

  getAssignmentsfiltre(
    page: number = 1,
    limit: number = 10,
    filters?: FilterCriteria,
    sortField?: string,
    sortOrder?: number
  ): Observable<PaginatedAssignments> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (sortField && sortOrder !== undefined) {
      params = params.set('sortField', sortField);
      params = params.set('sortOrder', sortOrder.toString());
    }

    if (filters) {
      if (filters.nom) params = params.set('nom', filters.nom);

      if (filters.dateDeRenduRange && filters.dateDeRenduRange.length === 2) {
        if (filters.dateDeRenduRange[0]) {
          params = params.set('dateDeRenduStart', new Date(filters.dateDeRenduRange[0]).toISOString());
        }
        if (filters.dateDeRenduRange[1]) {
          params = params.set('dateDeRenduEnd', new Date(filters.dateDeRenduRange[1]).toISOString());
        }
      }
      if (filters.selectedTags && filters.selectedTags.length > 0) {
        params = params.set('selectedTags', filters.selectedTags.join(','));
      }
      if (filters.noteRange) {
        params = params.set('minNote', filters.noteRange[0].toString());
        params = params.set('maxNote', filters.noteRange[1].toString());
      }
      if (filters.locked !== null && filters.locked !== undefined) {
        params = params.set('locked', String(filters.locked));
      }
      if (filters.selectedMatieres && filters.selectedMatieres.length > 0) {
        params = params.set('selectedMatieres', filters.selectedMatieres.join(','));
      }
      if (filters.selectedProfesseurIds && filters.selectedProfesseurIds.length > 0) {
        params = params.set('selectedProfesseurIds', filters.selectedProfesseurIds.join(','));
      }
      if (filters.selectedEleveIds && filters.selectedEleveIds.length > 0) {
        params = params.set('selectedEleveIds', filters.selectedEleveIds.join(','));
      }
      if (filters.selectedStatuts && filters.selectedStatuts.length > 0) {
        params = params.set('selectedStatuts', filters.selectedStatuts.join(','));
      }
      if (filters.exerciceKeywords && filters.exerciceKeywords.length > 0) {
        params = params.set('exerciceKeywords', filters.exerciceKeywords.join(','));
      }
    }

    return this.http.get<PaginatedAssignments>(this.baseApiUrl, { params });
  }

  addAssignment(assignment: Assignment): Observable<Assignment> {
    const assignmentToSend = {
      ...assignment,
      dateDeRendu: new Date(assignment.dateDeRendu).toISOString()
    };
    return this.http.post<Assignment>(this.baseApiUrl, assignmentToSend);
  }

  deleteAssignment(id: string): Observable<any> {
    return this.http.delete(`${this.baseApiUrl}/${id}`);
  }

  updateAssignment(id: string | undefined, assignment: Assignment): Observable<Assignment> {
    if (!id) {
      throw new Error("ID is required for updating assignment");
    }
    const assignmentToSend = {
      ...assignment,
      dateDeRendu: new Date(assignment.dateDeRendu).toISOString()
    };
    return this.http.put<Assignment>(`${this.baseApiUrl}/${id}`, assignmentToSend);
  }


 // old
  peuplerBD(bdInitialAssignments : any): Observable<readonly unknown[]> {
    let appel: Observable<Assignment>[] = [];

    bdInitialAssignments.forEach((a: { name: any; date: string | number | Date; nombre: any; department: any; termine: any; }) => {
      let nouvelAssignment: Assignment = {
        nom: a.name,
        matiere: a.department,
        exercice: a.name,
        note: a.nombre,
        tags: [],
        statut: a.termine ? 'terminé' : 'en cours',
        dateDeRendu: new Date(a.date),
        visible: true,
        locked: false,
        professeur: {
          idProf: "prof123",
          nomProf: "Professeur Exemple"
        },
        eleve: {
          idEleve: "eleve123",
          nomEleve: "Élève Exemple"
        }
      }

      appel.push(this.addAssignment(nouvelAssignment))
    });

    return forkJoin(appel);
  }


  getMyAssignments(
    page: number = 1,
    limit: number = 10,
    sortField?: string,
    sortOrder?: number
  ): Observable<PaginatedAssignments> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (sortField && sortOrder !== undefined) {
      params = params.set('sortField', sortField);
      params = params.set('sortOrder', sortOrder.toString());
    }
    return this.http.get<PaginatedAssignments>(`${this.baseApiUrl}/my-assignments`, { params });
  }

}


