// Cleanup utility to eradicate all residual starter/mock data from localStorage and database

import { supabase } from './supabase';

const MOCK_TASK_TEXTS = [
  "Finalize and book primary wedding venue",
  "Hire wedding photographer and cinematic videographer",
  "Draft guest list and collect contact details",
  "Schedule bridal lehenga and groom sherwani fittings",
  "Book DJ and entertainment for Sangeet night",
  "Conduct catering tasting and finalize multi-cuisine menu",
  "Launch WedCraft wedding website & generate digital RSVP link",
  "Review stage and floral mandap decor concepts",
];

const MOCK_VENDOR_NAMES = [
  "Grand Heritage Palace Resort",
  "Royal Gourmet Catering Services",
  "Lumiere Wedding Stories",
  "Floral Fantasy Designers",
  "Heritage Couture Studio",
];

const MOCK_GUEST_NAMES = [
  "Vikram & Ananya Sharma",
  "Rohan Kapoor",
  "Meera Patel",
  "Amit & Neha Verma",
];

export async function purgeMockData(weddingId?: string): Promise<{ cleaned: boolean }> {
  if (typeof window === 'undefined') return { cleaned: false };

  let didClean = false;

  try {
    // 1. Clean localStorage tasks
    const rawTasks = localStorage.getItem('wedcraft_tbl_tasks');
    if (rawTasks) {
      const tasks = JSON.parse(rawTasks);
      if (Array.isArray(tasks)) {
        const filtered = tasks.filter((t: any) => {
          if (!t) return false;
          if (typeof t.id === 'string' && t.id.startsWith('task-')) return false;
          if (MOCK_TASK_TEXTS.includes(t.text)) return false;
          return true;
        });
        if (filtered.length !== tasks.length) {
          localStorage.setItem('wedcraft_tbl_tasks', JSON.stringify(filtered));
          didClean = true;
        }
      }
    }

    // 2. Clean localStorage budget items
    const rawBudget = localStorage.getItem('wedcraft_tbl_budget_items');
    if (rawBudget) {
      const budget = JSON.parse(rawBudget);
      if (Array.isArray(budget)) {
        const filtered = budget.filter((b: any) => {
          if (!b) return false;
          if (typeof b.id === 'string' && b.id.startsWith('b-')) return false;
          if (MOCK_VENDOR_NAMES.includes(b.vendor_name)) return false;
          return true;
        });
        if (filtered.length !== budget.length) {
          localStorage.setItem('wedcraft_tbl_budget_items', JSON.stringify(filtered));
          didClean = true;
        }
      }
    }

    // 3. Clean localStorage guests
    const rawGuests = localStorage.getItem('wedcraft_tbl_guests');
    if (rawGuests) {
      const guests = JSON.parse(rawGuests);
      if (Array.isArray(guests)) {
        const filtered = guests.filter((g: any) => {
          if (!g) return false;
          if (typeof g.id === 'string' && g.id.startsWith('g-')) return false;
          if (MOCK_GUEST_NAMES.includes(g.name)) return false;
          return true;
        });
        if (filtered.length !== guests.length) {
          localStorage.setItem('wedcraft_tbl_guests', JSON.stringify(filtered));
          didClean = true;
        }
      }
    }

    // 4. Clean localStorage vendors
    const rawVendors = localStorage.getItem('wedcraft_tbl_vendors');
    if (rawVendors) {
      const vendors = JSON.parse(rawVendors);
      if (Array.isArray(vendors)) {
        const filtered = vendors.filter((v: any) => {
          if (!v) return false;
          if (typeof v.id === 'string' && v.id.startsWith('v-')) return false;
          if (MOCK_VENDOR_NAMES.includes(v.name)) return false;
          return true;
        });
        if (filtered.length !== vendors.length) {
          localStorage.setItem('wedcraft_tbl_vendors', JSON.stringify(filtered));
          didClean = true;
        }
      }
    }

    // 5. Clean mock wedding venue / city / budget
    const rawWeddings = localStorage.getItem('wedcraft_tbl_weddings');
    if (rawWeddings) {
      const weddings = JSON.parse(rawWeddings);
      if (Array.isArray(weddings)) {
        let weddingModified = false;
        const cleanedWeddings = weddings.map((w: any) => {
          if (!w) return w;
          const nw = { ...w };
          if (nw.venue === 'Grand Heritage Venue' || nw.venue === 'Grand Heritage Palace Resort') {
            nw.venue = '';
            weddingModified = true;
          }
          if (nw.city === 'Jaipur') {
            nw.city = '';
            weddingModified = true;
          }
          if (nw.total_budget === 2000000 || nw.total_budget === 2500000) {
            nw.total_budget = 0;
            weddingModified = true;
          }
          return nw;
        });
        if (weddingModified) {
          localStorage.setItem('wedcraft_tbl_weddings', JSON.stringify(cleanedWeddings));
          didClean = true;
        }
      }
    }

    // 6. Clean active session
    const rawSession = localStorage.getItem('wedcraft_active_session');
    if (rawSession) {
      const session = JSON.parse(rawSession);
      if (session?.wedding) {
        let sessionModified = false;
        if (session.wedding.venue === 'Grand Heritage Venue' || session.wedding.venue === 'Grand Heritage Palace Resort') {
          session.wedding.venue = '';
          sessionModified = true;
        }
        if (session.wedding.city === 'Jaipur') {
          session.wedding.city = '';
          sessionModified = true;
        }
        if (session.wedding.total_budget === 2000000 || session.wedding.total_budget === 2500000) {
          session.wedding.total_budget = 0;
          sessionModified = true;
        }
        if (sessionModified) {
          localStorage.setItem('wedcraft_active_session', JSON.stringify(session));
          didClean = true;
        }
      }
    }

    // 7. If Supabase is connected and weddingId provided, delete mock rows from database
    if (weddingId) {
      try {
        for (const text of MOCK_TASK_TEXTS) {
          await supabase.from('tasks').delete().eq('wedding_id', weddingId).eq('text', text);
        }
        for (const name of MOCK_GUEST_NAMES) {
          await supabase.from('guests').delete().eq('wedding_id', weddingId).eq('name', name);
        }
        for (const name of MOCK_VENDOR_NAMES) {
          await supabase.from('vendors').delete().eq('wedding_id', weddingId).eq('name', name);
        }
        // Reset wedding venue / city / budget in DB if it was set to mock
        const { data: currentWed } = await supabase.from('weddings').select('*').eq('id', weddingId).single();
        if (currentWed) {
          const updates: any = {};
          if (currentWed.venue === 'Grand Heritage Venue' || currentWed.venue === 'Grand Heritage Palace Resort') {
            updates.venue = '';
          }
          if (currentWed.city === 'Jaipur') {
            updates.city = '';
          }
          if (currentWed.total_budget === 2000000 || currentWed.total_budget === 2500000) {
            updates.total_budget = 0;
          }
          if (Object.keys(updates).length > 0) {
            await supabase.from('weddings').update(updates).eq('id', weddingId);
          }
        }
      } catch {
        // ignore Supabase errors
      }
    }
  } catch (err) {
    console.error('Error during mock data purge:', err);
  }

  return { cleaned: didClean };
}

