import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:dio/dio.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class CameraScreen extends StatefulWidget {
  const CameraScreen({super.key});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  CameraController? _controller;
  List<CameraDescription>? _cameras;
  bool _isInit = false;
  bool _isSosActive = false;

  @override
  void initState() {
    super.initState();
    _initCamera();
  }

  Future<void> _initCamera() async {
    _cameras = await availableCameras();
    if (_cameras!.isNotEmpty) {
      _controller = CameraController(_cameras![0], ResolutionPreset.high, enableAudio: false);
      await _controller!.initialize();
      if (!mounted) return;
      setState(() => _isInit = true);
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }
  
  void _triggerSos() async {
    setState(() => _isSosActive = true);
    
    try {
      if (_controller != null && _controller!.value.isInitialized) {
        final XFile file = await _controller!.takePicture();
        
        // 1. Upload ke endpoint ai/vision Backend (YOLOv8)
        FormData formData = FormData.fromMap({
          "file": await MultipartFile.fromFile(file.path, filename: "sos_capture.jpg"),
          "polres_id": 1, 
        });
        
        // Simulate Dio post request
        Dio dio = Dio();
        final response = await dio.post(
          'http://10.0.2.2:8000/api/vision/analyze',
          data: formData,
        );
        
        if (response.statusCode == 200) {
          final data = response.data;
          // Tampilkan alert respon anomaly:
          if (data['anomaly_detected'] == true) {
             _showSnack("🆘 MASS ALERT TRIGGERED & BROADCASTED! Command Center akan segera memonitor.");
          } else {
             _showSnack("✅ Foto lapangan terkirim ke server AI.");
          }
        }
      }
    } catch (e) {
      _showSnack("❌ Gagal mengirim gambar SOS: $e");
    } finally {
      setState(() => _isSosActive = false);
      Navigator.pop(context); // Back to Dashboard map
    }
  }

  void _showSnack(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    if (!_isInit) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          SizedBox.expand(
            child: CameraPreview(_controller!),
          ),
          
          SafeArea(
            child: Align(
              alignment: Alignment.topLeft,
              child: IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white, size: 30),
                onPressed: () => Navigator.pop(context),
              ),
            ),
          ),
          
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              padding: const EdgeInsets.only(bottom: 40),
              child: InkWell(
                onTap: _isSosActive ? null : _triggerSos,
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: _isSosActive ? Colors.grey : Colors.red,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 6),
                    boxShadow: [
                      if (!_isSosActive)
                        BoxShadow(
                          color: Colors.red.withOpacity(0.5),
                          blurRadius: 20,
                          spreadRadius: 10,
                        )
                    ],
                  ),
                  child: Center(
                    child: _isSosActive 
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('SOS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 24, letterSpacing: 2)),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
