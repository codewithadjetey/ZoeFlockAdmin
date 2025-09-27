import 'dart:collection';
import 'base_entity.dart';

/// Cache entry with metadata
class CacheEntry<T extends BaseEntity> {
  final T entity;
  final DateTime createdAt;
  final DateTime lastAccessedAt;
  final int accessCount;

  CacheEntry({
    required this.entity,
    required this.createdAt,
    required this.lastAccessedAt,
    this.accessCount = 1,
  });

  CacheEntry<T> copyWith({
    T? entity,
    DateTime? createdAt,
    DateTime? lastAccessedAt,
    int? accessCount,
  }) {
    return CacheEntry<T>(
      entity: entity ?? this.entity,
      createdAt: createdAt ?? this.createdAt,
      lastAccessedAt: lastAccessedAt ?? this.lastAccessedAt,
      accessCount: accessCount ?? this.accessCount,
    );
  }

  /// Update access information
  CacheEntry<T> markAccessed() {
    return copyWith(
      lastAccessedAt: DateTime.now(),
      accessCount: accessCount + 1,
    );
  }

  /// Check if entry is expired
  bool isExpired(Duration ttl) {
    return DateTime.now().difference(createdAt) > ttl;
  }
}

/// Cache statistics
class CacheStatistics {
  final int totalEntries;
  final int hitCount;
  final int missCount;
  final int evictionCount;
  final DateTime lastReset;

  const CacheStatistics({
    required this.totalEntries,
    required this.hitCount,
    required this.missCount,
    required this.evictionCount,
    required this.lastReset,
  });

  double get hitRate => totalEntries > 0 ? hitCount / (hitCount + missCount) : 0.0;
  double get missRate => totalEntries > 0 ? missCount / (hitCount + missCount) : 0.0;

  CacheStatistics copyWith({
    int? totalEntries,
    int? hitCount,
    int? missCount,
    int? evictionCount,
    DateTime? lastReset,
  }) {
    return CacheStatistics(
      totalEntries: totalEntries ?? this.totalEntries,
      hitCount: hitCount ?? this.hitCount,
      missCount: missCount ?? this.missCount,
      evictionCount: evictionCount ?? this.evictionCount,
      lastReset: lastReset ?? this.lastReset,
    );
  }
}

/// Cache eviction policies
enum CacheEvictionPolicy {
  lru, // Least Recently Used
  lfu, // Least Frequently Used
  ttl, // Time To Live
  fifo, // First In First Out
}

/// Entity cache manager
class EntityCache {
  final Map<String, CacheEntry> _cache = {};
  final int maxSize;
  final Duration defaultTtl;
  final CacheEvictionPolicy evictionPolicy;
  
  int _hitCount = 0;
  int _missCount = 0;
  int _evictionCount = 0;
  DateTime _lastReset = DateTime.now();

  EntityCache({
    this.maxSize = 1000,
    this.defaultTtl = const Duration(minutes: 30),
    this.evictionPolicy = CacheEvictionPolicy.lru,
  });

  /// Get entity from cache
  T? get<T extends BaseEntity>(String key) {
    final entry = _cache[key] as CacheEntry<T>?;
    
    if (entry == null) {
      _missCount++;
      return null;
    }

    // Check if expired
    if (entry.isExpired(defaultTtl)) {
      _cache.remove(key);
      _missCount++;
      return null;
    }

    // Update access information
    _cache[key] = entry.markAccessed();
    _hitCount++;
    return entry.entity;
  }

  /// Put entity in cache
  void put<T extends BaseEntity>(String key, T entity, {Duration? ttl}) {
    final entry = CacheEntry<T>(
      entity: entity,
      createdAt: DateTime.now(),
      lastAccessedAt: DateTime.now(),
    );

    _cache[key] = entry;

    // Check if we need to evict
    if (_cache.length > maxSize) {
      _evict();
    }
  }

  /// Remove entity from cache
  void remove(String key) {
    _cache.remove(key);
  }

  /// Clear all cache
  void clear() {
    _cache.clear();
    _resetStatistics();
  }

  /// Check if key exists in cache
  bool contains(String key) {
    final entry = _cache[key];
    if (entry == null) return false;
    
    if (entry.isExpired(defaultTtl)) {
      _cache.remove(key);
      return false;
    }
    
    return true;
  }

  /// Get cache size
  int get size => _cache.length;

  /// Check if cache is empty
  bool get isEmpty => _cache.isEmpty;

  /// Check if cache is full
  bool get isFull => _cache.length >= maxSize;

