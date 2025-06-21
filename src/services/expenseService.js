import { auth, db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Add Expense Group for the Authenticated User
export const addExpenseGroup = async (groupName) => {
  const user = auth.currentUser; // Get current user
  if (!user) {
    console.error("User is not logged in");
    return;
  }

  try {
    // Reference to the user's expense groups subcollection
    const userExpenseGroupsRef = collection(db, "users", user.uid, "expense_groups");

    // Add a new expense group
    const docRef = await addDoc(userExpenseGroupsRef, {
      group_name: groupName,
      created_at: new Date(),
    });

    console.log("Expense Group Created:", docRef.id);
  } catch (error) {
    console.error("Error adding expense group:", error);
  }
};

// Fetch Expense Groups for the Logged-in User
export const getExpenseGroups = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  const userExpenseGroupsRef = collection(db, "users", user.uid, "expense_groups");
  const querySnapshot = await getDocs(userExpenseGroupsRef);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
