import { Injectable } from '@angular/core';
import {environment} from "../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {TreeNode} from "primeng/api";

export interface AssignmentStatusCounts {
  [status: string]: number;
}

export interface AverageNotePerStudent {
  studentId: string;
  studentNom: string;
  studentPrenom: string;
  averageNote: number;
}

export interface OrganizationChartNodeData {
  id?: string;
  name: string;
  title?: string;
  image?: string | null;
}

export interface OrganizationTreeNode extends   TreeNode {
  data?: any;
  type?: any;
  styleClass?: string;
  children?: OrganizationTreeNode[];
}

export interface AssignmentsPerProfessor {
  professorId: string;
  professorNom: string;
  professorPrenom: string;
  assignmentCount: number;
}

export interface AssignmentDatePoint {
  dateDeRendu: string;
  note: number;
  nom: string;
}

export interface CountPerMatiere {
  matiere: string;
  count: number;
}

export interface AssignmentTrendPoint {
  date: string;
  count: number;
}

export interface NoteDistributionPoint {
  range: string;
  count: number;
}

export interface ProfessorStatusBreakdown {
  professorId: string;
  professorNom: string;
  professorPrenom: string;
  statuses: {
    "en cours"?: number;
    "terminé"?: number;
    "en attente"?: number;
  };
}
export interface AverageNoteTrendPoint {
  date: string;
  averageNote: number;
  assignmentCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private baseUrl = environment.apiUrl + '/stats';

  constructor(private http: HttpClient) { }


  getMyOrganizationChartData(): Observable<OrganizationTreeNode[]> {
    return this.http.get<OrganizationTreeNode[]>(`${this.baseUrl}/my-organization-chart`);
  }

  getAverageNotesTrendByDueDate(): Observable<AverageNoteTrendPoint[]> {
    return this.http.get<AverageNoteTrendPoint[]>(`${this.baseUrl}/assignments/average-notes-trend-by-due-date`);
  }

  getAssignmentStatusCounts(): Observable<AssignmentStatusCounts> {
    return this.http.get<AssignmentStatusCounts>(`${this.baseUrl}/assignments/status-counts`);
  }

  getAverageNotePerStudent(): Observable<AverageNotePerStudent[]> {
    return this.http.get<AverageNotePerStudent[]>(`${this.baseUrl}/assignments/average-note-per-student`);
  }

  getAssignmentsPerProfessor(): Observable<AssignmentsPerProfessor[]> {
    return this.http.get<AssignmentsPerProfessor[]>(`${this.baseUrl}/assignments/count-per-professor`);
  }

  getAssignmentsByDate(): Observable<AssignmentDatePoint[]> {
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
