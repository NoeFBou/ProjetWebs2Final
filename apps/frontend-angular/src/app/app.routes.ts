import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { CarouselComponent } from './carousel/carousel.component';
import { OrganisationComponent } from './organisation/organisation.component';
import {Assignment2Component} from "./assignment2/assignment2.component";
import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";

export const routes: Routes = [

  { path: 'accueil', component: HomeComponent ,  },
  { path: 'assignment1', component: CarouselComponent  },
  { path: 'organisation', component: OrganisationComponent },
  { path: '', redirectTo: '/accueil', pathMatch: 'full' },
  { path: 'assignment2', component: Assignment2Component },
  { path: '**', component: PageNotFoundComponent }
];
