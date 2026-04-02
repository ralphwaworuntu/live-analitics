import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const SentinelMobileApp());
}

class SentinelMobileApp extends StatelessWidget {
  const SentinelMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SENTINEL Field App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF040A12), // Dark Navy POLRI
        primaryColor: const Color(0xFFD4AF37), // Gold Accent
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFD4AF37),
          secondary: Color(0xFF1E90FF),
          surface: Color(0xFF0B1727), // Surface
          error: Color(0xFFFF4D6D),
        ),
        textTheme: GoogleFonts.interTextTheme(Theme.of(context).textTheme).apply(
          bodyColor: Colors.white,
          displayColor: Colors.white,
        ),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}
