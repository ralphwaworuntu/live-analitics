import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../services/tracking_service.dart';
import 'camera_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  GoogleMapController? _mapController;

  @override
  Widget build(BuildContext context) {
    final tracking = Provider.of<TrackingService>(context);
    final pos = tracking.currentPosition;

    return Scaffold(
      appBar: AppBar(
        title: Text('SENTINEL FIELD', style: GoogleFonts.inter(fontWeight: FontWeight.bold, letterSpacing: 2)),
        centerTitle: true,
        backgroundColor: Theme.of(context).colorScheme.surface,
        actions: [
          _StatusIcon(
            icon: Icons.flash_on, 
            active: tracking.isSOSActive, 
            color: Colors.redAccent
          ),
          _StatusIcon(
            icon: Icons.security, 
            active: !tracking.isOutOfBounds, 
            color: Colors.greenAccent
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Stack(
        children: [
          pos == null
              ? const Center(child: CircularProgressIndicator())
              : GoogleMap(
                  initialCameraPosition: CameraPosition(
                    target: LatLng(pos.latitude, pos.longitude),
                    zoom: 15,
                  ),
                  myLocationEnabled: true,
                  myLocationButtonEnabled: false,
                  mapType: MapType.normal,
                  onMapCreated: (controller) => _mapController = controller,
                ),
          
          // SPEED HUD
          Positioned(
            top: 16,
            left: 16,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: tracking.currentSpeed > 80 ? Colors.red : Colors.white10),
              ),
              child: Column(
                children: [
                  Text('SPEED', style: GoogleFonts.inter(fontSize: 8, fontWeight: FontWeight.black, color: Colors.white30)),
                  Text('${tracking.currentSpeed.toInt()}', style: GoogleFonts.jetbrainsMono(fontSize: 24, fontWeight: FontWeight.bold, color: tracking.currentSpeed > 80 ? Colors.red : Colors.white)),
                  const Text('KM/H', style: TextStyle(fontSize: 8, color: Colors.white60)),
                ],
              ),
            ),
          ),

          // AMBIENT WARNING: OOB
          if (tracking.isOutOfBounds)
            Positioned(
              top: 100,
              left: 40,
              right: 40,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.8),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Center(
                  child: Text('OUT OF SEKTOR BOUNDS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10)),
                ),
              ),
            ),

          // TACTICAL VISION & SOS BUTTON
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                 // SOS TERNARY
                 InkWell(
                   onLongPress: () => tracking.toggleSOS(),
                   child: AnimatedContainer(
                     duration: const Duration(milliseconds: 300),
                     width: 80,
                     height: 80,
                     decoration: BoxDecoration(
                       color: tracking.isSOSActive ? Colors.red : Colors.red.withOpacity(0.1),
                       shape: BoxShape.circle,
                       border: Border.all(color: Colors.red, width: 2),
                       boxShadow: tracking.isSOSActive ? [
                         const BoxShadow(color: Colors.red, blurRadius: 20, spreadRadius: 5)
                       ] : [],
                     ),
                     child: Center(
                       child: Column(
                         mainAxisAlignment: MainAxisAlignment.center,
                         children: [
                           const Icon(Icons.sos, color: Colors.white, size: 24),
                           if (!tracking.isSOSActive)
                             const Text('HOLD', style: TextStyle(fontSize: 8, color: Colors.white60)),
                         ],
                       ),
                     ),
                   ),
                 ),
                 const SizedBox(width: 32),
                 // VISION
                 InkWell(
                   onTap: () {
                     Navigator.push(context, MaterialPageRoute(builder: (context) => const CameraScreen()));
                   },
                   child: Container(
                     width: 80,
                     height: 80,
                     decoration: BoxDecoration(
                       color: Colors.white,
                       shape: BoxShape.circle,
                       boxShadow: [
                         BoxShadow(color: Colors.white.withOpacity(0.3), blurRadius: 20, spreadRadius: 2)
                       ]
                     ),
                     child: const Center(
                       child: Icon(Icons.camera_alt, color: Colors.black, size: 32),
                     ),
                   ),
                 ),
              ],
            ),
          ),
          
          Positioned(
            bottom: 140,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                   color: Colors.black87,
                   borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  tracking.isSOSActive ? 'HIGH-FREQ REPORTING (2S)' : 'NORMAL TRACKING (10S)',
                  style: GoogleFonts.inter(color: tracking.isSOSActive ? Colors.redAccent : Colors.white60, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          )
        ],
      ),
      floatingActionButton: FloatingActionButton(
        mini: true,
        backgroundColor: Theme.of(context).colorScheme.surface,
        child: Icon(Icons.my_location, color: Theme.of(context).primaryColor),
        onPressed: () {
          if (pos != null && _mapController != null) {
            _mapController!.animateCamera(
              CameraUpdate.newLatLng(LatLng(pos.latitude, pos.longitude)),
            );
          }
        },
      ),
    );
  }
}

class _StatusIcon extends StatelessWidget {
  final IconData icon;
  final bool active;
  final Color color;
  const _StatusIcon({required this.icon, required this.active, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(left: 8),
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: active ? color.withOpacity(0.2) : Colors.white10,
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: active ? color : Colors.white30, size: 16),
    );
  }
}
