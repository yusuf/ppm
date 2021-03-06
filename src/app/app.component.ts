
import { ProjectsService } from './services/projects.service';
import { Project } from './interfaces/project.interface';
import { LoginService } from './services/passport.service';
import { Component, OnInit } from '@angular/core';
import { Auth }              from './auth.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ProjectsService, LoginService, Auth]
})
export class AppComponent implements OnInit {

  title = 'JARIDA Thesis Manager';
  myAuth = false;
  sumProjects: number = 0;
  myUser: any = {};

  constructor (private loginService: LoginService, private auth: Auth, private projectsService: ProjectsService) {
    this.loginService.getAuth().then(auth => {
      this.myAuth = auth;
      if (this.myAuth == true){
        this.loginService.getUser().then((user: any) => {
          this.myUser = user;
          return this.myUser;
        });
        this.projectsService.getAllProjects().then((projects: Project[]) => {
          this.sumProjects = projects.length;
        });
      }
    });
  }

  ngOnInit () {
  }

  public isAuthenticated() {
    this.loginService.getAuth().then(auth => {
      this.myAuth = auth;
    });
    return this.myAuth;
  }

}
