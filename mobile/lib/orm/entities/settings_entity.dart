import '../base_entity.dart';
import '../repository.dart';
import '../../utils/constants.dart';

/// Settings entity that extends BaseEntity for ORM functionality
class SettingsEntity extends BaseEntity {
  @override
  String get tableName => DatabaseConstants.settingsTable;

  final int? _id;
  final String key;
  final String value;
  final String? description;
  final String? category;
  final String? dataType;
  final bool isEncrypted;
  final DateTime updatedAt;

  @override
  int? get id => _id;

  const SettingsEntity({
    int? id,
    required this.key,
    required this.value,
    this.description,
    this.category,
    this.dataType,
    this.isEncrypted = false,
    required this.updatedAt,
  }) : _id = id;

  /// Get value as integer
  int? get intValue {
    try {
      return int.parse(value);
    } catch (e) {
      return null;
    }
  }

  /// Get value as double
  double? get doubleValue {
    try {
      return double.parse(value);
    } catch (e) {
      return null;
    }
  }

  /// Get value as boolean
  bool get boolValue {
    return value.toLowerCase() == 'true' || value == '1';
  }

  /// Get value as JSON
  Map<String, dynamic>? get jsonValue {
    try {
      return Map<String, dynamic>.from(value as Map);
    } catch (e) {
      return null;
    }
  }

  @override
  Map<String, dynamic> toDatabaseJson() {
    return {
      if (_id != null) 'id': _id,
      'key': key,
      'value': value,
      'description': description,
      'category': category,
      'data_type': dataType,
      'is_encrypted': isEncrypted ? 1 : 0,
      'updated_at': updatedAt.millisecondsSinceEpoch,
    };
  }

  @override
  void _updateFromDatabase(Map<String, dynamic> json) {
    // This method would update the current instance
    // Since we're using immutable entities, we'll create a new instance
  }

  static SettingsEntity fromDatabase(Map<String, dynamic> json) {
    return SettingsEntity(
      id: json['id'] as int?,
      key: json['key'] as String? ?? '',
      value: json['value'] as String? ?? '',
      description: json['description'] as String?,
      category: json['category'] as String?,
      dataType: json['data_type'] as String?,
      isEncrypted: (json['is_encrypted'] as int? ?? 0) == 1,
      updatedAt: DateTime.fromMillisecondsSinceEpoch(json['updated_at'] as int),
    );
  }

