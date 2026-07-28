import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show kIsWeb;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return const FirebaseOptions(
        apiKey: "AIzaSyAp9_qurmvthIIxy4_Hi_VoKRt5snfkZ8k",
        authDomain: "truckproject-8e5e8.firebaseapp.com",
        projectId: "truckproject-8e5e8",
        storageBucket: "truckproject-8e5e8.firebasestorage.app",
        messagingSenderId: "144627799852",
        appId: "1:144627799852:web:88e567ca85add489c27e89",
        measurementId: "G-PE2CSPTH9D",
      );
    }

    // Fallback for other platforms (mobile app)
    return const FirebaseOptions(
      apiKey: "AIzaSyAp9_qurmvthIIxy4_Hi_VoKRt5snfkZ8k",
      authDomain: "truckproject-8e5e8.firebaseapp.com",
      projectId: "truckproject-8e5e8",
      storageBucket: "truckproject-8e5e8.firebasestorage.app",
      messagingSenderId: "144627799852",
      appId: "1:144627799852:web:88e567ca85add489c27e89",
      measurementId: "G-PE2CSPTH9D",
    );
  }
}
