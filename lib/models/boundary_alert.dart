import 'package:cloud_firestore/cloud_firestore.dart';

class BoundaryAlert {
  final String id;
  final String zoneId;
  final String zoneName;
  final String childId;
  final String type; // 'entered', 'exited' or 'status'
  final DateTime timestamp;
  final double latitude;
  final double longitude;

  BoundaryAlert({
    required this.id,
    required this.zoneId,
    required this.zoneName,
    required this.childId,
    required this.type,
    required this.timestamp,
    required this.latitude,
    required this.longitude,
  });

  factory BoundaryAlert.fromMap(Map<String, dynamic> map, String docId) {
    return BoundaryAlert(
      id: docId,
      zoneId: map['zoneId'] ?? '',
      zoneName: map['zoneName'] ?? '',
      childId: map['childId'] ?? '',
      type: map['type'] ?? map['status'] ?? 'OUTSIDE',
      timestamp: map['timestamp'] != null ? (map['timestamp'] as Timestamp).toDate() : DateTime.now(),
      latitude: (map['latitude'] ?? 0.0).toDouble(),
      longitude: (map['longitude'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'zoneId': zoneId,
      'zoneName': zoneName,
      'childId': childId,
      'status': type,
      'timestamp': Timestamp.fromDate(timestamp),
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}
