import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';

/**
 * Prefixes all requests not starting with `http[s]` with `environment.serverUrl`.
 */
@Injectable({
  providedIn: 'root',
})
export class ApiPrefixInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      !/^(http|https):/i.test(request.url) &&
      !request.url.startsWith('/assets')
    ) {
      let url: string = environment.serverUrl;
      if (!request.url.startsWith('/v2')) {
        url += '/v1';
      }
      url += request.url;

      request = request.clone({ url });
    }
    return next.handle(request);
  }
}
