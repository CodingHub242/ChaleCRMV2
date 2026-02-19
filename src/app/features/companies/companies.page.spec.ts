import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompaniesPage } from './companies.page';

describe('CompaniesPage', () => {
  let component: CompaniesPage;
  let fixture: ComponentFixture<CompaniesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CompaniesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
