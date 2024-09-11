import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  isLoggedIn(): boolean {
    if(localStorage.getItem('token')) {
      return true
    } else {
      return false
    }
      // Return true if token exists
  }

  login(token: string): void {
    localStorage.setItem('token', token); // Store token
  }

  logout(): void {
    localStorage.removeItem('token'); // Remove token
  }
}
