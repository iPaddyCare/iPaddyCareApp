import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

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
      // Configure Google Sign-In
      // iOS needs both clientID (iOS client) and webClientId (Web client)
      // Get iOS clientID from: GoogleService-Info.plist → CLIENT_ID
      // Get webClientId from: Firebase Console → Authentication → Sign-in method → Google → Web client ID
      if (Platform.OS === 'ios') {
        // iOS requires both clientId and webClientId
        const iosConfig = {
          clientId: '1005945714864-snl98chrm7ub9jsorbm528bjagqufalm.apps.googleusercontent.com', // iOS Client ID
          webClientId: '1005945714864-lpdgrdnu67jb2o07qu4jv5crdm2l1prk.apps.googleusercontent.com', // Web Client ID for Firebase
        };
        console.log('Configuring Google Sign-In for iOS:', iosConfig);
        GoogleSignin.configure(iosConfig);
      } else {
        // Android only needs webClientId
        const androidConfig = {
          webClientId: '1005945714864-lpdgrdnu67jb2o07qu4jv5crdm2l1prk.apps.googleusercontent.com',
        };
        console.log('Configuring Google Sign-In for Android:', androidConfig);
        GoogleSignin.configure(androidConfig);
      }
      
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

  // Google Sign-In
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // Check if your device supports Google Play (Android only)
      if (Platform.OS === 'android') {
        try {
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        } catch (playServicesError) {
          console.error('Google Play Services error:', playServicesError);
          return { 
            success: false, 
            error: 'Google Play Services is required. Please install or update Google Play Services.' 
          };
        }
      }
      
      // Get the user's ID token and profile information
      let idToken;
      let userPhotoURL = null;
      let userDisplayName = null;
      try {
        const signInResult = await GoogleSignin.signIn();
        
        // Log the sign-in result to debug
        console.log('Google Sign-In result:', {
          hasIdToken: !!signInResult?.idToken,
          hasData: !!signInResult?.data,
          keys: signInResult ? Object.keys(signInResult) : 'no result',
          result: signInResult
        });
        
        // Extract user profile information (photo and name)
        const userInfo = signInResult?.user || signInResult?.data?.user || signInResult?.data;
        if (userInfo) {
          userPhotoURL = userInfo.photo || userInfo.photoURL || userInfo.picture;
          userDisplayName = userInfo.name || userInfo.displayName || userInfo.givenName;
          console.log('User profile info:', { 
            hasPhoto: !!userPhotoURL, 
            hasName: !!userDisplayName,
            photoURL: userPhotoURL 
          });
        }
        
        // Try different ways to get the idToken
        idToken = signInResult?.idToken || 
                 signInResult?.data?.idToken || 
                 signInResult?.data?.id_token ||
                 signInResult?.id_token;
        
        // If still no idToken, try to get it separately
        if (!idToken) {
          try {
            const tokens = await GoogleSignin.getTokens();
            idToken = tokens?.idToken || tokens?.id_token;
            console.log('Got idToken from getTokens():', !!idToken);
          } catch (tokenError) {
            console.error('Error getting tokens:', tokenError);
          }
        }
        
        if (!idToken) {
          console.error('No idToken found in sign-in result:', signInResult);
          return { 
            success: false, 
            error: 'Google Sign-In failed: No ID token received. Please check:\n1. webClientId is correct in AuthContext.js\n2. OAuth consent screen is configured in Google Cloud Console\n3. SHA-1 fingerprint is added to Firebase Console' 
          };
        }
      } catch (signInError) {
        // Handle Google Sign-In specific errors
        const signInErrorMsg = signInError?.message || String(signInError) || 'Unknown error';
        
        if (signInErrorMsg.includes('cancelled') || signInErrorMsg.includes('canceled') || 
            signInError?.code === '12500') {
          return { success: false, error: 'Sign-in was cancelled.', cancelled: true };
        }
        
        // Check for DEVELOPER_ERROR (code 10)
        if (signInError?.code === 10 || signInError?.code === '10' || 
            signInErrorMsg.includes('DEVELOPER_ERROR') || signInErrorMsg.includes('code 10')) {
          return { 
            success: false, 
            error: 'Google Sign-In configuration error. Please check:\n1. SHA-1 fingerprint is added in Firebase Console (Android)\n2. Google Sign-In is enabled in Firebase Console\n3. webClientId is correct'
          };
        }
        
        return { 
          success: false, 
          error: `Google Sign-In failed: ${signInErrorMsg}` 
        };
      }
      
      // Create a Google credential with the token
      let googleCredential;
      try {
        googleCredential = auth.GoogleAuthProvider.credential(idToken);
      } catch (credentialError) {
        console.error('Credential creation error:', credentialError);
        return { 
          success: false, 
          error: 'Failed to create Google credential. Please try again.' 
        };
      }
      
      // Sign-in the user with the credential
      let userCredential;
      try {
        userCredential = await auth().signInWithCredential(googleCredential);
      } catch (firebaseError) {
        const firebaseErrorMsg = firebaseError?.message || String(firebaseError) || 'Unknown error';
        const firebaseErrorCode = firebaseError?.code;
        
        if (firebaseErrorCode === 'auth/account-exists-with-different-credential') {
          return { success: false, error: 'An account already exists with this email.' };
        } else if (firebaseErrorCode === 'auth/invalid-credential') {
          return { success: false, error: 'Invalid credential. Please try again.' };
        } else if (firebaseErrorCode === 'auth/network-request-failed') {
          return { success: false, error: 'Network error. Please check your connection.' };
        }
        
        return { 
          success: false, 
          error: `Firebase authentication failed: ${firebaseErrorMsg}` 
        };
      }
      
      // Update user profile with photo URL and display name if available
      if (userCredential.user) {
        const updateData = {};
        
        // Update photo URL if we have it and it's different from current
        if (userPhotoURL && userCredential.user.photoURL !== userPhotoURL) {
          updateData.photoURL = userPhotoURL;
        }
        
        // Update display name if we have it and it's different from current
        if (userDisplayName && userCredential.user.displayName !== userDisplayName) {
          updateData.displayName = userDisplayName;
        }
        
        // Update profile if we have any changes
        if (Object.keys(updateData).length > 0) {
          try {
            await userCredential.user.updateProfile(updateData);
            // Reload user to get updated profile
            await userCredential.user.reload();
            console.log('User profile updated with:', updateData);
          } catch (profileError) {
            // Don't fail sign-in if profile update fails
            console.warn('Profile update failed (non-critical):', profileError);
          }
        }
      }
      
      setUser(userCredential.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      // Safely extract error information - handle different error structures
      let errorCode = null;
      let errorMessageText = 'Unknown error';
      
      try {
        // Try to get error code from various possible locations
        errorCode = error?.code || error?.nativeErrorCode || error?.errorCode || 
                   (error?.nativeError?.code) || (error?.nativeError?.errorCode);
        
        // Try to get error message from various possible locations
        errorMessageText = error?.message || error?.nativeErrorMessage || 
                         error?.errorMessage || error?.toString() || 
                         (error?.nativeError?.message) || String(error);
      } catch (e) {
        // If accessing error properties fails, just use string representation
        errorMessageText = String(error);
        console.error('Error accessing error properties:', e);
      }
      
      // Log the full error structure for debugging (safely)
      try {
        const safeErrorInfo = {
          errorCode,
          errorMessageText,
          errorType: typeof error,
          errorString: String(error),
          errorKeys: error && typeof error === 'object' ? Object.keys(error) : 'no error object'
        };
        console.error('Google sign-in error details:', safeErrorInfo);
      } catch (logError) {
        console.error('Error logging error details:', logError);
        console.error('Google sign-in failed with error:', String(error));
      }
      
      // Handle specific error codes (safely check errorMessageText)
      const errorMsgStr = String(errorMessageText || '');
      
      if (errorCode === 'auth/account-exists-with-different-credential' || 
          errorMsgStr.includes('account-exists-with-different-credential')) {
        errorMessage = 'An account already exists with this email.';
      } else if (errorCode === 'auth/invalid-credential' || 
                 errorMsgStr.includes('invalid-credential')) {
        errorMessage = 'Invalid credential. Please try again.';
      } else if (errorCode === 'auth/network-request-failed' || 
                 errorMsgStr.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (errorCode === 'sign_in_cancelled' || errorCode === '12500' || 
                 errorMsgStr.includes('cancelled') || errorMsgStr.includes('canceled')) {
        errorMessage = 'Sign-in was cancelled.';
        return { success: false, error: errorMessage, cancelled: true };
      }
      
      // Handle error code 10 (DEVELOPER_ERROR) or "Cannot read property 'code'" errors
      if (errorCode === 10 || errorCode === '10' || errorCode === 'DEVELOPER_ERROR' ||
          errorMsgStr.includes('DEVELOPER_ERROR') || errorMsgStr.includes('code 10') ||
          errorMsgStr.includes("Cannot read property 'code'")) {
        errorMessage = 'Google Sign-In configuration error. Please check:\n1. SHA-1 fingerprint is added in Firebase Console (Android)\n2. Google Sign-In is enabled in Firebase Console\n3. webClientId is correct\n4. App has been rebuilt after adding SHA-1';
        console.error('Google sign-in error (configuration issue):', errorMsgStr);
        console.error('This usually means: Missing SHA-1 fingerprint or Google Sign-In not enabled');
      } else {
        // For unknown errors, include the error message if available
        if (errorMsgStr && errorMsgStr !== 'Unknown error') {
          errorMessage = `Google sign-in failed: ${errorMsgStr}`;
        }
        console.error('Google sign-in error:', errorCode || 'no code', errorMsgStr);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
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
        signInWithGoogle,
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

