import { Injectable } from '@angular/core';
import {environment} from "../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

export interface AssignmentStatusCounts {
  [status: string]: number; // e.g., { "en cours": 10, "terminé": 25 }
}

export interface AverageNotePerStudent {
  studentId: string;
  studentNom: string;
  studentPrenom: string;
  averageNote: number;
}

export interface AssignmentsPerProfessor {
  professorId: string;
  professorNom: string;
  professorPrenom: string;
  assignmentCount: number;
}

export interface AssignmentDatePoint { // For scatter plot of individual assignments
  dateDeRendu: string; // Or Date
  note: number;
  nom: string;
}

export interface CountPerMatiere {
  matiere: string;
  count: number;
}

export interface AssignmentTrendPoint {
  date: string; // "YYYY-MM"
  count: number;
}

export interface NoteDistributionPoint {
  range: string; // "0-5", "5-10", etc.
  count: number;
}

export interface ProfessorStatusBreakdown {
  professorId: string;
  professorNom: string;
  professorPrenom: string;
  statuses: { // dynamically keyed object
    "en cours"?: number;
    "terminé"?: number;
    "en attente"?: number;
  };
}
@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private baseUrl = environment.apiUrl + '/stats'; // Base URL for stats endpoints

  constructor(private http: HttpClient) { }

  getAssignmentStatusCounts(): Observable<AssignmentStatusCounts> {
    return this.http.get<AssignmentStatusCounts>(`${this.baseUrl}/assignments/status-counts`);
  }

  getAverageNotePerStudent(): Observable<AverageNotePerStudent[]> {
    return this.http.get<AverageNotePerStudent[]>(`${this.baseUrl}/assignments/average-note-per-student`);
  }

  getAssignmentsPerProfessor(): Observable<AssignmentsPerProfessor[]> {
    return this.http.get<AssignmentsPerProfessor[]>(`${this.baseUrl}/assignments/count-per-professor`);
  }

  getAssignmentsByDate(): Observable<AssignmentDatePoint[]> { // For scatter
    return this.http.get<AssignmentDatePoint[]>(`${this.baseUrl}/assignments/by-date`);
  }

  getAssignmentsCountPerMatiere(): Observable<CountPerMatiere[]> {
    return this.http.get<CountPerMatiere[]>(`${this.baseUrl}/assignments/count-per-matiere`);
  }

  getAssignmentTrendByDueDate(): Observable<AssignmentTrendPoint[]> {
    return this.http.get<AssignmentTrendPoint[]>(`${this.baseUrl}/assignments/trend-by-due-date`);
  }

  getNotesDistribution(): Observable<NoteDistributionPoint[]> {
    return this.http.get<NoteDistributionPoint[]>(`${this.baseUrl}/assignments/notes-distribution`);
  }

  getProfessorAssignmentStatusBreakdown(): Observable<ProfessorStatusBreakdown[]> {
    return this.http.get<ProfessorStatusBreakdown[]>(`${this.baseUrl}/professors/assignment-status-breakdown`);
  }
}
