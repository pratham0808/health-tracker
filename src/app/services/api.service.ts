import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Exercise {
  _id?: string;
  name: string;
  category: string;
}

export interface Log {
  _id?: string;
  exerciseId: string;
  exerciseName: string;
  category: string;
  date: string;
  reps?: number;
  count?: number;
}

export interface DailyStats {
  reps: number;
  count: number;
}

export interface ExerciseStats {
  exerciseName: string;
  dailyData: { [date: string]: DailyStats };
  totals: DailyStats;
  lifetimeAverage: {
    reps: number;
    count: number;
  };
  daysInPeriod: number;
  expectedFromAverage: {
    reps: number;
    count: number;
  };
}

export interface OverallStats {
  currentStreak: number;
  longestStreak: number;
  totalWorkoutDays: number;
  totalExercises: number;
  periodTotal: { reps: number; count: number };
  lifetimeAverage: { reps: number; count: number };
  comparisonPercent: number;
}

export interface EnhancedStatsResponse {
  exercises: ExerciseStats[];
  overall: OverallStats;
}

// Exercise Groups
export interface ExerciseGroupsDoc {
  _id?: string;
  categories: Array<{
    categoryName: string;
    exercises: Array<{ exerciseName: string }>;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';
  private http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Exercise endpoints
  getExercises(category?: string): Observable<Exercise[]> {
    const url = category 
      ? `${this.apiUrl}/exercises?category=${category}`
      : `${this.apiUrl}/exercises`;
    return this.http.get<Exercise[]>(url, { headers: this.getHeaders() });
  }

  createExercise(name: string, category: string): Observable<Exercise> {
    return this.http.post<Exercise>(`${this.apiUrl}/exercises`, { name, category }, { headers: this.getHeaders() });
  }

  deleteExercise(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/exercises/${id}`, { headers: this.getHeaders() });
  }

  // Log endpoints
  getLogs(date?: string, category?: string): Observable<Log[]> {
    let url = `${this.apiUrl}/logs`;
    const params: string[] = [];
    
    if (date) params.push(`date=${date}`);
    if (category) params.push(`category=${category}`);
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return this.http.get<Log[]>(url, { headers: this.getHeaders() });
  }

  createLog(log: Log): Observable<Log> {
    return this.http.post<Log>(`${this.apiUrl}/logs`, log, { headers: this.getHeaders() });
  }

  updateLog(id: string, data: { reps?: number; count?: number }): Observable<Log> {
    return this.http.put<Log>(`${this.apiUrl}/logs/${id}`, data, { headers: this.getHeaders() });
  }

  deleteLog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/logs/${id}`, { headers: this.getHeaders() });
  }

  // Stats endpoints
  getStats(days: number, category?: string): Observable<EnhancedStatsResponse> {
    let url = `${this.apiUrl}/stats?days=${days}`;
    
    if (category) {
      url += `&category=${category}`;
    }
    
    return this.http.get<EnhancedStatsResponse>(url, { headers: this.getHeaders() });
  }

  // Exercise Groups endpoints
  getExerciseGroups(): Observable<ExerciseGroupsDoc | null> {
    return this.http.get<ExerciseGroupsDoc | null>(`${this.apiUrl}/exercise-groups`, { headers: this.getHeaders() });
  }

  getExerciseGroupsByUser(): Observable<ExerciseGroupsDoc | null> {
    return this.http.get<ExerciseGroupsDoc | null>(`${this.apiUrl}/exercise-groups/user`, { headers: this.getHeaders() });
  }

  upsertExerciseGroups(doc: ExerciseGroupsDoc): Observable<ExerciseGroupsDoc> {
    return this.http.post<ExerciseGroupsDoc>(`${this.apiUrl}/exercise-groups/upsert`, doc, { headers: this.getHeaders() });
  }

  deleteExerciseGroups(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/exercise-groups/${id}`, { headers: this.getHeaders() });
  }
}

