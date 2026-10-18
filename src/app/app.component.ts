import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../layout/navbar/navbar.component';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  host: {
    class: 'block w-full min-h-screen'
  },
  template: `
    <div class="min-h-screen bg-slate-100 flex antialiased text-slate-800">
      <!-- Fixed Left Sidebar: strictly identical position across all pages -->
      <app-sidebar
        [isOpen]="isSidebarOpen"
        (closeSidebar)="isSidebarOpen = false"
      ></app-sidebar>

      <!-- Main Layout: offset by 256px on desktop (lg:pl-64) so it never jumps -->
      <div class="flex-1 flex flex-col min-w-0 min-h-screen lg:pl-64 transition-[padding] duration-200">
        <!-- Persistent Top Navbar: stays fixed at top: 0 on all pages -->
        <app-navbar
          (toggleSidebar)="isSidebarOpen = !isSidebarOpen"
        ></app-navbar>

        <!-- Main Content Area: identical framing, padding, and constraints for all views -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50/70">
          <div class="max-w-7xl mx-auto w-full">
            <router-outlet></router-outlet>
          </div>
        </main>

        <!-- Fixed Bottom Platform Footer -->
        <footer class="h-10 bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-slate-700">Fake Store Analytics</span>
            <span>&bull;</span>
            <span>Plateforme Décisionnelle &amp; Data Engineering</span>
          </div>
          <div class="hidden sm:flex items-center gap-3">
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              API Gateway Connectée
            </span>
            <span>&bull;</span>
            <span class="font-mono text-slate-400">v1.0.0</span>
          </div>
        </footer>
      </div>
    </div>
  `
})
export class AppComponent {
  isSidebarOpen = false;
}
