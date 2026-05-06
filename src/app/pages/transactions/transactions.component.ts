import { Component, computed, inject, signal } from '@angular/core';
import { AppStateService, formatBRL, formatDate } from '../../core/services/app-state.service';
import { TransactionType } from '../../core/models/app.models';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { DrawerComponent } from '../../shared/drawer/drawer.component';
import { FormFieldComponent } from '../../shared/form-field/form-field.component';
import { InputComponent } from '../../shared/input/input.component';
import { SelectComponent } from '../../shared/select/select.component';
import { ToggleComponent } from '../../shared/toggle/toggle.component';
import { DeleteModalComponent } from '../../shared/delete-modal/delete-modal.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    PageHeaderComponent, ButtonComponent,
    DrawerComponent, FormFieldComponent, InputComponent, SelectComponent,
    ToggleComponent, DeleteModalComponent, PaginationComponent,
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css',
})
export class TransactionsComponent {
  state = inject(AppStateService);

  readonly formatBRL  = formatBRL;
  readonly formatDate = formatDate;

  readonly typeOptions = [
    { value: 'INCOME',  label: 'INCOME' },
    { value: 'EXPENSE', label: 'EXPENSE' },
  ];

  readonly filterTypeOptions = [
    { value: '',        label: 'TYPE: ALL' },
    { value: 'INCOME',  label: 'INCOME' },
    { value: 'EXPENSE', label: 'EXPENSE' },
  ];

  // Filters
  filterAccount  = signal('');
  filterCategory = signal('');
  filterType     = signal('');
  filterMonth    = signal('');

  // Pagination
  page = signal(1);

  // Drawer
  drawerOpen = signal(false);
  deleteId   = signal<string | null>(null);

  // Form
  formAmount      = signal('');
  formType        = signal<TransactionType>('EXPENSE');
  formDate        = signal(new Date().toISOString().split('T')[0]);
  formAccountId   = signal('');
  formCategoryId  = signal('');
  formDescription = signal('');

  accountOptions = computed(() =>
    this.state.accounts().map(a => ({ value: a.id, label: a.name.toUpperCase() }))
  );

  categoryOptions = computed(() =>
    this.state.categories().map(c => ({ value: c.id, label: c.name.toUpperCase() }))
  );

  allAccountOptions = computed(() => [
    { value: '', label: 'ALL ACCOUNTS' },
    ...this.accountOptions(),
  ]);

  allCategoryOptions = computed(() => [
    { value: '', label: 'ALL CATEGORIES' },
    ...this.categoryOptions(),
  ]);

  filtered = computed(() => {
    let txs = [...this.state.transactions()].sort((a, b) => b.date.localeCompare(a.date));
    const fa = this.filterAccount();
    const fc = this.filterCategory();
    const ft = this.filterType();
    const fm = this.filterMonth();
    if (fa) txs = txs.filter(t => t.accountId === fa);
    if (fc) txs = txs.filter(t => t.categoryId === fc);
    if (ft) txs = txs.filter(t => t.type === ft);
    if (fm) txs = txs.filter(t => t.date.startsWith(fm));
    return txs;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));

  pageData = computed(() => {
    const p = this.page();
    return this.filtered().slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);
  });

  deleteTarget = computed(() =>
    this.state.transactions().find(t => t.id === this.deleteId())
  );

  deleteAccName = computed(() => {
    const acc = this.state.accounts().find(a => a.id === this.deleteTarget()?.accountId);
    return acc ? acc.name.toUpperCase() : '';
  });

  showingStart = computed(() =>
    Math.min((this.page() - 1) * PAGE_SIZE + 1, this.filtered().length)
  );
  showingEnd = computed(() =>
    Math.min(this.page() * PAGE_SIZE, this.filtered().length)
  );

  clearFilters() {
    this.filterAccount.set('');
    this.filterCategory.set('');
    this.filterType.set('');
    this.filterMonth.set('');
    this.page.set(1);
  }

  resetForm() {
    this.formAmount.set('');
    this.formType.set('EXPENSE');
    this.formDate.set(new Date().toISOString().split('T')[0]);
    this.formAccountId.set('');
    this.formCategoryId.set('');
    this.formDescription.set('');
  }

  openDrawer() {
    this.resetForm();
    this.drawerOpen.set(true);
  }

  handleSave() {
    if (!this.formAmount() || !this.formAccountId() || !this.formCategoryId()) return;
    this.state.addTransaction({
      amount:      parseFloat(this.formAmount()) || 0,
      type:        this.formType(),
      date:        this.formDate(),
      accountId:   this.formAccountId(),
      categoryId:  this.formCategoryId(),
      description: this.formDescription(),
    });
    this.drawerOpen.set(false);
    this.resetForm();
  }

  confirmDelete() {
    const id = this.deleteId();
    if (!id) return;
    this.state.deleteTransaction(id);
    this.deleteId.set(null);
  }

  setFormType(v: string) {
    this.formType.set(v as TransactionType);
  }

  setFilterAccount(v: string)  { this.filterAccount.set(v);  this.page.set(1); }
  setFilterCategory(v: string) { this.filterCategory.set(v); this.page.set(1); }
  setFilterType(v: string)     { this.filterType.set(v);     this.page.set(1); }

  setFilterMonth(e: Event) {
    this.filterMonth.set((e.target as HTMLInputElement).value);
    this.page.set(1);
  }

  getCategoryName(catId: string): string {
    return this.state.categories().find(c => c.id === catId)?.name || '—';
  }

  getAccountFirstWord(accId: string): string {
    const acc = this.state.accounts().find(a => a.id === accId);
    return acc ? acc.name.split(' ')[0].toUpperCase() : '—';
  }

  formatIndex(n: number): string {
    return String(n).padStart(2, '0');
  }

  rowIndex(i: number): number {
    return (this.page() - 1) * PAGE_SIZE + i + 1;
  }
}
