import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:geolocator/geolocator.dart';
import 'camera_screen.dart'; // Placeholder for SOS Vision Route
import 'package:socket_io_client/socket_io_client.dart' as IO;

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  GoogleMapController? _mapController;
  Position? _currentPosition;
  late IO.Socket _socket;

  @override
  void initState() {
    super.initState();
    _initLocation();
    _initSocket();
  }

  void _initSocket() {
    // Connect to WebSocket using same pattern developed in Phase 4 Backend
    _socket = IO.io('http://10.0.2.2:8000', <String, dynamic>{
       'transports': ['websocket'],
       'autoConnect': true,
       'path': '/ws/socket.io'
    });
    
    _socket.onConnect((_) {
      print('🟢 Mobile connected to Command Center');
    });
  }

  Future<void> _initLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error('Location permissions are denied');
      }
    }

    _currentPosition = await Geolocator.getCurrentPosition();
    setState(() {});
    
    // Periodically send live tracking to Command Center
    Geolocator.getPositionStream().listen((Position position) {
      _currentPosition = position;
      // In production, emit coordinates: 
      // _socket.emit('live_tracking', {'lat': position.latitude, 'lng': position.longitude});
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('SENTINEL FIELD', style: GoogleFonts.inter(fontWeight: FontWeight.bold, letterSpacing: 2)),
        centerTitle: true,
        backgroundColor: Theme.of(context).colorScheme.surface,
        leading: IconButton(
          icon: const Icon(Icons.person),
          onPressed: () {
            // Profile modal
          },
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            child: const Icon(Icons.shield, color: Colors.greenAccent),
          )
        ],
      ),
      body: Stack(
        children: [
          _currentPosition == null
              ? const Center(child: CircularProgressIndicator())
              : GoogleMap(
                  initialCameraPosition: CameraPosition(
                    target: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                    zoom: 15,
                  ),
                  myLocationEnabled: true,
                  myLocationButtonEnabled: false,
                  mapType: MapType.normal,
                  onMapCreated: (GoogleMapController controller) {
                    _mapController = controller;
                  },
                ),
                
          // TACTICAL VISION & SOS BUTTON
          Positioned(
            bottom: 30,
            left: 0,
            right: 0,
            child: Center(
              child: InkWell(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const CameraScreen()),
                  );
                },
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.error,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Theme.of(context).colorScheme.error.withOpacity(0.5),
                        blurRadius: 20,
                        spreadRadius: 5,
                      )
                    ],
                  ),
                  child: const Center(
                     child: Icon(Icons.camera_alt, color: Colors.white, size: 36),
                  ),
                ),
              ),
            ),
          ),
          
          Positioned(
            bottom: 120,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.black87,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Theme.of(context).colorScheme.error),
                ),
                child: const Text(
                   'VISION ANALYZER & SOS',
                   style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
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
          if (_currentPosition != null && _mapController != null) {
            _mapController!.animateCamera(
              CameraUpdate.newCameraPosition(
                CameraPosition(
                  target: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                  zoom: 16.0,
                ),
              ),
            );
          }
        },
      ),
    );
  }
}
