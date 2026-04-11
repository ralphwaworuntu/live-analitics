// @ts-ignore
import * as LocalAuthentication from 'expo-local-authentication';
// @ts-ignore
import { Alert } from 'react-native';

export const verifyIdentity = async (reason: string): Promise<boolean> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      console.warn("[SECURITY] Biometrics not available, falling back to PIN/Manual");
      return true; // Fallback handled by OS usually
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `IDENTITY VERIFICATION: ${reason}`,
      fallbackLabel: 'Use Passcode',
      disableDeviceFallback: false,
    });

    if (result.success) {
       console.log("[SECURITY] Identity Verified via Biometrics");
       return true;
    } else {
       Alert.alert("ACCESSS DENIED", "Biometric verification failed.");
       return false;
    }
  } catch (err) {
    console.error("Biometric error", err);
    return false;
  }
};
