import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:local_auth/local_auth.dart';
import 'dashboard_screen.dart'; // Placeholder for dashboard route

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _nrpController = TextEditingController();
  final _passController = TextEditingController();
  final LocalAuthentication _auth = LocalAuthentication();
  bool _isLoading = false;

  @override
  void dispose() {
    _nrpController.dispose();
    _passController.dispose();
    super.dispose();
  }

  Future<void> _handleBiometric() async {
    try {
      final bool canAuthenticate = await _auth.canCheckBiometrics || await _auth.isDeviceSupported();
      if (!canAuthenticate) {
        _showError('Biometric tidak didukung di perangkat ini');
        return;
      }

      final bool didAuthenticate = await _auth.authenticate(
        localizedReason: 'Gunakan sidik jari atau Face ID untuk masuk secara taktis',
        options: const AuthenticationOptions(
          biometricOnly: true,
          stickyAuth: true,
        ),
      );

      if (didAuthenticate) {
        _proceedToDashboard();
      }
    } catch (e) {
      _showError('Autentikasi Biometrik Gagal');
    }
  }

  void _handleLogin() {
    if (_nrpController.text.isEmpty || _passController.text.isEmpty) {
      _showError('NRP dan Password harus diisi');
      return;
    }
    
    setState(() => _isLoading = true);
    
    // Simulating API Call latency
    Future.delayed(const Duration(seconds: 1), () {
      setState(() => _isLoading = false);
      if (_nrpController.text.isNotEmpty) {
        // Here we would perform JWT validation via Dio
        _proceedToDashboard();
      } else {
        _showError('Kredensial Tidak Valid');
      }
    });
  }

  void _proceedToDashboard() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const DashboardScreen()),
    );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Theme.of(context).colorScheme.error,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 48.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              // LOGO
              Center(
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    shape: BoxShape.circle,
                    border: Border.all(color: Theme.of(context).primaryColor, width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: Theme.of(context).primaryColor.withOpacity(0.3),
                        blurRadius: 20,
                        spreadRadius: 2,
                      )
                    ]
                  ),
                  child: const Center(
                    child: Text(
                      '🛡️',
                      style: TextStyle(fontSize: 40),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'SENTINEL',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 8,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Biro Operasi Polda NTT',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: Colors.white60,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 60),
              
              // FORM
              TextField(
                controller: _nrpController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: 'NRP',
                  labelStyle: const TextStyle(color: Colors.white60),
                  prefixIcon: const Icon(Icons.badge, color: Colors.white54),
                  filled: true,
                  fillColor: Theme.of(context).colorScheme.surface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Theme.of(context).primaryColor),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'Password',
                  labelStyle: const TextStyle(color: Colors.white60),
                  prefixIcon: const Icon(Icons.lock, color: Colors.white54),
                  filled: true,
                  fillColor: Theme.of(context).colorScheme.surface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Theme.of(context).primaryColor),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              
              // BUTTONS
              ElevatedButton(
                onPressed: _isLoading ? null : _handleLogin,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.secondary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: _isLoading 
                  ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text('MASUK (TACTICAL)', style: GoogleFonts.inter(fontWeight: FontWeight.bold, letterSpacing: 1)),
              ),
              const SizedBox(height: 16),
              
              // BIOMETRIC
              OutlinedButton.icon(
                onPressed: _handleBiometric,
                icon: const Icon(Icons.fingerprint),
                label: const Text('Login Biometrik'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Theme.of(context).primaryColor,
                  side: BorderSide(color: Theme.of(context).primaryColor.withOpacity(0.5)),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