  /// Get cache statistics
  CacheStatistics get statistics => CacheStatistics(
    totalEntries: _cache.length,
    hitCount: _hitCount,
    missCount: _missCount,
    evictionCount: _evictionCount,
    lastReset: _lastReset,
  );

  /// Reset statistics
  void resetStatistics() {
    _resetStatistics();
  }

  void _resetStatistics() {
    _hitCount = 0;
    _missCount = 0;
    _evictionCount = 0;
    _lastReset = DateTime.now();
  }

  /// Evict entries based on policy
  void _evict() {
    if (_cache.isEmpty) return;

    switch (evictionPolicy) {
      case CacheEvictionPolicy.lru:
        _evictLRU();
        break;
      case CacheEvictionPolicy.lfu:
        _evictLFU();
        break;
      case CacheEvictionPolicy.ttl:
        _evictTTL();
        break;
      case CacheEvictionPolicy.fifo:
        _evictFIFO();
        break;
    }
  }

  /// Evict least recently used entry
  void _evictLRU() {
    String? oldestKey;
    DateTime? oldestTime;

    for (final entry in _cache.entries) {
      final lastAccessed = (entry.value as CacheEntry).lastAccessedAt;
      if (oldestTime == null || lastAccessed.isBefore(oldestTime)) {
        oldestTime = lastAccessed;
        oldestKey = entry.key;
      }
    }

    if (oldestKey != null) {
      _cache.remove(oldestKey);
      _evictionCount++;
    }
  }

  /// Evict least frequently used entry
  void _evictLFU() {
    String? leastUsedKey;
    int? leastAccessCount;

    for (final entry in _cache.entries) {
      final accessCount = (entry.value as CacheEntry).accessCount;
      if (leastAccessCount == null || accessCount < leastAccessCount) {
        leastAccessCount = accessCount;
        leastUsedKey = entry.key;
      }
    }

    if (leastUsedKey != null) {
      _cache.remove(leastUsedKey);
      _evictionCount++;
    }
  }

  /// Evict expired entries
  void _evictTTL() {
    final expiredKeys = <String>[];
    
    for (final entry in _cache.entries) {
      if ((entry.value as CacheEntry).isExpired(defaultTtl)) {
        expiredKeys.add(entry.key);
      }
    }

    for (final key in expiredKeys) {
      _cache.remove(key);
      _evictionCount++;
    }
  }

  /// Evict first in first out
  void _evictFIFO() {
    String? oldestKey;
    DateTime? oldestTime;

    for (final entry in _cache.entries) {
      final createdAt = (entry.value as CacheEntry).createdAt;
      if (oldestTime == null || createdAt.isBefore(oldestTime)) {
        oldestTime = createdAt;
        oldestKey = entry.key;
      }
    }

    if (oldestKey != null) {
      _cache.remove(oldestKey);
      _evictionCount++;
    }
  }

  /// Clean expired entries
  void cleanExpired() {
    final expiredKeys = <String>[];
    
    for (final entry in _cache.entries) {
      if ((entry.value as CacheEntry).isExpired(defaultTtl)) {
        expiredKeys.add(entry.key);
      }
    }

    for (final key in expiredKeys) {
      _cache.remove(key);
    }
  }

  /// Get all cache keys
  List<String> get keys => _cache.keys.toList();

  /// Get all cached entities
  List<T> getAll<T extends BaseEntity>() {
    return _cache.values
        .where((entry) => entry is CacheEntry<T>)
        .map((entry) => (entry as CacheEntry<T>).entity)
        .toList();
  }
}

/// Query cache for storing query results
class QueryCache {
  final Map<String, CacheEntry<List<Map<String, dynamic>>>> _cache = {};
  final int maxSize;
  final Duration defaultTtl;
  
  int _hitCount = 0;
  int _missCount = 0;
  int _evictionCount = 0;
  DateTime _lastReset = DateTime.now();

  QueryCache({
    this.maxSize = 500,
    this.defaultTtl = const Duration(minutes: 15),
  });

  /// Get query result from cache
  List<Map<String, dynamic>>? get(String query, List<dynamic>? parameters) {
    final key = _generateKey(query, parameters);
    final entry = _cache[key];
    
    if (entry == null) {
      _missCount++;
      return null;
    }

    // Check if expired
    if (entry.isExpired(defaultTtl)) {
      _cache.remove(key);
      _missCount++;
      return null;
    }

    // Update access information
    _cache[key] = entry.markAccessed();
    _hitCount++;
    return entry.entity;
  }

