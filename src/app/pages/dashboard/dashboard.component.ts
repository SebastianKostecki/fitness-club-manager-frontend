import { Component, OnInit } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {CommonModule, NgIf} from '@angular/common';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatCardModule} from '@angular/material/card';
import { DashboardRouting } from './utils/dashboard-routing.enum';
import {MatListModule} from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { UserService, User } from '../../shared/services/user.service';
import { Observable, map } from 'rxjs';


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
export class DashboardComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}
  
  currentUser$: Observable<User | null> = this.userService.currentUser$;
  filteredLinks$: Observable<any[]> = this.currentUser$.pipe(
    map(user => this.getFilteredLinks(user))
  );
  
  private allLinks: any[] = [
    {
      name: 'Domowa',
      icon: 'home',
      path: DashboardRouting.home,
      roles: ['admin', 'trainer', 'regular', 'receptionist']
    },
    {
      name: 'Użytkownicy',
      icon: 'manage_accounts',
      path: DashboardRouting.users,
      roles: ['admin', 'receptionist']
    },
    {
      name: "Sale",
      icon: "domain",
      path: DashboardRouting.rooms,
      roles: ['admin', 'trainer', 'regular', 'receptionist']
    },
    {
      name: "Sprzęt",
      icon: "construction",
      path: DashboardRouting.equipments,
      roles: ['admin', 'receptionist']
    },
    {
      name:"Sprzęt w sali",
      icon: "room_preferences",
      path: DashboardRouting.roomsEquipments,
      roles: ['admin', 'receptionist']
    },
    {
      name:"Zajęcia",
      icon: "fitness_center",
      path: DashboardRouting.fitnessClasses,
      roles: ['admin', 'trainer', 'receptionist']
    },
    {
     name: 'Rezerwacje',
     icon: 'event',
     path: DashboardRouting.reservations,
     roles: ['admin', 'receptionist']
    }
  ];

  ngOnInit(): void {
    // Load current user on component init
    this.userService.getCurrentUser().subscribe();
  }

  private getFilteredLinks(user: User | null): any[] {
    if (!user) {
      return this.allLinks.filter(link => link.roles.includes('regular'));
    }
    
    return this.allLinks.filter(link => 
      link.roles.includes(user.Role.toLowerCase())
    );
  }

  protected getIsHomePage(sidenavItem: any): boolean {
    return sidenavItem.path === DashboardRouting.home;
  }

  onLogout(): void {
    this.authService.logout();
  }


}
