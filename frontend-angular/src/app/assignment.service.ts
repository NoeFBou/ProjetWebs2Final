import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

export interface Assignment {
  id?: number;
  stock_industry: string;
  date: Date;
  nombre: number;
  department: string;
  termine: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class AssignmentService {

  private apiUrl = 'http://localhost:5000/api/assignments';

  constructor(private http: HttpClient) { }

  getAssignments(page: number = 1, limit: number = 25): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  addAssignment(assignment: Assignment): Observable<Assignment> {
    return this.http.post<Assignment>(this.apiUrl, assignment);
  }

  deleteAssignment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateAssignment(id: number | undefined, assignment: Assignment): Observable<Assignment> {
    return this.http.put<Assignment>(`${this.apiUrl}/${id}`, assignment);
  }

}


