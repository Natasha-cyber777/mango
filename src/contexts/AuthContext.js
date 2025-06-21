import React, { createContext, useState, useEffect, useContext } from "react";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Import your database instance
import LoadingPage from '../components/LoadingPage';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null); // More generic state for user profile data
    const [userIncomeProfile, setUserIncomeProfile] = useState(null); // Specific state for income data (for backward compatibility or specific usage)
    const auth = getAuth(); // Get the auth instance here

    useEffect(() => {
        // Set the persistence before listening for auth state changes
        setPersistence(auth, browserLocalPersistence)
            .then(() => {
                const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
                    setUser(authUser);
                    setUserProfile(null);
                    setUserIncomeProfile(null); // Reset both profile states on auth change

                    if (authUser) {
                        const userDocRef = doc(db, 'users', authUser.uid);
                        try {
                            const docSnap = await getDoc(userDocRef);
                            if (docSnap.exists()) {
                                const userData = docSnap.data();
                                setUserProfile(userData); // Store all user data in userProfile
                                setUserIncomeProfile(userData); // Also store in userIncomeProfile for now
                            } else {
                                console.log("User document not found, consider creating one.");
                            }
                        } catch (error) {
                            console.error("Error fetching user data:", error);
                        }
                    }
                    setLoading(false);
                });
                return unsubscribe;
            })
            .catch((error) => {
                console.error("Error setting persistence or with auth state:", error);
                setLoading(false);
            });

        return () => {};
    }, [auth]); // Include auth in the dependency array

    async function updateUserProfile(profileData) {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            try {
                await updateDoc(userDocRef, profileData);
                setUserProfile({ ...userProfile, ...profileData });
                setUserIncomeProfile({ ...userIncomeProfile, ...profileData }); // Keep income profile updated as well
                console.log("User profile updated successfully!");
            } catch (error) {
                console.error("Error updating profile:", error);
                throw error;
            }
        } else {
            console.error("No user logged in to update profile.");
            throw new Error("No user logged in.");
        }
    }

    async function updateUserIncome(incomeData) {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            try {
                await updateDoc(userDocRef, incomeData);
                setUserIncomeProfile({ ...userIncomeProfile, ...incomeData });
                setUserProfile({ ...userProfile, ...incomeData }); // Keep generic profile updated as well
                console.log("Income profile updated successfully!");
            } catch (error) {
                console.error("Error updating income:", error);
                throw error;
            }
        } else {
            console.error("No user logged in to update income.");
            throw new Error("No user logged in.");
        }
    }

    const value = {
        user,
        userProfile,
        userIncomeProfile, // Expose income data specifically
        updateUserProfile,
        updateUserIncome, // Expose the specific income update function
        auth // Include the auth object in the context value
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
            {loading && <LoadingPage />}
        </AuthContext.Provider>
    );
};