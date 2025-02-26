import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

export interface Assignment {
  id: number;
  stock_industry: string;
  stock_sector: string;
  stock_market_cap: string;
  department: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})

export class AssignmentService {

  private apiUrl = 'http://localhost:5000/api/assignments';

  constructor(private http: HttpClient) { }

  getAssignments(page: number = 1, limit: number = 10): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  addAssignment(assignment: Assignment): Observable<Assignment> {
    return this.http.post<Assignment>(this.apiUrl, assignment);
  }

  deleteAssignment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}


