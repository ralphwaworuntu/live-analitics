import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:geolocator/geolocator.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:battery_plus/battery_plus.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class BackgroundTrackingEngine {
  static const String notificationChannelId = 'sentinel_tracking_service';
  static const int notificationId = 888;

  static Future<void> initialize() async {
    final service = FlutterBackgroundService();

    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      notificationChannelId,
      'SENTINEL TACTICAL TRACKER',
      description: 'Garda Terluar Biro Ops Polda NTT',
      importance: Importance.low, 
    );

    final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

    await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);

    await service.configure(
      androidConfiguration: AndroidConfiguration(
        onStart: onStart,
        autoStart: true,
        isForegroundMode: true,
        notificationChannelId: notificationChannelId,
        initialNotificationTitle: 'SENTINEL ENGINE ACTIVE',
        initialNotificationContent: 'Memonitor Pergerakan Taktis...',
        foregroundServiceNotificationId: notificationId,
      ),
      iosConfiguration: IosConfiguration(
        autoStart: true,
        onForeground: onStart,
        onBackground: onIosBackground,
      ),
    );
  }
}

@pragma('vm:entry-point')
Future<bool> onIosBackground(ServiceInstance service) async {
  WidgetsFlutterBinding.ensureInitialized();
  return true;
}

@pragma('vm:entry-point')
void onStart(ServiceInstance service) async {
  DartPluginRegistrant.ensureInitialized();
  
  final battery = Battery();
  final connectivity = Connectivity();
  
  IO.Socket socket = IO.io('http://10.0.2.2:8000', <String, dynamic>{
    'transports': ['websocket'],
    'autoConnect': true,
    'path': '/ws/socket.io'
  });

  Position? lastPosition;
  double adaptiveIntervalInSeconds = 10.0;
  
  // ADAPTIVE TRACKING LOGIC
  void adjustAccuracy(double speed) {
    if (speed > 10 / 3.6) { // > 10km/h
       adaptiveIntervalInSeconds = 2.0; // High Accuracy
    } else {
       adaptiveIntervalInSeconds = 30.0; // Power Save
    }
  }

  socket.onConnect((_) => debugPrint('🟢 Background Engine Connected'));

  // ACCOUNTABILITY LOG: Catching deliberate shutdowns
  service.on('stopService').listen((event) async {
    if (lastPosition != null) {
      final bLevel = await battery.batteryLevel;
      socket.emit('live_tracking', {
        'lat': lastPosition!.latitude,
        'lng': lastPosition!.longitude,
        'battery': bLevel,
        'status': 'Disconnected Prematurely',
        'reason': 'Manual Service Stop Triggered',
        'timestamp': DateTime.now().toIso8601String()
      });
    }
    service.stopSelf();
  });

  Timer.periodic(const Duration(seconds: 1), (timer) async {
    if (socket.connected) {
       // Check frequency
       if (timer.tick % adaptiveIntervalInSeconds.toInt() == 0) {
          final pos = await Geolocator.getCurrentPosition(
            desiredAccuracy: adaptiveIntervalInSeconds < 5 ? LocationAccuracy.high : LocationAccuracy.medium
          );
          lastPosition = pos;
          
          final bLevel = await battery.batteryLevel;
          final cResult = await connectivity.checkConnectivity();
          
          adjustAccuracy(pos.speed);

          socket.emit('live_tracking', {
            'lat': pos.latitude,
            'lng': pos.longitude,
            'speed': pos.speed * 3.6,
            'battery': bLevel,
            'signal': cResult.contains(ConnectivityResult.mobile) ? 'CELLULAR' : 'WIFI',
            'timestamp': DateTime.now().toIso8601String(),
            'mode': 'ADAPTIVE'
          });
       }
    }
  });
}
