import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../environments/environment";

export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  isAdmin: boolean;
  profilePicture?: string;
}

export interface DecodedToken {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  isAdmin: boolean;
  profilePicture?: string;
  exp?: number;
  iat?: number;
}

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
        const payload: DecodedToken = JSON.parse(window.atob(token.split('.')[1]));

        return payload.isAdmin;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  getCurrentUser(): DecodedToken | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload: DecodedToken = JSON.parse(window.atob(token.split('.')[1]));
        return payload;
      } catch (e) {
        console.error('Error decoding token:', e);
        return null;
      }
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.reload();
  }
}
