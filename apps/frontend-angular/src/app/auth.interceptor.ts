import {HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {Observable} from "rxjs";
import {inject} from "@angular/core";
import {AuthServiceService} from "./auth-service.service";
import {environment} from "../environments/environment";

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthServiceService);
  const token = authService.getToken(); // Get token from your service

  // Check if the request is going to your API URL
  if (token && req.url.startsWith(environment.apiUrl)) {
    // Clone the request and add the authorization header
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedReq);
  }

  // If no token or not an API request, pass the original request along
  return next(req);
};
