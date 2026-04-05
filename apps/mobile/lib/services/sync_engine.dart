import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';

class TacticalSyncEngine {
  static Database? _database;

  static Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB();
    return _database!;
  }

  static Future<Database> _initDB() async {
    final docs = await getApplicationDocumentsDirectory();
    final path = join(docs.path, 'sentinel_offline.db');
    
    return openDatabase(
      path,
      version: 1,
      onCreate: (db, version) {
        return db.execute(
          "CREATE TABLE offline_tracking(id INTEGER PRIMARY KEY AUTOINCREMENT, payload TEXT, timestamp TEXT)"
        );
      },
    );
  }

  static Future<void> cacheLocation(Map<String, dynamic> payload) async {
    final db = await database;
    await db.insert('offline_tracking', {
      'payload': payload.toString(), // Simplify for prototype, ideally JSON.encode
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  static Future<List<Map<String, dynamic>>> getPendingSync() async {
    final db = await database;
    return await db.query('offline_tracking', orderBy: 'timestamp ASC');
  }

  static Future<void> clearBatch(List<int> ids) async {
    final db = await database;
    for (var id in ids) {
      await db.delete('offline_tracking', where: 'id = ?', whereArgs: [id]);
    }
  }
}
