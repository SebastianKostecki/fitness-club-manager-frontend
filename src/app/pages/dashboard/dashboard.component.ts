import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {CommonModule, NgIf} from '@angular/common';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatCardModule} from '@angular/material/card';
import { DashboardRouting } from './utils/dashboard-routing.enum';
import {MatListModule} from '@angular/material/list';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    NgIf,
    MatSidenavModule,
    MatCardModule,
    MatListModule,
    CommonModule,
    RouterModule
    
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  protected links: any[] = [
    {
      name: 'Domowa',
      icon: 'home',
      path: DashboardRouting.home,
    },
    {
      name: 'Użytkownicy',
      icon: 'manage_accounts',
      path: DashboardRouting.users,
    },
    
  ];

  protected getIsHomePage(sidenavItem: any): boolean {
    return sidenavItem.path === DashboardRouting.home;
  }

}
