import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';

//SERVICES
import { UserService } from '../../../services/user.service';
import { SchemeService } from '../../../services/scheme.service';
import { Router, ActivatedRoute } from '@angular/router';
import { QuestionService } from '../../../services/Form-Request-Services/question.service';
import { QuestionBase } from '../../../models/question-base';

//MODELS
import { Scheme } from '../../../models/Scheme';

@Component({
  selector: 'app-admin-layout-dynamic-form',
  templateUrl: './admin-layout-dynamic-form.component.html',
  styleUrls: ['./admin-layout-dynamic-form.component.css'],
})
export class AdminLayoutDynamicFormComponent implements OnInit {
  //Variables
  questions$: Observable<QuestionBase<any>[]>; //obs de array de fields
  questions: QuestionBase<any>[] = []; // array de fields
  schemeName : string;
  public schemaFields: Scheme = null;

  constructor(
    private serviceQuestion: QuestionService,
    private userService: UserService,
    private schemeService: SchemeService,
    private activatedRoute: ActivatedRoute
  ) {
    this.loadFormSchema();
  }

  ngOnInit(): void {}

  public loadFormSchema() {
    this.activatedRoute.params.subscribe((params) => {
      const { schemeName } = params;
      this.schemeName = schemeName;
      this.schemeService
        .getCompleteScheme(schemeName)
        .subscribe((scheme: Scheme) => {
          this.schemaFields = scheme;

          this.schemaFields.fields.forEach((question) => {
            this.questions.push(new QuestionBase<any>(question));
          });
        });
    });
  }
}