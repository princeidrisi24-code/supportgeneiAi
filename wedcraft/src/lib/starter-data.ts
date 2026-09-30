import type { Task, BudgetItem, Guest, Vendor } from './database.types';

// Zero static starter data: every newly registered user starts with a completely fresh, empty workspace
export function getStarterTasks(_weddingId: string): Task[] {
  return [];
}

export function getStarterBudget(_weddingId: string): BudgetItem[] {
  return [];
}

export function getStarterGuests(_weddingId: string): Guest[] {
  return [];
}

export function getStarterVendors(_weddingId: string): Vendor[] {
  return [];
}
