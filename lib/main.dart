import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:google_fonts/google_fonts.dart';

import 'firebase_options.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const GuardianApp());
}

class GuardianApp extends StatelessWidget {
  const GuardianApp({super.key});

  @override
  Widget build(BuildContext context) {
    // A premium dark theme tailored for the Guardian dashboard
    final baseTheme = ThemeData.dark();

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Shrimati Setu Guardian',
      theme: baseTheme.copyWith(
        colorScheme: baseTheme.colorScheme.copyWith(
          primary: const Color(0xFFFF5F8A),
          secondary: const Color(0xFF9D65FF), // adding a purple secondary
          surface: const Color(0xFF1A102D),   // improved surface color
        ),
        // Switch to Outfit or Inter, Outfit gives a more modern/tech/premium feel.
        textTheme: GoogleFonts.outfitTextTheme(baseTheme.textTheme),
        scaffoldBackgroundColor: const Color(0xFF030014), // darker, deep space black
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
        ),
      ),
      initialRoute: '/login',
      routes: {
        '/login': (_) => const GuardianLoginScreen(),
        '/dashboard': (_) => const GuardianDashboardScreen(),
      },
    );
  }
}
