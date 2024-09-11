import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

class MockAuthService {
  isLoggedIn() {
    return of(true); // Mocking a successful authentication check
  }
}

class MockRouter {
  navigate(path: string[]) {}
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation if user is logged in', () => {
    spyOn(authService, 'isLoggedIn').and.returnValue(true); // Simulate user is logged in
    spyOn(router, 'navigate'); // Spy on the router navigate method

    const result = guard.canActivate();

    expect(result).toBe(true); // Should allow access
    expect(router.navigate).not.toHaveBeenCalled(); // Router should not redirect
  });

  it('should redirect to login if user is not logged in', () => {
    spyOn(authService, 'isLoggedIn').and.returnValue(false); // Simulate user is not logged in
    spyOn(router, 'navigate'); // Spy on the router navigate method

    const result = guard.canActivate();

    expect(result).toBe(false); // Should deny access
    expect(router.navigate).toHaveBeenCalledWith(['/login']); // Router should redirect to login
  });
});
