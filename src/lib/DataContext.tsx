import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Family, Category, Event, Lottery } from '../types';
import { db, auth, signInWithGoogle, logOut, signInWithEmail, signUpWithEmail } from './firebase';
import { collection, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface DataContextType {
  users: User[];
  families: Family[];
  categories: Category[];
  events: Event[];
  lotteries: Lottery[];
  currentUser: User | null;
  isAuthReady: boolean;
  signIn: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<any>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<any>;
  signOut: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch current user data from Firestore by UID first
        let userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists() && user.email) {
          // Try to find by email if admin created them
          const { query, where, getDocs } = await import('firebase/firestore');
          const q = query(collection(db, 'users'), where('email', '==', user.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            userDoc = querySnapshot.docs[0];
          }
        }

        if (userDoc.exists()) {
          setCurrentUser({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
          // Create the user in the database
          const isDefaultAdmin = user.email === 'davidsolanosan@gmail.com';
          const newUser: Omit<User, 'id'> = {
            name: user.displayName || 'Usuario',
            email: user.email || '',
            role: isDefaultAdmin ? 'admin' : 'fallero',
            categoryId: '',
            isAdult: true,
            isFamilyAdmin: isDefaultAdmin // Make default admin a family admin too
          };
          
          try {
            const { setDoc } = await import('firebase/firestore');
            await setDoc(doc(db, 'users', user.uid), newUser);
            setCurrentUser({ id: user.uid, ...newUser });
          } catch (error) {
            console.error("Error creating initial user:", error);
            // Fallback to local state if creation fails (e.g., due to rules)
            setCurrentUser({ id: user.uid, ...newUser });
          }
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !currentUser) return;

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    }, (error) => console.error("Error fetching users:", error));

    const unsubFamilies = onSnapshot(collection(db, 'families'), (snapshot) => {
      setFamilies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Family)));
    }, (error) => console.error("Error fetching families:", error));

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (error) => console.error("Error fetching categories:", error));

    const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
    }, (error) => console.error("Error fetching events:", error));

    const unsubLotteries = onSnapshot(collection(db, 'lotteries'), (snapshot) => {
      setLotteries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lottery)));
    }, (error) => console.error("Error fetching lotteries:", error));

    return () => {
      unsubUsers();
      unsubFamilies();
      unsubCategories();
      unsubEvents();
      unsubLotteries();
    };
  }, [isAuthReady, currentUser]);

  return (
    <DataContext.Provider value={{
      users, families, categories, events, lotteries,
      currentUser, isAuthReady,
      signIn: signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut: logOut
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
