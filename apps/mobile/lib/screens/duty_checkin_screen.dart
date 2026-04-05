import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dashboard_screen.dart';

class DutyCheckInScreen extends StatefulWidget {
  const DutyCheckInScreen({super.key});

  @override
  State<DutyCheckInScreen> createState() => _DutyCheckInScreenState();
}

class _DutyCheckInScreenState extends State<DutyCheckInScreen> {
  String? _personnelId;
  String? _weaponId;
  String? _vehicleId;
  
  int _step = 0; // 0: Personnel, 1: Weapon, 2: Vehicle

  void _onDetect(BarcodeCapture capture) {
    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isNotEmpty) {
      final code = barcodes.first.rawValue;
      setState(() {
        if (_step == 0) _personnelId = code;
        else if (_step == 1) _weaponId = code;
        else if (_step == 2) _vehicleId = code;
        
        if (_step < 2) _step++;
        else _finishCheckIn();
      });
    }
  }

  void _finishCheckIn() {
    // In production, send binding to backend
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('✅ Check-in Berhasil: Personil + Senjata + Kendaraan Terikat.'))
    );
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const DashboardScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('CHECK-IN TUGAS', style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _StatusRow(label: 'PERSONIL', value: _personnelId, active: _step == 0),
                _StatusRow(label: 'SENJATA', value: _weaponId, active: _step == 1),
                _StatusRow(label: 'KENDARAAN', value: _vehicleId, active: _step == 2),
              ],
            ),
          ),
          Expanded(
            child: Container(
              margin: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                border: Border.all(color: Theme.of(context).primaryColor, width: 2),
                borderRadius: BorderRadius.circular(24),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(22),
                child: MobileScanner(
                  onDetect: _onDetect,
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(bottom: 40),
            child: Text(
              _step == 0 ? 'SCAN QR ID PERSONIL' : _step == 1 ? 'SCAN QR SENJATA (ASSET)' : 'SCAN QR KENDARAAN',
              style: GoogleFonts.inter(fontWeight: FontWeight.bold, letterSpacing: 2, color: Theme.of(context).primaryColor),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusRow extends StatelessWidget {
  final String label;
  final String? value;
  final bool active;
  const _StatusRow({required this.label, this.value, required this.active});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.black, color: active ? Colors.white : Colors.white38)),
          Text(value ?? (active ? 'WAITING...' : 'PENDING'), style: GoogleFonts.jetbrainsMono(fontSize: 12, color: value != null ? Colors.greenAccent : active ? Colors.yellowAccent : Colors.white12)),
        ],
      ),
    );
  }
}
