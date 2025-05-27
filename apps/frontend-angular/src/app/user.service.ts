import { Injectable } from '@angular/core';
import {environment} from "../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "./auth-service.service";



@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseApiUrl = environment.apiUrl + '/users';

  constructor(private http: HttpClient) { }

  getUsers(filter?: { isAdmin?: boolean }): Observable<User[]> {
    let params = new HttpParams();

    if (filter && typeof filter.isAdmin !== 'undefined') {
      params = params.set('isAdmin', filter.isAdmin.toString());
    }
    return this.http.get<User[]>(this.baseApiUrl, { params });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseApiUrl}/${id}`);
  }
}
