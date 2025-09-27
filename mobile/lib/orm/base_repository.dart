import 'package:sqflite/sqflite.dart';
import 'base_entity.dart';
import 'repository.dart';
import 'orm_service.dart';

/// Base repository implementation that provides database access
/// All entity repositories should extend this class
abstract class BaseRepository<T extends BaseEntity> extends Repository<T> {
  final OrmService _ormService = OrmService();

  @override
  Future<Database> get database => _ormService.database;
}
