import 'dart:ui';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher_string.dart';

class GuardianDashboardScreen extends StatelessWidget {
  const GuardianDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    final isMobile = MediaQuery.of(context).size.width < 768;

    if (user == null) {
      Future.microtask(
        () => Navigator.pushReplacementNamed(context, '/login'),
      );
      return const Scaffold(
        backgroundColor: Color(0xFF0A0015),
        body: Center(child: CircularProgressIndicator(color: Color(0xFFFF5F8A))),
      );
    }

    final userId = user.uid;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0015),
      extendBodyBehindAppBar: true,
      appBar: isMobile ? _buildMobileAppBar(context) : _buildDesktopAppBar(context),
      drawer: isMobile ? _buildDrawer(context) : null,
      body: _UserDetailPanel(userId: userId),
    );
  }

  PreferredSize _buildDesktopAppBar(BuildContext context) {
    return PreferredSize(
      preferredSize: const Size.fromHeight(70),
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
          child: AppBar(
            backgroundColor: const Color(0xFF0A0015).withOpacity(0.7),
            elevation: 0,
            centerTitle: false,
            titleSpacing: 24,
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(1),
              child: Container(
                height: 1,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.white.withOpacity(0.1), Colors.transparent],
                  ),
                ),
              ),
            ),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      colors: [Color(0xFFFF5F8A), Color(0xFFFF1744)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFFF5F8A).withOpacity(0.5),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.security_rounded, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'SHRIMATI GUARDIAN',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 16,
                        letterSpacing: 1.2,
                      ),
                    ),
                    Text(
                      'Safety Intelligence Network',
                      style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12, letterSpacing: 0.5),
                    ),
                  ],
                ),
              ],
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.only(right: 24),
                child: TextButton.icon(
                  onPressed: () async {
                    await FirebaseAuth.instance.signOut();
                    if (context.mounted) {
                      Navigator.pushReplacementNamed(context, '/login');
                    }
                  },
                  icon: const Icon(Icons.logout_rounded, color: Colors.white70, size: 20),
                  label: const Text(
                    'Logout',
                    style: TextStyle(color: Colors.white70, fontWeight: FontWeight.w700, letterSpacing: 0.5),
                  ),
                  style: TextButton.styleFrom(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  PreferredSize _buildMobileAppBar(BuildContext context) {
    return PreferredSize(
      preferredSize: const Size.fromHeight(60),
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
          child: AppBar(
            backgroundColor: const Color(0xFF0A0015).withOpacity(0.8),
            elevation: 0,
            centerTitle: true,
            title: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'SHRIMATI',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 14,
                    letterSpacing: 1,
                  ),
                ),
                Text(
                  'GUARDIAN',
                  style: TextStyle(
                    color: const Color(0xFFFF5F8A),
                    fontWeight: FontWeight.w700,
                    fontSize: 10,
                    letterSpacing: 1.2,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Drawer _buildDrawer(BuildContext context) {
    return Drawer(
      backgroundColor: const Color(0xFF0A0015),
      child: SafeArea(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [const Color(0xFFFF5F8A).withOpacity(0.2), const Color(0xFF9D65FF).withOpacity(0.2)],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        colors: [Color(0xFFFF5F8A), Color(0xFFFF1744)],
                      ),
                    ),
                    child: const Icon(Icons.security_rounded, color: Colors.white, size: 28),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'SHRIMATI GUARDIAN',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 0.5),
                  ),
                  Text(
                    'Safety Intelligence',
                    style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12),
                  ),
                ],
              ),
            ),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.all(16),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () async {
                    await FirebaseAuth.instance.signOut();
                    if (context.mounted) {
                      Navigator.pushReplacementNamed(context, '/login');
                    }
                  },
                  icon: const Icon(Icons.logout_rounded),
                  label: const Text('Logout'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF5F8A),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}


class _UserDetailPanel extends StatefulWidget {
  final String userId;
  const _UserDetailPanel({required this.userId});