  /// Put query result in cache
  void put(String query, List<dynamic>? parameters, List<Map<String, dynamic>> result) {
    final key = _generateKey(query, parameters);
    final entry = CacheEntry<List<Map<String, dynamic>>>(
      entity: result,
      createdAt: DateTime.now(),
      lastAccessedAt: DateTime.now(),
    );

    _cache[key] = entry;

    // Check if we need to evict
    if (_cache.length > maxSize) {
      _evict();
    }
  }

  /// Remove query from cache
  void remove(String query, List<dynamic>? parameters) {
    final key = _generateKey(query, parameters);
    _cache.remove(key);
  }

  /// Clear all query cache
  void clear() {
    _cache.clear();
    _resetStatistics();
  }

  /// Generate cache key from query and parameters
  String _generateKey(String query, List<dynamic>? parameters) {
    final params = parameters?.join(',') ?? '';
    return '${query.hashCode}_$params';
  }

  /// Get cache statistics
  CacheStatistics get statistics => CacheStatistics(
    totalEntries: _cache.length,
    hitCount: _hitCount,
    missCount: _missCount,
    evictionCount: _evictionCount,
    lastReset: _lastReset,
  );

  /// Reset statistics
  void resetStatistics() {
    _resetStatistics();
  }

  void _resetStatistics() {
    _hitCount = 0;
    _missCount = 0;
    _evictionCount = 0;
    _lastReset = DateTime.now();
  }

  /// Evict least recently used entry
  void _evict() {
    if (_cache.isEmpty) return;

    String? oldestKey;
    DateTime? oldestTime;

    for (final entry in _cache.entries) {
      final lastAccessed = entry.value.lastAccessedAt;
      if (oldestTime == null || lastAccessed.isBefore(oldestTime)) {
        oldestTime = lastAccessed;
        oldestKey = entry.key;
      }
    }

    if (oldestKey != null) {
      _cache.remove(oldestKey);
      _evictionCount++;
    }
  }

  /// Clean expired entries
  void cleanExpired() {
    final expiredKeys = <String>[];
    
    for (final entry in _cache.entries) {
      if (entry.value.isExpired(defaultTtl)) {
        expiredKeys.add(entry.key);
      }
    }

    for (final key in expiredKeys) {
      _cache.remove(key);
    }
  }
}

/// Cache manager for managing all caches
class CacheManager {
  static final CacheManager _instance = CacheManager._internal();
  factory CacheManager() => _instance;
  CacheManager._internal();

  final Map<Type, EntityCache> _entityCaches = {};
  final QueryCache _queryCache = QueryCache();

  /// Get entity cache for type
  EntityCache getEntityCache<T extends BaseEntity>() {
    if (!_entityCaches.containsKey(T)) {
      _entityCaches[T] = EntityCache();
    }
    return _entityCaches[T]!;
  }

  /// Get query cache
  QueryCache get queryCache => _queryCache;

  /// Clear all caches
  void clearAll() {
    for (final cache in _entityCaches.values) {
      cache.clear();
    }
    _queryCache.clear();
  }

  /// Clear entity cache for type
  void clearEntityCache<T extends BaseEntity>() {
    _entityCaches[T]?.clear();
  }

  /// Get cache statistics for all caches
  Map<String, CacheStatistics> getAllStatistics() {
    final stats = <String, CacheStatistics>{};
    
    for (final entry in _entityCaches.entries) {
      stats[entry.key.toString()] = entry.value.statistics;
    }
    
    stats['QueryCache'] = _queryCache.statistics;
    
    return stats;
  }

  /// Clean expired entries from all caches
  void cleanExpired() {
    for (final cache in _entityCaches.values) {
      cache.cleanExpired();
    }
    _queryCache.cleanExpired();
  }
}

/// Cache mixin for entities
mixin CacheMixin on BaseEntity {
  static final CacheManager _cacheManager = CacheManager();

  /// Get cache key for this entity
  String get cacheKey => '${runtimeType}_$id';

  /// Get from cache
  T? getFromCache<T extends BaseEntity>() {
    final cache = _cacheManager.getEntityCache<T>();
    return cache.get<T>(cacheKey);
  }

  /// Put in cache
  void putInCache<T extends BaseEntity>(T entity) {
    final cache = _cacheManager.getEntityCache<T>();
    cache.put(cacheKey, entity);
  }

  /// Remove from cache
  void removeFromCache() {
    final cache = _cacheManager.getEntityCache();
    cache.remove(cacheKey);
  }

  /// Clear cache for this entity type
  static void clearCache<T extends BaseEntity>() {
    _cacheManager.clearEntityCache<T>();
  }
}