  factory SettingsEntity.fromJson(Map<String, dynamic> json) {
    return SettingsEntity(
      id: json['id'] as int?,
      key: json['key'] as String? ?? '',
      value: json['value'] as String? ?? '',
      description: json['description'] as String?,
      category: json['category'] as String?,
      dataType: json['data_type'] as String?,
      isEncrypted: json['is_encrypted'] as bool? ?? false,
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (_id != null) 'id': _id,
      'key': key,
      'value': value,
      'description': description,
      'category': category,
      'data_type': dataType,
      'is_encrypted': isEncrypted,
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  SettingsEntity copyWith({
    int? id,
    String? key,
    String? value,
    String? description,
    String? category,
    String? dataType,
    bool? isEncrypted,
    DateTime? updatedAt,
  }) {
    return SettingsEntity(
      id: id ?? _id,
      key: key ?? this.key,
      value: value ?? this.value,
      description: description ?? this.description,
      category: category ?? this.category,
      dataType: dataType ?? this.dataType,
      isEncrypted: isEncrypted ?? this.isEncrypted,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is SettingsEntity && other.key == key;
  }

  @override
  int get hashCode => key.hashCode;

  @override
  String toString() {
    return 'SettingsEntity(key: $key, value: $value, category: $category)';
  }
}

/// Settings repository for database operations
class SettingsRepository extends BaseRepository<SettingsEntity> {
  @override
  String get tableName => DatabaseConstants.settingsTable;

  @override
  SettingsEntity fromDatabaseJson(Map<String, dynamic> json) {
    return SettingsEntity.fromDatabase(json);
  }

  /// Find setting by key
  Future<SettingsEntity?> findByKey(String key) async {
    final db = await database;
    final result = await db.query(
      tableName,
      where: 'key = ?',
      whereArgs: [key],
      limit: 1,
    );
    
    if (result.isEmpty) return null;
    return fromDatabaseJson(result.first);
  }

  /// Find settings by category
  Future<List<SettingsEntity>> findByCategory(String category) async {
    return await findByField('category', category, orderBy: 'key ASC');
  }

  /// Find settings by data type
  Future<List<SettingsEntity>> findByDataType(String dataType) async {
    return await findByField('data_type', dataType, orderBy: 'key ASC');
  }

  /// Find encrypted settings
  Future<List<SettingsEntity>> findEncryptedSettings() async {
    return await findByField('is_encrypted', 1, orderBy: 'key ASC');
  }

  /// Get setting value by key
  Future<String?> getValue(String key) async {
    final setting = await findByKey(key);
    return setting?.value;
  }

  /// Get setting value as integer
  Future<int?> getIntValue(String key) async {
    final setting = await findByKey(key);
    return setting?.intValue;
  }

  /// Get setting value as double
  Future<double?> getDoubleValue(String key) async {
    final setting = await findByKey(key);
    return setting?.doubleValue;
  }

  /// Get setting value as boolean
  Future<bool?> getBoolValue(String key) async {
    final setting = await findByKey(key);
    return setting?.boolValue;
  }

  /// Set setting value
  Future<int> setValue(String key, String value, {
    String? description,
    String? category,
    String? dataType,
    bool isEncrypted = false,
  }) async {
    final existing = await findByKey(key);
    
    if (existing != null) {
      // Update existing setting
      final updated = existing.copyWith(
        value: value,
        description: description,
        category: category,
        dataType: dataType,
        isEncrypted: isEncrypted,
        updatedAt: DateTime.now(),
      );
      return await update(updated);
    } else {
      // Create new setting
      final newSetting = SettingsEntity(
        key: key,
        value: value,
        description: description,
        category: category,
        dataType: dataType,
        isEncrypted: isEncrypted,
        updatedAt: DateTime.now(),
      );
      return await insert(newSetting);
    }
  }

  /// Set multiple settings
  Future<void> setMultiple(Map<String, String> settings) async {
    final db = await database;
    final batch = db.batch();
    
    for (final entry in settings.entries) {
      final existing = await findByKey(entry.key);
      
      if (existing != null) {
        final updated = existing.copyWith(
          value: entry.value,
          updatedAt: DateTime.now(),
        );
        batch.update(
          tableName,
          updated.toDatabaseJson(),
          where: 'key = ?',
          whereArgs: [entry.key],
        );
      } else {
        final newSetting = SettingsEntity(
          key: entry.key,
          value: entry.value,
          updatedAt: DateTime.now(),
        );
        batch.insert(tableName, newSetting.toDatabaseJson());
      }
    }
    
    await batch.commit();
  }

  /// Delete setting by key
  Future<int> deleteByKey(String key) async {
    return await deleteByField('key', key);
  }

  /// Get all categories
  Future<List<String>> getCategories() async {
    final db = await database;
    final result = await db.rawQuery(
      'SELECT DISTINCT category FROM $tableName WHERE category IS NOT NULL ORDER BY category ASC',
    );
    return result.map((row) => row['category'] as String).toList();
  }

  /// Get all data types
  Future<List<String>> getDataTypes() async {
    final db = await database;
    final result = await db.rawQuery(
      'SELECT DISTINCT data_type FROM $tableName WHERE data_type IS NOT NULL ORDER BY data_type ASC',
    );
    return result.map((row) => row['data_type'] as String).toList();
  }

  /// Get settings statistics
  Future<Map<String, int>> getSettingsStatistics() async {
    final db = await database;
    
    final totalResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName');
    final encryptedResult = await db.rawQuery('SELECT COUNT(*) as count FROM $tableName WHERE is_encrypted = 1');
    final categoryResult = await db.rawQuery('SELECT COUNT(DISTINCT category) as count FROM $tableName WHERE category IS NOT NULL');
    
    return {
      'total': totalResult.first['count'] as int,
      'encrypted': encryptedResult.first['count'] as int,
      'categories': categoryResult.first['count'] as int,
    };
  }
}