  @override
  State<_UserDetailPanel> createState() => _UserDetailPanelState();
}

class _UserDetailPanelState extends State<_UserDetailPanel> {
  late Future<List<_StorageVideoFile>> _storageVideosFuture;

  @override
  void initState() {
    super.initState();
    _storageVideosFuture = _loadUserStorageVideos(widget.userId);
  }

  @override
  void didUpdateWidget(covariant _UserDetailPanel oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.userId != widget.userId) {
      _storageVideosFuture = _loadUserStorageVideos(widget.userId);
    }
  }

  Future<void> _openStorageUrl(String url) async {
    final success = await launchUrlString(url, mode: LaunchMode.externalApplication);
    if (!success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open video URL')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 768;
    final isTablet = MediaQuery.of(context).size.width < 1200;
    final size = MediaQuery.of(context).size;

    final sosQuery = FirebaseFirestore.instance
        .collection('users')
        .doc(widget.userId)
        .collection('sos_events')
        .orderBy('time', descending: true)
        .limit(1);

    final liveLocationRef = FirebaseFirestore.instance
        .collection('users')
        .doc(widget.userId)
        .collection('live_location');

    final recordingsQuery = FirebaseFirestore.instance
        .collection('users')
        .doc(widget.userId)
        .collection('incidents')
        .orderBy('time', descending: true)
        .limit(10);

    return Container(
      decoration: BoxDecoration(
        gradient: RadialGradient(
          center: Alignment.topLeft,
          radius: 1.5,
          colors: [
            const Color(0xFF1A0033).withOpacity(0.6),
            const Color(0xFF0A0015),
          ],
        ),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(
            horizontal: isMobile ? 16 : 32,
            vertical: isMobile ? 16 : 24,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Banner
              _AnimatedCard(
                child: Container(
                  padding: EdgeInsets.all(isMobile ? 20 : 24),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        const Color(0xFFFF5F8A).withOpacity(0.15),
                        const Color(0xFF9D65FF).withOpacity(0.1),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: const Color(0xFFFF5F8A).withOpacity(0.3),
                      width: 1.5,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: const LinearGradient(
                                colors: [Color(0xFFFF5F8A), Color(0xFFFF1744)],
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFFFF5F8A).withOpacity(0.4),
                                  blurRadius: 12,
                                ),
                              ],
                            ),
                            child: const Icon(Icons.shield_rounded, color: Colors.white, size: 24),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Welcome to SHRIMATI GUARDIAN',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Your safety, our priority',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.7),
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(height: isMobile ? 20 : 28),

              // Status Cards Grid
              if (isMobile)
                Column(
                  children: [
                    _buildSOSCard(sosQuery, isMobile),
                    const SizedBox(height: 16),
                    _buildLocationCard(liveLocationRef, isMobile),
                  ],
                )
              else
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: _buildSOSCard(sosQuery, isMobile)),
                    const SizedBox(width: 20),
                    Expanded(child: _buildLocationCard(liveLocationRef, isMobile)),
                  ],
                ),
              SizedBox(height: isMobile ? 20 : 28),

              // Incidents Section
              _buildMediaVaultCard(recordingsQuery, isMobile),
              SizedBox(height: isMobile ? 20 : 28),

              // Cloud Storage Videos
              _buildStorageVideosCard(isMobile),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSOSCard(Query sosQuery, bool isMobile) {
    return _AnimatedCard(
      child: StreamBuilder<QuerySnapshot>(
        stream: sosQuery.snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Container(
              padding: const EdgeInsets.all(24),
              child: const Center(
                child: CircularProgressIndicator(color: Color(0xFFFF5F8A)),
              ),
            );
          }

          if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
            return _buildEmptyCard(
              title: 'All Safe',
              subtitle: 'No active SOS alerts',
              icon: Icons.check_circle_rounded,
              color: Colors.greenAccent,
              isMobile: isMobile,
            );
          }

          final doc = snapshot.data!.docs.first;
          final data = doc.data() as Map<String, dynamic>? ?? {};
          final time = data['time'];
          final triggerType = (data['triggerType'] ?? 'Unknown').toString();
          final status = (data['status'] ?? 'Pending').toString();
          final address = (data['address'] ?? 'Not available').toString();

          String timeText = '';
          if (time != null && time is Timestamp) {
            timeText = time.toDate().toLocal().toString().split('.').first;
          }

          Color statusColor = Colors.redAccent;
          IconData statusIcon = Icons.emergency_share_rounded;
          switch (status.toLowerCase()) {
            case 'resolved':
              statusColor = Colors.greenAccent;
              statusIcon = Icons.check_circle_rounded;
              break;
            case 'in_progress':
              statusColor = Colors.orangeAccent;
              statusIcon = Icons.pending_actions_rounded;
              break;
            default:
              statusColor = const Color(0xFFFF416C);
              statusIcon = Icons.emergency_share_rounded;
          }

          return Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [statusColor.withOpacity(0.1), statusColor.withOpacity(0.05)],
              ),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: statusColor.withOpacity(0.3), width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: statusColor.withOpacity(0.2),
                      ),
                      child: Icon(statusIcon, color: statusColor, size: 24),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'SOS Status',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.5,
                            ),
                          ),
                          Text(
                            status.toUpperCase(),
                            style: TextStyle(
                              color: statusColor,
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                _buildInfoChip('Type', triggerType),
                const SizedBox(height: 10),
                _buildInfoChip('Location', address),
                const SizedBox(height: 10),
                _buildInfoChip('Time', timeText),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildLocationCard(Query liveLocationRef, bool isMobile) {
    return _AnimatedCard(
      child: StreamBuilder<QuerySnapshot>(
        stream: liveLocationRef.snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Container(
              padding: const EdgeInsets.all(24),
              child: const Center(
                child: CircularProgressIndicator(color: Colors.lightBlueAccent),
              ),
            );
          }

          if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
            return _buildEmptyCard(
              title: 'Offline',
              subtitle: 'No live location available',
              icon: Icons.location_off_rounded,
              color: Colors.blueGrey,
              isMobile: isMobile,
            );
          }

          final docs = snapshot.data!.docs.toList();
          docs.sort((a, b) {
            final aData = a.data() as Map<String, dynamic>? ?? {};
            final bData = b.data() as Map<String, dynamic>? ?? {};
            final aTime = aData['updatedAt'] ?? aData['time'];
            final bTime = bData['updatedAt'] ?? bData['time'];
            if (aTime == null || bTime == null) return 0;
            return (bTime as Timestamp).compareTo(aTime as Timestamp);
          });

          final data = docs.first.data() as Map<String, dynamic>? ?? {};
          final lat = data['lat'];
          final lng = data['lng'];
          final lastUpdated = data['updatedAt'] ?? data['time'];

          String timeText = '';
          if (lastUpdated != null && lastUpdated is Timestamp) {
            final dt = lastUpdated.toDate().toLocal();
            timeText = '${dt.hour}:${dt.minute.toString().padLeft(2, '0')}:${dt.second.toString().padLeft(2, '0')}';
          }

          return Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.lightBlueAccent.withOpacity(0.1),
                  Colors.blue.withOpacity(0.05),
                ],
              ),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.lightBlueAccent.withOpacity(0.3), width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.lightBlueAccent.withOpacity(0.2),
                      ),
                      child: const Icon(Icons.my_location_rounded, color: Colors.lightBlueAccent, size: 24),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Live Location',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const Text(
                            'GPS Active',
                            style: TextStyle(
                              color: Colors.lightBlueAccent,
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.lightBlueAccent,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.lightBlueAccent.withOpacity(0.6),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                _buildInfoChip('Latitude', lat?.toString() ?? 'N/A'),
                const SizedBox(height: 10),
                _buildInfoChip('Longitude', lng?.toString() ?? 'N/A'),
                const SizedBox(height: 10),
                _buildInfoChip('Last Update', timeText),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildMediaVaultCard(Query recordingsQuery, bool isMobile) {
    return _AnimatedCard(
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              const Color(0xFFC765FF).withOpacity(0.05),
              const Color(0xFF9147FF).withOpacity(0.05),
            ],
          ),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: const Color(0xFFC765FF).withOpacity(0.2),
            width: 1.5,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFFC765FF).withOpacity(0.2),
                    ),
                    child: const Icon(Icons.video_library_rounded, color: Color(0xFFC765FF), size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Incident Recordings',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          'Encrypted media vault from SOS events',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.6),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: Colors.white10),
            StreamBuilder<QuerySnapshot>(
              stream: recordingsQuery.snapshots(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Padding(
                    padding: EdgeInsets.all(24),
                    child: Center(child: CircularProgressIndicator(color: Color(0xFFC765FF))),
                  );
                }

                if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                  return _buildEmptyCard(
                    title: 'Vault is Empty',
                    subtitle: 'No incidents recorded',
                    icon: Icons.shield_rounded,
                    color: Colors.white24,
                    isMobile: isMobile,
                  );
                }

                final docs = snapshot.data!.docs;
                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(12),
                  itemCount: docs.length,
                  itemBuilder: (context, index) {
                    final doc = docs[index];
                    final data = doc.data() as Map<String, dynamic>? ?? {};
                    final type = (data['type'] ?? 'Unknown').toString();
                    final url = (data['url'] ?? '').toString();
                    final time = data['time'];

                    String timeText = '';
                    if (time != null && time is Timestamp) {
                      timeText = time.toDate().toLocal().toString().split('.').first;
                    }

                    final isVideo = type.toLowerCase().contains('video');

                    return _HoverableCard(
                      onTap: url.isNotEmpty ? () => _openStorageUrl(url) : null,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.03),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.white.withOpacity(0.08)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: LinearGradient(
                                  colors: isVideo
                                      ? [const Color(0xFFC765FF).withOpacity(0.3), const Color(0xFF9147FF).withOpacity(0.2)]
                                      : [Colors.orangeAccent.withOpacity(0.2), Colors.deepOrangeAccent.withOpacity(0.15)],
                                ),
                              ),
                              child: Icon(
                                isVideo ? Icons.videocam_rounded : Icons.mic_rounded,
                                color: isVideo ? const Color(0xFFC765FF) : Colors.orangeAccent,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    type,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14,
                                    ),
                                  ),
                                  Text(
                                    timeText,
                                    style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                            if (url.isNotEmpty)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFC765FF).withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(Icons.play_arrow_rounded, color: Color(0xFFC765FF), size: 18),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStorageVideosCard(bool isMobile) {
    return _AnimatedCard(
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              const Color(0xFF7E64FF).withOpacity(0.05),
              const Color(0xFF5F65FF).withOpacity(0.05),
            ],
          ),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: const Color(0xFF7E64FF).withOpacity(0.2),
            width: 1.5,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFF7E64FF).withOpacity(0.2),
                    ),
                    child: const Icon(Icons.cloud_circle_rounded, color: Color(0xFF7E64FF), size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Cloud Storage',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          'All recordings from Firebase Storage',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.6),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: Colors.white10),
            FutureBuilder<List<_StorageVideoFile>>(
              future: _storageVideosFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Padding(
                    padding: EdgeInsets.all(24),
                    child: Center(child: CircularProgressIndicator(color: Color(0xFF7E64FF))),
                  );
                }

                if (snapshot.hasError) {
                  return _buildEmptyCard(
                    title: 'Storage Error',
                    subtitle: 'Unable to load videos',
                    icon: Icons.cloud_off_rounded,
                    color: Colors.redAccent,
                    isMobile: isMobile,
                  );
                }

                final videos = snapshot.data ?? [];
                if (videos.isEmpty) {
                  return _buildEmptyCard(
                    title: 'No Videos Yet',
                    subtitle: 'Videos will appear here',
                    icon: Icons.cloud_queue_rounded,
                    color: Colors.blueGrey,
                    isMobile: isMobile,
                  );
                }

                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(12),
                  itemCount: videos.length,
                  itemBuilder: (context, index) {
                    final video = videos[index];
                    return _HoverableCard(
                      onTap: () => _openStorageUrl(video.url),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.03),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.white.withOpacity(0.08)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: LinearGradient(
                                  colors: video.isVideo
                                      ? [const Color(0xFF7E64FF).withOpacity(0.3), const Color(0xFF5F65FF).withOpacity(0.2)]
                                      : [Colors.blueAccent.withOpacity(0.2), Colors.lightBlueAccent.withOpacity(0.15)],
                                ),
                              ),
                              child: Icon(
                                video.isVideo ? Icons.videocam_rounded : Icons.insert_drive_file_rounded,
                                color: video.isVideo ? const Color(0xFF7E64FF) : Colors.lightBlueAccent,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    video.title,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14,
                                    ),
                                  ),
                                  Text(
                                    video.path,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: const Color(0xFF7E64FF).withOpacity(0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.play_arrow_rounded, color: Color(0xFF7E64FF), size: 18),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required bool isMobile,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: color.withOpacity(0.15),
            ),
            child: Icon(icon, color: color, size: 32),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              fontSize: 16,
              letterSpacing: 0.3,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoChip(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.white.withOpacity(0.6),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AnimatedCard extends StatefulWidget {
  final Widget child;

  const _AnimatedCard({required this.child});

  @override
  State<_AnimatedCard> createState() => _AnimatedCardState();
}

class _AnimatedCardState extends State<_AnimatedCard> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: const Duration(milliseconds: 600), vsync: this);
    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(CurvedAnimation(parent: _controller, curve: Curves.easeIn));
    _slideAnimation = Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutQuad));
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: widget.child,
      ),
    );
  }
}

