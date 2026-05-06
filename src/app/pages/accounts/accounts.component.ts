import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService, formatBRL, formatDate } from '../../core/services/app-state.service';
import { Account, AccountType } from '../../core/models/app.models';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { DrawerComponent } from '../../shared/drawer/drawer.component';
import { FormFieldComponent } from '../../shared/form-field/form-field.component';
import { InputComponent } from '../../shared/input/input.component';
import { SelectComponent } from '../../shared/select/select.component';
import { DeleteModalComponent } from '../../shared/delete-modal/delete-modal.component';
import { BadgeComponent } from '../../shared/badge/badge.component';

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'CHECKING',    label: 'CHECKING' },
  { value: 'SAVINGS',     label: 'SAVINGS' },
  { value: 'CREDIT CARD', label: 'CREDIT CARD' },
  { value: 'INVESTMENT',  label: 'INVESTMENT' },
  { value: 'CASH',        label: 'CASH' },
];

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    PageHeaderComponent, ButtonComponent, EmptyStateComponent,
    DrawerComponent, FormFieldComponent, InputComponent, SelectComponent,
    DeleteModalComponent, BadgeComponent,
  ],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css',
})
export class AccountsComponent {
  state          = inject(AppStateService);
  private router = inject(Router);

  accounts = this.state.accounts;

  readonly typeOptions = ACCOUNT_TYPE_OPTIONS;
  readonly formatBRL   = formatBRL;
  readonly formatDate  = formatDate;

  drawerOpen = signal(false);
  editId     = signal<string | null>(null);
  deleteId   = signal<string | null>(null);

  formName    = signal('');
  formType    = signal('');
  formBalance = signal('');

  deleteTarget = computed(() => this.accounts().find(a => a.id === this.deleteId()));

  openCreate() {
    this.editId.set(null);
    this.formName.set('');
    this.formType.set('');
    this.formBalance.set('');
    this.drawerOpen.set(true);
  }

  openEdit(acc: Account) {
    this.editId.set(acc.id);
    this.formName.set(acc.name);
    this.formType.set(acc.type);
    this.formBalance.set(acc.balance.toString());
    this.drawerOpen.set(true);
  }

  handleSave() {
    if (!this.formName() || !this.formType()) return;
    const balance = parseFloat(this.formBalance()) || 0;
    const id = this.editId();
    if (id) {
      this.state.updateAccount(id, {
        name: this.formName(),
        type: this.formType() as AccountType,
        balance,
      });
    } else {
      this.state.addAccount({
        name: this.formName(),
        type: this.formType() as AccountType,
        balance,
      });
    }
    this.drawerOpen.set(false);
  }

  confirmDelete() {
    const id = this.deleteId();
    if (!id) return;
    this.state.deleteAccount(id);
    this.deleteId.set(null);
  }

  goToDetail(id: string) {
    this.router.navigate(['/accounts', id]);
  }
}
