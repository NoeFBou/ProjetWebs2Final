//assignment.service.ts
import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {forkJoin, Observable, Subscription} from "rxjs";
import {environment} from "../environments/environment";

export interface Assignment {
  id?: number;
  name: string;
  date: Date;
  nombre: number;
  department: string;
  termine: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class AssignmentService {

  private baseApiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAssignments(page: number = 1, limit: number = 10000): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.baseApiUrl}?page=${page}&limit=${limit}`);
  }

  addAssignment(assignment: Assignment): Observable<Assignment> {
    return this.http.post<Assignment>(this.baseApiUrl, assignment);
  }

  deleteAssignment(id: number): Observable<any> {
    return this.http.delete(`${this.baseApiUrl}/${id}`);
  }

  updateAssignment(id: number | undefined, assignment: Assignment): Observable<Assignment> {
    return this.http.put<Assignment>(`${this.baseApiUrl}/${id}`, assignment);
  }

  peuplerBD(bdInitialAssignments : any): Observable<readonly unknown[]> {
    let appel: Observable<Assignment>[] = [];

    bdInitialAssignments.forEach((a: { name: any; date: string | number | Date; nombre: any; department: any; termine: any; }) => {
      let nouvelAssignment: Assignment = {
        name: a.name,
        date: new Date(a.date),
        nombre: a.nombre,
        department: a.department,
        termine: a.termine
      }

      appel.push(this.addAssignment(nouvelAssignment))
    });

    return forkJoin(appel);
  }

}