class _HoverableCard extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;

  const _HoverableCard({required this.child, this.onTap});

  @override
  State<_HoverableCard> createState() => _HoverableCardState();
}

class _HoverableCardState extends State<_HoverableCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedScale(
          scale: _isHovered ? 1.02 : 1.0,
          duration: const Duration(milliseconds: 200),
          child: AnimatedOpacity(
            opacity: _isHovered ? 0.9 : 1.0,
            duration: const Duration(milliseconds: 200),
            child: widget.child,
          ),
        ),
      ),
    );
  }
}

class _StorageVideoFile {

  final String title;
  final String path;
  final String url;
  final bool isVideo;

  _StorageVideoFile({
    required this.title,
    required this.path,
    required this.url,
  }) : isVideo = title.toLowerCase().contains('mp4') ||
          title.toLowerCase().contains('mov') ||
          title.toLowerCase().contains('webm') ||
          title.toLowerCase().contains('mkv');
}

Future<List<_StorageVideoFile>> _loadUserStorageVideos(String userId) async {
  final rootRef = FirebaseStorage.instance.ref().child('users').child(userId);

  Future<List<Reference>> collect(Reference reference) async {
    final result = await reference.listAll();
    final references = <Reference>[];
    references.addAll(result.items);
    for (final prefix in result.prefixes) {
      references.addAll(await collect(prefix));
    }
    return references;
  }

  try {
    final references = await collect(rootRef);
    final videos = await Future.wait(
      references.map((ref) async {
        final url = await ref.getDownloadURL();
        return _StorageVideoFile(title: ref.name, path: ref.fullPath, url: url);
      }),
    );
    videos.sort((a, b) => a.title.compareTo(b.title));
    return videos;
  } on FirebaseException catch (error) {
    if (error.code == 'object-not-found' || error.code == 'storage/object-not-found') {
      return [];
    }
    rethrow;
  }
}
