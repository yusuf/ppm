import { Component, OnInit, Input } from '@angular/core';
import { ProjectsService } from '../projects.service';
import { Project } from '../project.interface';
import { ProjectDetailsComponent } from '../project-details/project-details.component';
import 'rxjs/add/operator/map';


@Component({
  selector: 'project-list',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  providers: [ProjectsService]
})
export class ProjectsComponent implements OnInit {
  // instantiate posts to an empty object
  projects: Project[];
  selectedProject: Project;

  constructor(private projectsService: ProjectsService) { }

  ngOnInit() {
    this.projectsService
      .getAllProjects()
      .then((projects: Project[]) => {
        this.projects = projects.map((project) => {
          return project;
        });
      });
  }

  private getIndexOfProject = (projectId : Number) => {
    return this.projects.findIndex((project) => {
      return project._id === projectId;
    });
  }

  selectProject(project: Project) {
    this.selectedProject = project;
  }

  createNewProject() {
    var project: Project = {
      title: '',
      advisors: '',
      proposer: '',
      important_courses: '',
      background: '',
      motivation: '',
      methods: '',
      objectives: '',
      students_assigned: ''
    };
    this.selectProject(project);
  }

  deleteProject = (projectId: Number) => {
    var idx = this.getIndexOfProject(projectId);
    if (idx !== -1) {
      this.projects.splice(idx, 1);
      this.selectProject(null);
    }
    return this.projects;
  }

  addProject = (project: Project) => {
    this.projects.push(project);
    this.selectProject(project);
    return this.projects;
  }

  updateProject = (project: Project) => {
    var idx = this.getIndexOfProject(project._id);
    if (idx !== -1) {
      this.projects[idx] = project;
      this.selectProject(project);
    }
    return this.projects;
  }

  spInitSSO(binding) {
    window.location.href = '/sso/spinitsso-' + (binding === 0 ? 'redirect' : 'post');
  }
}
