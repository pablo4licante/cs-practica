import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  login() {
    // Simula la autenticación del usuario
    const fakeToken = 'mi-token-falso'; 
    // Llama al método login del AuthService para almacenar el token
    this.authService.login(fakeToken);
    // Redirige al usuario a la página protegida (folder/files)
    this.router.navigate(['/folder/files']);
  }

}
