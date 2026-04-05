import 'dart:async';
import 'dart:math' as math;
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:battery_plus/battery_plus.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter_activity_recognition/flutter_activity_recognition.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'sync_engine.dart';

class TrackingService extends ChangeNotifier {
  late IO.Socket _socket;
  final Battery _battery = Battery();
  final Connectivity _connectivity = Connectivity();
  final AudioRecorder _audioRecorder = AudioRecorder();
  final FlutterTts _tts = FlutterTts();
  
  bool _isSOSActive = false;
  bool get isSOSActive => _isSOSActive;

  double _currentSpeed = 0.0;
  double get currentSpeed => _currentSpeed;
  
  ActivityType _currentActivity = ActivityType.STILL;
  ActivityType get currentActivity => _currentActivity;

  StreamSubscription<Position>? _positionSubscription;
  Timer? _trackingTimer;
  Timer? _audioLogTimer;

  TrackingService() {
    _initSocket();
    _initActivityRecognition();
    _initConnectivityMonitor();
    _initVoiceSystem();
  }

  void _initSocket() {
    _socket = IO.io('http://10.0.2.2:8000', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': true,
      'path': '/ws/socket.io'
    });
    _socket.onConnect((_) {
      debugPrint('🟢 Tactical Engine Online');
      _triggerBackfill(); 
      _startTracking();
    });
  }

  void _initVoiceSystem() async {
    await _tts.setLanguage("id-ID");
    await _tts.setSpeechRate(0.8);
    await _tts.setVolume(1.0);
  }

  void _initActivityRecognition() {
    FlutterActivityRecognition.instance.activityStream.listen((activity) {
      if (_currentActivity != activity.type) {
        _currentActivity = activity.type;
        _onActivityChanged();
        notifyListeners();
      }
    });
  }

  void _initConnectivityMonitor() {
    _connectivity.onConnectivityChanged.listen((result) {
       if (result.contains(ConnectivityResult.mobile) || result.contains(ConnectivityResult.wifi)) {
          _triggerBackfill();
       }
    });
  }

  void _onActivityChanged() {
    if (_isSOSActive) return;
    _startTracking();
  }

  void toggleSOS() {
    _isSOSActive = !_isSOSActive;
    if (_isSOSActive) {
       _announceTactical('SOS Diaktifkan. Mengirim koordinat presisi dan rekaman audio.');
       _startEmergencyRecording();
    } else {
       _stopEmergencyRecording();
    }
    notifyListeners();
    _startTracking();
  }

  Future<void> _announceTactical(String text) async {
    await _tts.speak(text);
  }

  Future<void> _startTracking() async {
    _positionSubscription?.cancel();
    LocationAccuracy accuracy = LocationAccuracy.balanced;
    Duration interval = const Duration(seconds: 10);
    if (_isSOSActive || _currentActivity == ActivityType.IN_VEHICLE) {
       accuracy = LocationAccuracy.best;
       interval = const Duration(seconds: 2);
    } else if (_currentActivity == ActivityType.STILL) {
       accuracy = LocationAccuracy.low;
       interval = const Duration(seconds: 60);
    }
    _positionSubscription = Geolocator.getPositionStream(
      locationSettings: AndroidSettings(accuracy: accuracy, intervalDuration: interval)
    ).listen(_handleLocationUpdate);
  }

  Future<void> _handleLocationUpdate(Position position) async {
    _currentSpeed = position.speed * 3.6;
    _currentPosition = position;
    final bLevel = await _battery.batteryLevel;
    
    // PROACTIVE VOICE ALERTS: Critical Battery
    if (bLevel < 15 && !_notifiedBattery) {
      _announceTactical('Peringatan: Baterai perangkat di bawah 15 persen. Segera hubungkan sumber daya.');
      _notifiedBattery = true;
    } else if (bLevel > 20) { _notifiedBattery = false; }

    final Map<String, dynamic> payload = {
      'lat': position.latitude, 'lng': position.longitude,
      'speed': _currentSpeed, 'battery': bLevel,
      'timestamp': DateTime.now().toIso8601String(),
    };
    if (_socket.connected) { _socket.emit('live_tracking', payload); }
    else { await TacticalSyncEngine.cacheLocation(payload); }
    notifyListeners();
  }

  bool _notifiedBattery = false;
  Position? _currentPosition;
  Position? get currentPosition => _currentPosition;

  // EMERGENCY MEDIA: Evidence Log
  Future<void> _startEmergencyRecording() async {
    _audioLogTimer?.cancel();
    _recordAndUploadCycle();
    _audioLogTimer = Timer.periodic(const Duration(seconds: 30), (timer) { _recordAndUploadCycle(); });
  }
  Future<void> _recordAndUploadCycle() async {
    if (await _audioRecorder.hasPermission()) {
      final docs = await getApplicationDocumentsDirectory();
      final path = '${docs.path}/evidence_${DateTime.now().millisecondsSinceEpoch}.m4a';
      await _audioRecorder.start(const RecordConfig(), path: path);
      Future.delayed(const Duration(seconds: 30), () async {
         final filePath = await _audioRecorder.stop();
         if (filePath != null) {
            final file = File(filePath);
            final bytes = await file.readAsBytes();
            _socket.emit('evidence_log', {
              'type': 'audio', 'bytes': bytes, 'nrp': '88050912',
              'timestamp': DateTime.now().toIso8601String()
            });
         }
      });
    }
  }
  void _stopEmergencyRecording() { _audioLogTimer?.cancel(); _audioRecorder.stop(); }

  Future<void> _triggerBackfill() async {
    final pending = await TacticalSyncEngine.getPendingSync();
    if (pending.isNotEmpty && _socket.connected) {
       _socket.emit('backfill_logs', { 'packets': pending, 'source': 'field_mobile' });
       await TacticalSyncEngine.clearBatch(pending.map((e) => e['id'] as int).toList());
    }
  }

  @override
  void dispose() {
    _positionSubscription?.cancel(); _audioLogTimer?.cancel();
    _audioRecorder.dispose(); _tts.stop();
    super.dispose();
  }
}
