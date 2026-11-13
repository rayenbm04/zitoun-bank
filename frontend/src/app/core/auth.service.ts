import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_URL } from './config';
import { User } from './models';

interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  region?: string;
  password: string;
}

const TOKEN_KEY = 'zitoun_bank_token';
const USER_KEY = 'zitoun_bank_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly user = signal<User | null>(this.readUser());
  readonly isLoggedIn = computed(() => this.user() !== null && this.token !== null);

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/register`, data).pipe(tap(res => this.save(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, { email, password }).pipe(tap(res => this.save(res)));
  }

  updateProfile(data: Omit<RegisterData, 'password'>): Observable<{ user: User }> {
    return this.http.put<{ user: User }>(`${API_URL}/auth/me`, data).pipe(
      tap(res => {
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        this.user.set(res.user);
      })
    );
  }

  changePassword(actuel: string, nouveau: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${API_URL}/auth/password`, { actuel, nouveau });
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
    this.router.navigate(['/connexion']);
  }

  private save(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.user.set(res.user);
  }

  private readUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
