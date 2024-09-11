import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})

export class AppComponent {
  public appPages = [
    { title: 'Files', url: '/folder/files', icon: 'document' },
    { title: 'Shared with me', url: '/folder/shared-with-me', icon: 'link' },
  ];

  showMenu = false; // Controla si el menú se muestra o no

  constructor(private router: Router, private authService: AuthService) {
    // Escucha cambios de ruta
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateMenuVisibility(event.url);
      }
    });
  }

  // Actualiza la visibilidad del menú dependiendo de la ruta
  updateMenuVisibility(url: string) {
    // Si estás autenticado y en una ruta que debe mostrar el menú
    if (this.authService.isLoggedIn() && (url.includes('/folder'))) {
      this.showMenu = true;
    } else {
      this.showMenu = false; // Oculta el menú en otras páginas (landing)
    }
  }
}
