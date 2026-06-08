import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return const FirebaseOptions(
        apiKey: "AIzaSyC587I5tZQXGCDawJDJoAumLOnkzV_OVug",
        authDomain: "truckproject-8e5e8.firebaseapp.com",
        projectId: "truckproject-8e5e8",
        storageBucket: "truckproject-8e5e8.firebasestorage.app",
        messagingSenderId: "4890750983",
        appId: "1:4890750983:web:b0ca260a5987f28a0b3aa2",
        measurementId: "G-4LTKQZDB1V",
      );
    }

    // Fallback for other platforms (mobile app)
    return const FirebaseOptions(
      apiKey: "AIzaSyC587I5tZQXGCDawJDJoAumLOnkzV_OVug",
      authDomain: "truckproject-8e5e8.firebaseapp.com",
      projectId: "truckproject-8e5e8",
      storageBucket: "truckproject-8e5e8.firebasestorage.app",
      messagingSenderId: "4890750983",
      appId: "1:4890750983:web:b0ca260a5987f28a0b3aa2",
      measurementId: "G-4LTKQZDB1V",
    );
  }
}