// Function to wipe EVERYTHING for a wedding to give 100% fresh start
export async function resetWeddingToFresh(weddingId: string): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // 1. Delete all tasks for this wedding
    const rawTasks = localStorage.getItem('wedcraft_tbl_tasks');
    if (rawTasks) {
      const tasks = JSON.parse(rawTasks);
      if (Array.isArray(tasks)) {
        localStorage.setItem('wedcraft_tbl_tasks', JSON.stringify(tasks.filter((t: any) => t.wedding_id !== weddingId)));
      }
    }

    // 2. Delete all budget items for this wedding
    const rawBudget = localStorage.getItem('wedcraft_tbl_budget_items');
    if (rawBudget) {
      const budget = JSON.parse(rawBudget);
      if (Array.isArray(budget)) {
        localStorage.setItem('wedcraft_tbl_budget_items', JSON.stringify(budget.filter((b: any) => b.wedding_id !== weddingId)));
      }
    }

    // 3. Delete all guests for this wedding
    const rawGuests = localStorage.getItem('wedcraft_tbl_guests');
    if (rawGuests) {
      const guests = JSON.parse(rawGuests);
      if (Array.isArray(guests)) {
        localStorage.setItem('wedcraft_tbl_guests', JSON.stringify(guests.filter((g: any) => g.wedding_id !== weddingId)));
      }
    }

    // 4. Delete all vendors for this wedding
    const rawVendors = localStorage.getItem('wedcraft_tbl_vendors');
    if (rawVendors) {
      const vendors = JSON.parse(rawVendors);
      if (Array.isArray(vendors)) {
        localStorage.setItem('wedcraft_tbl_vendors', JSON.stringify(vendors.filter((v: any) => v.wedding_id !== weddingId)));
      }
    }

    // 5. Remove seating tables for this wedding
    localStorage.removeItem(`wedcraft_seating_tables_${weddingId}`);

    // 6. Reset wedding venue, city, budget to empty/0
    const rawWeddings = localStorage.getItem('wedcraft_tbl_weddings');
    if (rawWeddings) {
      const weddings = JSON.parse(rawWeddings);
      if (Array.isArray(weddings)) {
        const updated = weddings.map((w: any) => {
          if (w.id === weddingId) {
            return { ...w, venue: '', city: '', total_budget: 0 };
          }
          return w;
        });
        localStorage.setItem('wedcraft_tbl_weddings', JSON.stringify(updated));
      }
    }

    // 7. Update active session
    const rawSession = localStorage.getItem('wedcraft_active_session');
    if (rawSession) {
      const session = JSON.parse(rawSession);
      if (session?.wedding?.id === weddingId) {
        session.wedding.venue = '';
        session.wedding.city = '';
        session.wedding.total_budget = 0;
        localStorage.setItem('wedcraft_active_session', JSON.stringify(session));
      }
    }

    // 8. DB cleanup if connected
    try {
      await Promise.all([
        supabase.from('tasks').delete().eq('wedding_id', weddingId),
        supabase.from('budget_items').delete().eq('wedding_id', weddingId),
        supabase.from('guests').delete().eq('wedding_id', weddingId),
        supabase.from('vendors').delete().eq('wedding_id', weddingId),
        supabase.from('weddings').update({ venue: '', city: '', total_budget: 0 }).eq('id', weddingId),
      ]);
    } catch {
      // ignore
    }
  } catch (err) {
    console.error('Error during full reset:', err);
  }
}
