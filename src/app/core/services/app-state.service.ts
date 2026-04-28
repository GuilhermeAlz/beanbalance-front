import { Injectable, signal, computed } from '@angular/core';
import {
  Account,
  Transaction,
  Category,
  Budget,
  Toast,
} from '../models/app.models';

// Mock data

const initialCategories: Category[] = [
  { id: 'c1', name: 'Alimentação',  description: 'Food and groceries',         type: 'SYSTEM', createdAt: '2026-01-01' },
  { id: 'c2', name: 'Transporte',   description: 'Transportation costs',        type: 'SYSTEM', createdAt: '2026-01-01' },
  { id: 'c3', name: 'Moradia',      description: 'Housing and rent',            type: 'SYSTEM', createdAt: '2026-01-01' },
  { id: 'c4', name: 'Saúde',        description: 'Health and medical',          type: 'SYSTEM', createdAt: '2026-01-01' },
  { id: 'c5', name: 'Lazer',        description: 'Leisure and entertainment',   type: 'SYSTEM', createdAt: '2026-01-01' },
  { id: 'c6', name: 'Educação',     description: 'Education and courses',       type: 'SYSTEM', createdAt: '2026-01-01' },
  { id: 'c7', name: 'Assinaturas',  description: 'Subscriptions and services',  type: 'CUSTOM', createdAt: '2026-02-10' },
  { id: 'c8', name: 'Pet',          description: 'Pet expenses',                type: 'CUSTOM', createdAt: '2026-02-15' },
  { id: 'c9', name: 'Viagens',      description: 'Travel and trips',            type: 'CUSTOM', createdAt: '2026-03-01' },
];

const initialAccounts: Account[] = [
  { id: 'a1', name: 'Nubank Checking',   type: 'CHECKING',   balance: 4320.50,  createdAt: '2025-01-15' },
  { id: 'a2', name: 'Bradesco Savings',  type: 'SAVINGS',    balance: 8100.00,  createdAt: '2025-03-20' },
  { id: 'a3', name: 'XP Investimentos',  type: 'INVESTMENT', balance: 22000.00, createdAt: '2025-06-01' },
];

const initialTransactions: Transaction[] = [
  { id: 't1',  amount: 5200.00, type: 'INCOME',  date: '2026-04-01', description: 'SALARY',        categoryId: 'c1', accountId: 'a1' },
  { id: 't2',  amount:  180.00, type: 'EXPENSE', date: '2026-04-03', description: 'SUPERMERCADO',  categoryId: 'c1', accountId: 'a1' },
  { id: 't3',  amount:  450.00, type: 'EXPENSE', date: '2026-04-05', description: 'ALUGUEL',       categoryId: 'c3', accountId: 'a2' },
  { id: 't4',  amount:  300.00, type: 'INCOME',  date: '2026-04-10', description: 'FREELANCE',     categoryId: 'c5', accountId: 'a1' },
  { id: 't5',  amount:   59.90, type: 'EXPENSE', date: '2026-04-12', description: 'NETFLIX+SPORT', categoryId: 'c7', accountId: 'a1' },
  { id: 't6',  amount:  200.00, type: 'EXPENSE', date: '2026-04-14', description: 'FARMÁCIA',      categoryId: 'c4', accountId: 'a1' },
  { id: 't7',  amount: 1200.00, type: 'INCOME',  date: '2026-04-15', description: 'CONSULTORIA',   categoryId: 'c5', accountId: 'a2' },
  { id: 't8',  amount:   85.00, type: 'EXPENSE', date: '2026-04-16', description: 'COMBUSTÍVEL',   categoryId: 'c2', accountId: 'a1' },
  { id: 't9',  amount:  320.00, type: 'EXPENSE', date: '2026-04-18', description: 'ACADEMIA',      categoryId: 'c4', accountId: 'a1' },
  { id: 't10', amount:  150.00, type: 'EXPENSE', date: '2026-04-20', description: 'UBER/IFOOD',    categoryId: 'c2', accountId: 'a1' },
  { id: 't11', amount:  600.00, type: 'INCOME',  date: '2026-04-22', description: 'DIVIDENDOS',    categoryId: 'c5', accountId: 'a3' },
  { id: 't12', amount:  420.00, type: 'EXPENSE', date: '2026-04-23', description: 'SUPERMERCADO',  categoryId: 'c1', accountId: 'a2' },
];

