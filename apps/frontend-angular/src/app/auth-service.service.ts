import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private baseApiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseApiUrl}/login`, { email, password });
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isAdmin(): boolean {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(window.atob(token.split('.')[1]));
        return payload.isAdmin === true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.reload();
  }
}
