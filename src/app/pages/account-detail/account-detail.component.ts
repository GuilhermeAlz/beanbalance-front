import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService, formatBRL, formatDate } from '../../core/services/app-state.service';
import { AccountType } from '../../core/models/app.models';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { DeleteModalComponent } from '../../shared/delete-modal/delete-modal.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { DrawerComponent } from '../../shared/drawer/drawer.component';
import { FormFieldComponent } from '../../shared/form-field/form-field.component';
import { InputComponent } from '../../shared/input/input.component';
import { SelectComponent } from '../../shared/select/select.component';

const PAGE_SIZE = 10;

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'CHECKING',    label: 'CHECKING' },
  { value: 'SAVINGS',     label: 'SAVINGS' },
  { value: 'CREDIT CARD', label: 'CREDIT CARD' },
  { value: 'INVESTMENT',  label: 'INVESTMENT' },
  { value: 'CASH',        label: 'CASH' },
];

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [
    BadgeComponent, ButtonComponent, DeleteModalComponent, PaginationComponent,
    DrawerComponent, FormFieldComponent, InputComponent, SelectComponent,
  ],
  templateUrl: './account-detail.component.html',
  styleUrl: './account-detail.component.css',
})
export class AccountDetailComponent {
  id = input<string>('');

  state          = inject(AppStateService);
  private router = inject(Router);

  readonly formatBRL   = formatBRL;
  readonly formatDate  = formatDate;
  readonly typeOptions = ACCOUNT_TYPE_OPTIONS;

  account = computed(() => this.state.accounts().find(a => a.id === this.id()));

  accountTxs = computed(() =>
    [...this.state.transactions()]
      .filter(t => t.accountId === this.id())
      .sort((a, b) => b.date.localeCompare(a.date))
  );

  totalPages = computed(() => Math.max(1, Math.ceil(this.accountTxs().length / PAGE_SIZE)));

  page = signal(1);

  pageData = computed(() => {
    const p = this.page();
    return this.accountTxs().slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);
  });

  editDrawerOpen = signal(false);
  formName       = signal('');
  formType       = signal('');
  formBalance    = signal('');

  deleteAccountModal = signal(false);
  deleteTxId         = signal<string | null>(null);

  deleteTxTarget = computed(() =>
    this.state.transactions().find(t => t.id === this.deleteTxId())
  );

  showingStart = computed(() =>
    Math.min((this.page() - 1) * PAGE_SIZE + 1, this.accountTxs().length)
  );
  showingEnd = computed(() =>
    Math.min(this.page() * PAGE_SIZE, this.accountTxs().length)
  );

  getCategoryName(catId: string): string {
    return this.state.categories().find(c => c.id === catId)?.name || '—';
  }

  formatIndex(n: number): string {
    return String(n).padStart(2, '0');
  }

  rowIndex(i: number): number {
    return (this.page() - 1) * PAGE_SIZE + i + 1;
  }

  goToAccounts() {
    this.router.navigate(['/accounts']);
  }

  openEditAccount() {
    const acc = this.account();
    if (!acc) return;
    this.formName.set(acc.name);
    this.formType.set(acc.type);
    this.formBalance.set(acc.balance.toString());
    this.editDrawerOpen.set(true);
  }

  handleSaveAccount() {
    const acc = this.account();
    if (!acc || !this.formName() || !this.formType()) return;
    const balance = parseFloat(this.formBalance()) || 0;
    this.state.updateAccount(acc.id, {
      name: this.formName(),
      type: this.formType() as AccountType,
      balance,
    });
    this.editDrawerOpen.set(false);
  }

  confirmDeleteAccount() {
    const acc = this.account();
    if (!acc) return;
    this.state.deleteAccount(acc.id);
    this.router.navigate(['/accounts']);
  }

  confirmDeleteTx() {
    const id = this.deleteTxId();
    if (!id) return;
    this.state.deleteTransaction(id);
    this.deleteTxId.set(null);
  }
}
