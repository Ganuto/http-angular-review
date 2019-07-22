import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpEventType } from '@angular/common/http';
import { Post } from './post.model';
import { map, catchError, tap } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PostsService {
  error = new Subject<string>();

  constructor(private http: HttpClient) {

  }

  createAndStore(title: string, content: string) {
    // Send Http request
    const postData: Post = { title: title, content: content };
    this.http.post<{ name: string }>(
      'https://ng-complete-guide-eb5ea.firebaseio.com/posts.json',
      postData, {
        observe: 'response'
      }
    )
      .subscribe(
        responseData => {
          console.log(responseData.body);
        },
        error => {
          this.error.next(error.message);
        }
      );
  }

  fetchPosts() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('print', 'pretty');
    searchParams = searchParams.append('custom', 'key');
    return this.http.get<{ [key: string]: Post }>('https://ng-complete-guide-eb5ea.firebaseio.com/posts.json',
      {
        headers: new HttpHeaders({
          'Custom-Header': 'Hello!'
        }),
        params: searchParams,
      })
      .pipe(
        map(responseData => {
          const postsArray: Post[] = [];

          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              postsArray.push({ ...responseData[key], id: key });
            }
          }

          return postsArray;
        }), catchError(errorResponse => {
          // Send to Analytics server / Log the error on server ...
          return throwError(errorResponse);
        })
      );
  }

  deletePosts() {
    return this.http.delete('https://ng-complete-guide-eb5ea.firebaseio.com/posts.json', {
      observe: 'events',
      responseType: 'json'
    }).pipe(tap(event => {
      console.log(event);
      if (event.type === HttpEventType.Sent) {
        // ...
      }
      if (event.type === HttpEventType.Response) {
        console.log(event.body);
      }
    }));
  }

}
