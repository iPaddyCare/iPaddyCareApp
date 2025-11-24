import React, { createContext, useState, useContext, useEffect } from 'react';
import auth from '@react-native-firebase/auth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // React Native Firebase auto-initializes from config files
    // Set up auth state listener - simple and clean
    let unsubscribe = null;
    
    try {
      // Set up auth state listener
      // React Native Firebase will auto-initialize from google-services.json/GoogleService-Info.plist
      unsubscribe = auth().onAuthStateChanged(
        (user) => {
          setUser(user);
          setIsAuthenticated(!!user);
          setLoading(false);
        },
        (error) => {
          console.error('Firebase auth initialization error:', error.message);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Firebase setup error:', error.message);
      setLoading(false);
    }
    
    // Return cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      setUser(userCredential.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message?.includes('DEFAULT') || error.message?.includes('initialized')) {
        errorMessage = 'Firebase is not configured. Please check Firebase setup.';
      }
      
      console.error('Sign in error:', error.code || error.message);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, displayName) => {
    try {
      setLoading(true);
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // Update user profile with display name (non-blocking)
      if (displayName && userCredential.user) {
        try {
          await userCredential.user.updateProfile({
            displayName: displayName,
          });
        } catch (profileError) {
          // Don't fail the signup if profile update fails
          console.warn('Profile update failed:', profileError);
        }
      }
      
      setUser(userCredential.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      
      // Check for specific error codes
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password authentication is not enabled. Please enable it in Firebase Console.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message?.includes('DEFAULT') || error.message?.includes('initialized')) {
        errorMessage = 'Firebase is not configured. Please check Firebase setup.';
      } else if (error.code) {
        errorMessage = `Registration failed: ${error.code}`;
      }
      
      console.error('Sign up error:', error.code || error.message);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await auth().signOut();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to sign out. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      await auth().sendPasswordResetEmail(email);
      return { success: true, message: 'Password reset email sent!' };
    } catch (error) {
      let errorMessage = 'Failed to send reset email.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      return { success: false, error: errorMessage };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

