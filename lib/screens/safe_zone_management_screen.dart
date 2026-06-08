import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/safe_zone.dart';
import '../models/boundary_alert.dart';
import '../services/safe_zone_service.dart';
import 'safe_zone_map_screen.dart';

class SafeZoneManagementScreen extends StatefulWidget {
  const SafeZoneManagementScreen({super.key});

  @override
  State<SafeZoneManagementScreen> createState() => _SafeZoneManagementScreenState();
}

class _SafeZoneManagementScreenState extends State<SafeZoneManagementScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late SafeZoneService _safeZoneService;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    
    final user = FirebaseAuth.instance.currentUser;
    _safeZoneService = SafeZoneService(guardianId: user?.uid ?? '');
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _addNewZone() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const SafeZoneMapScreen(
          initialLocation: LatLng(18.5204, 73.8567), // Pune Default
        ),
      ),
    );

    if (result != null) {
      final user = FirebaseAuth.instance.currentUser;
      final newZone = SafeZone(
        id: '',
        childId: 'child_placeholder', // Hardcoded or selected in advanced setups
        guardianId: user?.uid ?? '',
        zoneName: result['name'],
        latitude: result['latitude'],
        longitude: result['longitude'],
        radius: result['radius'],
        active: true,
      );
      await _safeZoneService.addSafeZone(newZone);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Safe Zone Added')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF03010A),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(100),
        child: ClipRRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
            child: AppBar(
              backgroundColor: const Color(0xFF03010A).withOpacity(0.5),
              elevation: 0,
              centerTitle: false,
              title: const Text('Safe Zone Management', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              iconTheme: const IconThemeData(color: Colors.white),
              bottom: TabBar(
                controller: _tabController,
                indicatorColor: const Color(0xFFFF5F8A),
                labelColor: const Color(0xFFFF5F8A),
                unselectedLabelColor: Colors.white54,
                tabs: const [
                  Tab(icon: Icon(Icons.security), text: 'Safe Zones'),
                  Tab(icon: Icon(Icons.notifications_active), text: 'Boundary Alerts'),
                ],
              ),
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildSafeZonesTab(),
          _buildAlertsTab(),
        ],
      ),
      floatingActionButton: _tabController.index == 0
          ? FloatingActionButton.extended(
              onPressed: _addNewZone,
              backgroundColor: const Color(0xFFFF5F8A),
              icon: const Icon(Icons.add, color: Colors.white),
              label: const Text('Add Zone', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            )
          : null,
    );
  }

  Widget _buildSafeZonesTab() {
    return StreamBuilder<List<SafeZone>>(
      stream: _safeZoneService.getSafeZones(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: Color(0xFFFF5F8A)));
        }
        if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}', style: const TextStyle(color: Colors.white)));
        }

        final zones = snapshot.data ?? [];
        
        if (zones.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.location_off, size: 64, color: Colors.white24),
                const SizedBox(height: 16),
                const Text('No Safe Zones configured.', style: TextStyle(color: Colors.white54, fontSize: 16)),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(24),
          itemCount: zones.length,
          itemBuilder: (context, index) {
            final zone = zones[index];
            return Container(
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.04),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                leading: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: zone.active ? Colors.blueAccent.withOpacity(0.2) : Colors.grey.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.location_on, color: zone.active ? Colors.blueAccent : Colors.grey),
                ),
                title: Text(zone.zoneName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                subtitle: Text('Radius: ${zone.radius.toInt()}m', style: const TextStyle(color: Colors.white54)),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Switch(
                      value: zone.active,
                      activeColor: const Color(0xFFFF5F8A),
                      onChanged: (val) => _safeZoneService.toggleSafeZone(zone.id, val),
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit, color: Colors.blueAccent),
                      onPressed: () async {
                        final result = await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => SafeZoneMapScreen(
                              initialLocation: LatLng(zone.latitude, zone.longitude),
                              initialName: zone.zoneName,
                              initialRadius: zone.radius,
                            ),
                          ),
                        );
                        if (result != null) {
                          final updatedZone = SafeZone(
                            id: zone.id,
                            childId: zone.childId,
                            guardianId: zone.guardianId,
                            zoneName: result['name'],
                            latitude: result['latitude'],
                            longitude: result['longitude'],
                            radius: result['radius'],
                            active: zone.active,
                            createdAt: zone.createdAt,
                          );
                          await _safeZoneService.updateSafeZone(updatedZone);
                        }
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete, color: Colors.redAccent),
                      onPressed: () => _safeZoneService.deleteSafeZone(zone.id),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildAlertsTab() {
    return StreamBuilder<List<BoundaryAlert>>(
      stream: _safeZoneService.getBoundaryAlerts(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: Color(0xFFFF5F8A)));
        }

        final alerts = snapshot.data ?? [];

        return Column(
          children: [
            _buildRealTimeStatus(alerts),
            const Divider(color: Colors.white10, height: 1),
            Expanded(
              child: alerts.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.notifications_none, size: 64, color: Colors.white24),
                          const SizedBox(height: 16),
                          const Text('No recent boundary alerts.', style: TextStyle(color: Colors.white54, fontSize: 16)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(24),
                      itemCount: alerts.length,
                      itemBuilder: (context, index) {
                        final alert = alerts[index];
                        final isEntry = alert.type.toLowerCase() == 'entered' || alert.type.toLowerCase() == 'inside';
                        
                        return Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.04),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.white.withOpacity(0.08)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: isEntry ? Colors.green.withOpacity(0.15) : Colors.red.withOpacity(0.15),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  isEntry ? Icons.login : Icons.logout,
                                  color: isEntry ? Colors.greenAccent : Colors.redAccent,
                                ),
                              ),
                              const SizedBox(width: 20),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '${alert.timestamp.toLocal().toString().split('.')[0]} → ${isEntry ? 'Entered' : 'Exited'} ${alert.zoneName}',
                                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Target ID: ${alert.childId}',
                                      style: const TextStyle(color: Colors.white54, fontSize: 13),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildRealTimeStatus(List<BoundaryAlert> alerts) {
    Map<String, BoundaryAlert> latestAlertPerZone = {};
    for (var alert in alerts) {
      if (!latestAlertPerZone.containsKey(alert.zoneId)) {
        latestAlertPerZone[alert.zoneId] = alert;
      }
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      color: Colors.black.withOpacity(0.2),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Real-Time Status', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          if (latestAlertPerZone.isEmpty)
             const Text('No status available', style: TextStyle(color: Colors.white54)),
          ...latestAlertPerZone.values.map((alert) {
            final isInside = alert.type.toLowerCase() == 'entered' || alert.type.toLowerCase() == 'inside';
            return Padding(
              padding: const EdgeInsets.only(bottom: 12.0),
              child: Row(
                children: [
                  Icon(
                    isInside ? Icons.check_circle : Icons.warning_rounded,
                    color: isInside ? Colors.greenAccent : Colors.redAccent,
                    size: 22,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    '${alert.zoneName}: ',
                    style: const TextStyle(color: Colors.white70, fontSize: 16),
                  ),
                  Text(
                    isInside ? '🟢 Inside Boundary' : '🔴 Outside Boundary',
                    style: TextStyle(
                      color: isInside ? Colors.greenAccent : Colors.redAccent,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ],
      ),
    );
  }
}
