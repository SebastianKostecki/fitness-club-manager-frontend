import { Component } from "@angular/core";
import { DashboardRouting } from "./utils/dashboard-routing.enum";
import { HomeComponent } from "./pages/home/home.component";
import { Routes } from "@angular/router";
import { UsersComponent } from "./pages/users/users.component";
import { RoomsComponent } from "./pages/rooms/rooms.component";

export const dashboardRoutes: Routes = [
    {
        path:'',
        redirectTo: DashboardRouting.home,
        pathMatch: "full"
    },
    {
        path: DashboardRouting.home,
        data: {breadcrumb: 'Startowa'},
        component: HomeComponent
    },
    {
        path: DashboardRouting.users,
        data: {breadcrumb: 'Użytkownicy'},
        component: UsersComponent
    },
    {
        path: DashboardRouting.rooms,
        data: {breadcrumb: 'Sale'},
        component: RoomsComponent
    }

];