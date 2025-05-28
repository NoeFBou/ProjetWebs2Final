import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { CarouselComponent } from './carousel/carousel.component';
import { OrganisationComponent } from './organisation/organisation.component';
import {Assignment2Component} from "./assignment2/assignment2.component";
// You'll likely want an AuthGuard here later

export const routes: Routes = [

  { path: 'accueil', component: HomeComponent , /*canActivate: [AuthGuard] */ },
  { path: 'assignment1', component: CarouselComponent /*, canActivate: [AuthGuard] */ },
  { path: 'organisation', component: OrganisationComponent /*, canActivate: [AuthGuard] */ },
  { path: '', redirectTo: '/accueil', pathMatch: 'full' }, // Default route
  { path: 'assignment2', component: Assignment2Component },

  // Consider adding a wildcard route for 404 pages:
  // { path: '**', component: PageNotFoundComponent },
];
