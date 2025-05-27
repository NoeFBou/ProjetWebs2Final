//assignment.service.ts
import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {forkJoin, Observable, Subscription} from "rxjs";
import {environment} from "../environments/environment";

export interface ProfesseurInfo {
  idProf: string; // Corresponds to User._id
  nomProf: string;
}

export interface EleveInfo {
  idEleve: string; // Corresponds to User._id
  nomEleve: string;
}

export interface Assignment {
  _id?: string; // MongoDB's ID, optional for new assignments before saving
  nom: string;
  matiere: string;
  exercice?: string;
  note?: number; // float between 0 and 20
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

  getAssignments(page: number = 1, limit: number = 10000): Observable<Assignment[]> {




    return this.http.get<Assignment[]>(`${this.baseApiUrl}?page=${page}&limit=${limit}`);
  }

  addAssignment(assignment: Assignment): Observable<Assignment> {
    // Ensure dateDeRendu is in a format the backend expects, or convert to ISO string
    const assignmentToSend = {
      ...assignment,
      dateDeRendu: new Date(assignment.dateDeRendu).toISOString() // Or ensure it's already a Date
    };
    return this.http.post<Assignment>(this.baseApiUrl, assignmentToSend);
  }

  deleteAssignment(id: string): Observable<any> { // id is now string (_id)
    return this.http.delete(`${this.baseApiUrl}/${id}`);
  }

  updateAssignment(id: string | undefined, assignment: Assignment): Observable<Assignment> { // id is now string (_id)
    if (!id) {
      throw new Error("ID is required for updating assignment");
    }
    const assignmentToSend = {
      ...assignment,
      dateDeRendu: new Date(assignment.dateDeRendu).toISOString()
    };
    return this.http.put<Assignment>(`${this.baseApiUrl}/${id}`, assignmentToSend);
  }

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
          idProf: "prof123", // Example ID, replace with actual logic to get professor ID
          nomProf: "Professeur Exemple"
        },
        eleve: {
          idEleve: "eleve123", // Example ID, replace with actual logic to get student ID
          nomEleve: "Élève Exemple"
        }
      }

      appel.push(this.addAssignment(nouvelAssignment))
    });

    return forkJoin(appel);
  }

}