const initialBudgets: Budget[] = [
  { id: 'b1', categoryId: 'c1', limit: 1500.00, spent:  780.00, month: '2026-04', createdAt: '2026-04-01' },
  { id: 'b2', categoryId: 'c3', limit: 2000.00, spent: 2000.00, month: '2026-04', createdAt: '2026-04-01' },
  { id: 'b3', categoryId: 'c5', limit:  500.00, spent:  620.00, month: '2026-04', createdAt: '2026-04-01' },
  { id: 'b4', categoryId: 'c2', limit:  400.00, spent:  120.00, month: '2026-04', createdAt: '2026-04-01' },
];

// Helpers

export function formatBRL(value: number): string {
  return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// Service

@Injectable({ providedIn: 'root' })
export class AppStateService {
    
  readonly isLoggedIn  = signal(true);
  readonly username    = signal('guilherme');
  readonly accounts    = signal<Account[]>(initialAccounts);
  readonly transactions = signal<Transaction[]>(initialTransactions);
  readonly categories  = signal<Category[]>(initialCategories);
  readonly budgets     = signal<Budget[]>(initialBudgets);
  readonly toasts      = signal<Toast[]>([]);

  // Auth

  login(name: string): void {
    this.username.set(name);
    this.isLoggedIn.set(true);
  }

  logout(): void {
    this.isLoggedIn.set(false);
  }

  // Toasts

  showToast(type: 'success' | 'error', message: string): void {
    const id = Date.now().toString();
    this.toasts.update(prev => [...prev, { id, type, message }]);
    setTimeout(() => this.toasts.update(prev => prev.filter(t => t.id !== id)), 4000);
  }

  dismissToast(id: string): void {
    this.toasts.update(prev => prev.filter(t => t.id !== id));
  }

  // Accounts

  addAccount(data: Omit<Account, 'id' | 'createdAt'>): void {
    const id = 'a' + Date.now();
    this.accounts.update(prev => [
      ...prev,
      { ...data, id, createdAt: new Date().toISOString().split('T')[0] },
    ]);
    this.showToast('success', 'ACCOUNT CREATED');
  }

  updateAccount(id: string, updates: Partial<Account>): void {
    this.accounts.update(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    this.showToast('success', 'ACCOUNT UPDATED');
  }

  deleteAccount(id: string): void {
    this.accounts.update(prev => prev.filter(a => a.id !== id));
    this.showToast('success', 'ACCOUNT DELETED');
  }

  // Transactions

  addTransaction(data: Omit<Transaction, 'id'>): void {
    const id = 't' + Date.now();
    this.transactions.update(prev => [...prev, { ...data, id }]);
    this.showToast('success', 'TRANSACTION SAVED');
  }

  deleteTransaction(id: string): void {
    this.transactions.update(prev => prev.filter(t => t.id !== id));
    this.showToast('success', 'TRANSACTION DELETED');
  }

  // Categories

  addCategory(data: Omit<Category, 'id' | 'createdAt' | 'type'>): void {
    const id = 'c' + Date.now();
    this.categories.update(prev => [
      ...prev,
      { ...data, id, type: 'CUSTOM', createdAt: new Date().toISOString().split('T')[0] },
    ]);
    this.showToast('success', 'CATEGORY CREATED');
  }

  updateCategory(id: string, updates: Partial<Category>): void {
    this.categories.update(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    this.showToast('success', 'CATEGORY UPDATED');
  }

  deleteCategory(id: string): void {
    this.categories.update(prev => prev.filter(c => c.id !== id));
    this.showToast('success', 'CATEGORY DELETED');
  }

  // Budgets

  addBudget(data: Omit<Budget, 'id' | 'createdAt'>): void {
    const id = 'b' + Date.now();
    this.budgets.update(prev => [
      ...prev,
      { ...data, id, createdAt: new Date().toISOString().split('T')[0] },
    ]);
    this.showToast('success', 'BUDGET CREATED');
  }

  updateBudget(id: string, updates: Partial<Budget>): void {
    this.budgets.update(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    this.showToast('success', 'BUDGET UPDATED');
  }

  deleteBudget(id: string): void {
    this.budgets.update(prev => prev.filter(b => b.id !== id));
    this.showToast('success', 'BUDGET DELETED');
  }
}
