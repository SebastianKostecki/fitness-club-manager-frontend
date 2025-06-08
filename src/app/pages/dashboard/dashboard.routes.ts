import { Component } from "@angular/core";
import { DashboardRouting } from "./utils/dashboard-routing.enum";
import { HomeComponent } from "./pages/home/home.component";
import { Routes } from "@angular/router";
import { UsersComponent } from "./pages/users/users.component";
import { RoomsComponent } from "./pages/rooms/rooms.component";
import { EquipmentsComponent } from "./pages/equipments/equipments.component";
import { RoomEquipmentsComponent } from "./pages/room-equipments/room-equipments.component";
import { FitnessClassesComponent } from "./pages/fitness-classes/fitness-classes.component";
import { ReservationsComponent } from "./pages/reservations/reservations.component";

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
    },
    {
        path: DashboardRouting.equipments,
        data: {breadcumb: 'Sprzęt'},
        component: EquipmentsComponent
    },
    {
        path: DashboardRouting.roomsEquipments,
        data: {breadcumb: 'Sprzęt w sali'},
        component: RoomEquipmentsComponent
    },
    {
        path: DashboardRouting.fitnessClasses,
        data: {breadcrumb: 'Zajęcia'},
        component: FitnessClassesComponent
    },
    {
        path: DashboardRouting.reservations,
        data: {breadcrumb: 'Rezerwacje'},
        component: ReservationsComponent
    }

];