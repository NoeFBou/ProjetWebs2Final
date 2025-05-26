import { CanActivateFn } from '@angular/router';
import {inject} from "@angular/core";
import {AuthServiceService} from "./auth-service.service";
import {Router} from "express";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);

  if (authService.getToken()) {
    return true;
  } else {
    router.navigate(['/']);
    return false;
  }
};
