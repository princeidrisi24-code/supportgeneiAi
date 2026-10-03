'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, rawSupabase, isLiveSupabaseConfigured } from '@/lib/supabase';
import { purgeMockData, resetWeddingToFresh } from '@/lib/cleanup-mock-data';
import type { Profile, Wedding } from '@/lib/database.types';
import type { User, Session } from '@supabase/supabase-js';

function isNetworkOrFetchError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  const name = (error.name || '').toLowerCase();
  return (
    error.status === 0 ||
    name === 'authretryablefetcherror' ||
    name === 'typeerror' ||
    msg.includes('load failed') ||
    msg.includes('fetch') ||
    msg.includes('network') ||
    msg.includes('failed to load') ||
    msg.includes('connection') ||
    msg.includes('abort') ||
    msg.includes('offline')
  );
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  wedding: Wedding | null;
  session: Session | null;
  loading: boolean;
  isLocalMode: boolean;
}

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string, name: string, partner1: string, partner2: string, weddingDate: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshWedding: () => Promise<void>;
  resetToFresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_EMAIL = 'guest@wedcraft.demo';
const DEMO_PASS = 'demo123456';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    wedding: null,
    session: null,
    loading: true,
    isLocalMode: false,
  });

  const fetchUserData = useCallback(async (userId: string) => {
    // Fetch profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) {
      profile = {
        id: userId,
        name: 'Wedding Planner',
        email: '',
        avatar_url: null,
        created_at: new Date().toISOString(),
      };
    }

    // Fetch wedding
    let { data: wedding } = await supabase
      .from('weddings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!wedding) {
      const nowIso = new Date().toISOString();
      const futureDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const newWedding = {
        id: `wed_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        user_id: userId,
        partner1_name: profile?.name ? profile.name.split(' ')[0] : 'Partner 1',
        partner2_name: 'Partner 2',
        wedding_date: futureDate,
        venue: '',
        city: '',
        total_budget: 0,
        created_at: nowIso,
      };
      const { data: createdWed } = await supabase.from('weddings').insert(newWedding).select().single();
      wedding = createdWed || newWedding;
    }

    if (wedding) {
      let changed = false;
      const updates: any = {};
      if (wedding.venue === 'Grand Heritage Venue' || wedding.venue === 'Grand Heritage Palace Resort') {
        wedding.venue = '';
        updates.venue = '';
        changed = true;
      }
      if (wedding.city === 'Jaipur') {
        wedding.city = '';
        updates.city = '';
        changed = true;
      }
      if (changed && (wedding.total_budget === 2000000 || wedding.total_budget === 2500000)) {
        wedding.total_budget = 0;
        updates.total_budget = 0;
      }
      if (changed) {
        try {
          await supabase.from('weddings').update(updates).eq('id', wedding.id);
        } catch {
          // ignore
        }
      }
    }

    return { profile, wedding };
  }, []);

  // Restore local session helper
  const restoreLocalSession = useCallback(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem('wedcraft_active_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.user?.id) {
          let wedding = parsed.wedding || null;
          try {
            const rawWeddings = localStorage.getItem('wedcraft_tbl_weddings');
            const weddings = rawWeddings ? JSON.parse(rawWeddings) : [];
            const latest = weddings.find((w: any) => w.user_id === parsed.user.id);
            if (latest) wedding = latest;
          } catch {
            // ignore
          }

          if (wedding) {
            let mod = false;
            if (wedding.venue === 'Grand Heritage Venue' || wedding.venue === 'Grand Heritage Palace Resort') {
              wedding.venue = '';
              mod = true;
            }
            if (wedding.city === 'Jaipur') {
              wedding.city = '';
              mod = true;
            }
            if (wedding.total_budget === 2000000 || wedding.total_budget === 2500000) {
              wedding.total_budget = 0;
              mod = true;
            }
            if (mod) {
              try {
                parsed.wedding = wedding;
                localStorage.setItem('wedcraft_active_session', JSON.stringify(parsed));
              } catch {
                // ignore
              }
            }
          }

          setState({
            user: parsed.user,
            profile: parsed.profile || null,
            wedding,
            session: null,
            loading: false,
            isLocalMode: true,
          });
          return true;
        }
      }
    } catch {
      // ignore
    }
    return false;
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    // Purge any stale mock data on app initialization
    purgeMockData();
    rawSupabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isSubscribed) return;
      if (session?.user) {
        const { profile, wedding } = await fetchUserData(session.user.id);
        setState({
          user: session.user,
          profile,
          wedding,
          session,
          loading: false,
          isLocalMode: false,
        });
      } else {
        // Fallback to local session if no cloud session
        const restored = restoreLocalSession();
        if (!restored) {
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    }).catch(() => {
      // Network failure / host unreachable
      if (!isSubscribed) return;
      const restored = restoreLocalSession();
      if (!restored) {
        setState(prev => ({ ...prev, loading: false, isLocalMode: true }));
      }
    });

    // Listen for cloud auth changes
    const { data: { subscription } } = rawSupabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isSubscribed) return;
        if (event === 'SIGNED_IN' && session?.user) {
          const { profile, wedding } = await fetchUserData(session.user.id);
          setState({
            user: session.user,
            profile,
            wedding,
            session,
            loading: false,
            isLocalMode: false,
          });
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            wedding: null,
            session: null,
            loading: false,
            isLocalMode: false,
          });
        }
      }
    );

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [fetchUserData, restoreLocalSession]);

  const signUp = async (
    email: string,
    password: string,
    name: string,
    partner1: string,
    partner2: string,
    weddingDate: string
  ): Promise<{ error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // Extract any pending budget generated from the Live Estimator
    let initialBudget = 0;
    let initialItems: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        const savedB = localStorage.getItem('wedcraft_pending_budget');
        if (savedB) initialBudget = Number(savedB) || 0;
        const savedItems = localStorage.getItem('wedcraft_pending_breakdown');
        if (savedItems) initialItems = JSON.parse(savedItems) || [];
        localStorage.removeItem('wedcraft_pending_budget');
        localStorage.removeItem('wedcraft_pending_breakdown');
      } catch {
        // ignore
      }
    }

    // 1. Try real Supabase auth if live project configured
    if (isLiveSupabaseConfigured()) {
      try {
        const { data, error } = await rawSupabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { name } },
        });

        // If Supabase signed up successfully
        if (!error && data.user) {
          const userId = data.user.id;
          await supabase.from('profiles').upsert({
            id: userId,
            name,
            email: cleanEmail,
          }, { onConflict: 'id' });

          const { data: createdWed } = await supabase.from('weddings').insert({
            user_id: userId,
            partner1_name: partner1,
            partner2_name: partner2,
            wedding_date: weddingDate,
            venue: '',
            city: '',
            total_budget: initialBudget,
          }).select().single();

          if (createdWed && initialItems.length > 0) {
            for (const it of initialItems) {
              await supabase.from('budget_items').insert({
                wedding_id: createdWed.id,
                category: it.category,
                vendor_name: it.vendor_name || '',
                allocated: it.allocated || 0,
                spent: 0,
                paid: false,
                notes: it.notes || '',
              });
            }
          }

          return {};
        }

        if (error && !isNetworkOrFetchError(error)) {
          if (error.message.includes('already registered')) {
            return { error: 'This email is already registered. Please sign in instead.' };
          }
          // Return other real server-side errors
          return { error: error.message };
        }
      } catch (netErr) {
        console.warn('Supabase auth network unreachable, falling back to local mode:', netErr);
      }
    }

    // 2. Local Mode Account Creation
    try {
      const rawUsers = localStorage.getItem('wedcraft_users');
      const users: any[] = rawUsers ? JSON.parse(rawUsers) : [];

      // Check if user with email already exists locally
      if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return { error: 'An account with this email already exists. Please sign in.' };
      }

      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const weddingId = `wed_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const nowIso = new Date().toISOString();

      const newUser = {
        id: userId,
        email: cleanEmail,
        password,
        name,
        created_at: nowIso,
      };

      const profile: Profile = {
        id: userId,
        name,
        email: cleanEmail,
        avatar_url: null,
        created_at: nowIso,
      };

      const wedding: Wedding = {
        id: weddingId,
        user_id: userId,
        partner1_name: partner1,
        partner2_name: partner2,
        wedding_date: weddingDate,
        venue: '',
        city: '',
        total_budget: initialBudget,
        created_at: nowIso,
      };

      if (initialItems.length > 0) {
        const budgetItems = initialItems.map((item: any) => ({
          id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          wedding_id: weddingId,
          category: item.category,
          vendor_name: item.vendor_name || '',
          allocated: item.allocated || 0,
          spent: 0,
          paid: false,
          notes: item.notes || '',
          created_at: nowIso,
        }));
        localStorage.setItem('wedcraft_tbl_budget_items', JSON.stringify(budgetItems));
      }

      // Save user
      users.push(newUser);
      localStorage.setItem('wedcraft_users', JSON.stringify(users));

      // Save profile
      const rawProfiles = localStorage.getItem('wedcraft_tbl_profiles');
      const profiles: any[] = rawProfiles ? JSON.parse(rawProfiles) : [];
      profiles.push(profile);
      localStorage.setItem('wedcraft_tbl_profiles', JSON.stringify(profiles));

      // Save wedding
      const rawWeddings = localStorage.getItem('wedcraft_tbl_weddings');
      const weddings: any[] = rawWeddings ? JSON.parse(rawWeddings) : [];
      weddings.push(wedding);
      localStorage.setItem('wedcraft_tbl_weddings', JSON.stringify(weddings));

      const authUser: User = {
        id: userId,
        app_metadata: {},
        user_metadata: { name },
        aud: 'authenticated',
        created_at: nowIso,
        email: cleanEmail,
      } as User;

      // Save active session
      localStorage.setItem(
        'wedcraft_active_session',
        JSON.stringify({ user: authUser, profile, wedding })
      );

      setState({
        user: authUser,
        profile,
        wedding,
        session: null,
        loading: false,
        isLocalMode: true,
      });

      return {};
    } catch (localErr) {
      console.error('Local signup error:', localErr);
      return { error: 'Unable to save account locally. Please ensure localStorage is enabled.' };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try real Supabase auth if live project configured
    if (isLiveSupabaseConfigured()) {
      try {
        const { data, error } = await rawSupabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data.user) {
          const { profile, wedding } = await fetchUserData(data.user.id);
          setState({
            user: data.user,
            profile,
            wedding,
            session: data.session,
            loading: false,
            isLocalMode: false,
          });
          return {};
        }

        if (error && !isNetworkOrFetchError(error)) {
          return { error: error.message };
        }
      } catch (err) {
        console.warn('Supabase signin unreachable, falling back to local mode:', err);
      }
    }

    // 2. Demo User special handler
    if (cleanEmail === DEMO_EMAIL && password === DEMO_PASS) {
      const weddingId = `wed_demo`;
      const nowIso = new Date().toISOString();
      const futureDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const demoUser: User = {
        id: 'usr_demo',
        app_metadata: {},
        user_metadata: { name: 'Demo Couple' },
        aud: 'authenticated',
        created_at: nowIso,
        email: DEMO_EMAIL,
      } as User;

      const demoProfile: Profile = {
        id: 'usr_demo',
        name: 'Demo Couple',
        email: DEMO_EMAIL,
        avatar_url: null,
        created_at: nowIso,
      };

      const demoWedding: Wedding = {
        id: weddingId,
        user_id: 'usr_demo',
        partner1_name: 'Rahul',
        partner2_name: 'Priya',
        wedding_date: futureDate,
        venue: '',
        city: '',
        total_budget: 0,
        created_at: nowIso,
      };

      localStorage.setItem(
        'wedcraft_active_session',
        JSON.stringify({ user: demoUser, profile: demoProfile, wedding: demoWedding })
      );

      setState({
        user: demoUser,
        profile: demoProfile,
        wedding: demoWedding,
        session: null,
        loading: false,
        isLocalMode: true,
      });

      return {};
    }

    // 3. Check registered local users or auto-provision for new user login
    try {
      const rawUsers = localStorage.getItem('wedcraft_users');
      const users: any[] = rawUsers ? JSON.parse(rawUsers) : [];
      let found = users.find((u) => u.email.toLowerCase() === cleanEmail);

      const nowIso = new Date().toISOString();

      if (!found) {
        // If it's a new user, seamlessly create their account and start with fresh dynamic data!
        const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const weddingId = `wed_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const futureDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Format friendly partner name from email prefix (e.g. "priya.sharma" -> "Priya")
        const emailLocalPart = cleanEmail.split('@')[0];
        const cleanedName = emailLocalPart.replace(/[._-]+/g, ' ').replace(/\d+/g, '').trim();
        const derivedName = cleanedName
          ? cleanedName.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
          : 'Partner 1';

        const newUser = {
          id: userId,
          email: cleanEmail,
          password,
          name: derivedName,
          created_at: nowIso,
        };

        const newProfile: Profile = {
          id: userId,
          name: derivedName,
          email: cleanEmail,
          avatar_url: null,
          created_at: nowIso,
        };

        const newWedding: Wedding = {
          id: weddingId,
          user_id: userId,
          partner1_name: derivedName.split(' ')[0] || 'Partner 1',
          partner2_name: 'Partner 2',
          wedding_date: futureDate,
          venue: '',
          city: '',
          total_budget: 0,
          created_at: nowIso,
        };

        // Save newly provisioned user, profile, and wedding
        users.push(newUser);
        localStorage.setItem('wedcraft_users', JSON.stringify(users));

        const rawProfiles = localStorage.getItem('wedcraft_tbl_profiles');
        const profiles: any[] = rawProfiles ? JSON.parse(rawProfiles) : [];
        profiles.push(newProfile);
        localStorage.setItem('wedcraft_tbl_profiles', JSON.stringify(profiles));

        const rawWeddings = localStorage.getItem('wedcraft_tbl_weddings');
        const weddings: any[] = rawWeddings ? JSON.parse(rawWeddings) : [];
        weddings.push(newWedding);
        localStorage.setItem('wedcraft_tbl_weddings', JSON.stringify(weddings));

        found = newUser;
      } else {
        if (found.password !== password) {
          return { error: 'Invalid password. Please check and try again.' };
        }
      }

      // Load profile and wedding
      const rawProfiles = localStorage.getItem('wedcraft_tbl_profiles');
      const profiles: any[] = rawProfiles ? JSON.parse(rawProfiles) : [];
      const profile = profiles.find((p) => p.id === found.id) || {
        id: found.id,
        name: found.name,
        email: found.email,
        created_at: found.created_at,
      };

      const rawWeddings = localStorage.getItem('wedcraft_tbl_weddings');
      const weddings: any[] = rawWeddings ? JSON.parse(rawWeddings) : [];
      let wedding = weddings.find((w) => w.user_id === found.id) || null;

      if (!wedding) {
        const weddingId = `wed_${found.id}`;
        wedding = {
          id: weddingId,
          user_id: found.id,
          partner1_name: profile.name ? profile.name.split(' ')[0] : 'Partner 1',
          partner2_name: 'Partner 2',
          wedding_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          venue: '',
          city: '',
          total_budget: 0,
          created_at: new Date().toISOString(),
        };
        weddings.push(wedding);
        localStorage.setItem('wedcraft_tbl_weddings', JSON.stringify(weddings));
      }

      const authUser: User = {
        id: found.id,
        app_metadata: {},
        user_metadata: { name: found.name },
        aud: 'authenticated',
        created_at: found.created_at,
        email: found.email,
      } as User;

      localStorage.setItem(
        'wedcraft_active_session',
        JSON.stringify({ user: authUser, profile, wedding })
      );

      setState({
        user: authUser,
        profile,
        wedding,
        session: null,
        loading: false,
        isLocalMode: true,
      });

      return {};
    } catch {
      return { error: 'Failed to access local account store. Please try again.' };
    }
  };

  const signOut = async () => {
    try {
      await rawSupabase.auth.signOut();
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wedcraft_active_session');
    }
    setState({
      user: null,
      profile: null,
      wedding: null,
      session: null,
      loading: false,
      isLocalMode: false,
    });
  };

  const refreshWedding = async () => {
    if (!state.user) return;
    const { wedding } = await fetchUserData(state.user.id);
    if (wedding) {
      setState(prev => ({ ...prev, wedding }));
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('wedcraft_active_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.wedding = wedding;
          localStorage.setItem('wedcraft_active_session', JSON.stringify(parsed));
        }
      }
    }
  };

  const resetToFresh = async () => {
    if (!state.wedding?.id) return;
    await resetWeddingToFresh(state.wedding.id);
    await refreshWedding();
  };

  return (
    <AuthContext.Provider
      value={{ ...state, signUp, signIn, signOut, refreshWedding, resetToFresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
