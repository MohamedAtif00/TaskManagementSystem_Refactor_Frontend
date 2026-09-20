import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from './api/api.const';

const withCredentials = { withCredentials: true as const };

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  constructor(private http: HttpClient) {}

  get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${API.baseUrl}${url}`, { ...withCredentials, params });
  }

  post<T>(url: string, body: unknown = {}, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(`${API.baseUrl}${url}`, body, { ...withCredentials, headers });
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${API.baseUrl}${url}`, body, withCredentials);
  }

  patch<T>(url: string, body: unknown = {}): Observable<T> {
    return this.http.patch<T>(`${API.baseUrl}${url}`, body, withCredentials);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${API.baseUrl}${url}`, withCredentials);
  }
}
