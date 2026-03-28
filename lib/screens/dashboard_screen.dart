import 'dart:ui';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class GuardianDashboardScreen extends StatelessWidget {
  const GuardianDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      Future.microtask(
        () => Navigator.pushReplacementNamed(context, '/login'),
      );
      return const Scaffold(
        backgroundColor: Color(0xFF03010A),
        body: Center(child: CircularProgressIndicator(color: Color(0xFFFF5F8A))),
      );
    }

    final userId = user.uid;

    return Scaffold(
      backgroundColor: const Color(0xFF03010A),
      extendBodyBehindAppBar: true,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(70),
        child: ClipRRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
            child: AppBar(
              backgroundColor: const Color(0xFF03010A).withOpacity(0.5),
              elevation: 0,
              centerTitle: false,
              titleSpacing: 24,
              bottom: PreferredSize(
                preferredSize: const Size.fromHeight(1),
                child: Container(
                  height: 1,
                  color: Colors.white.withOpacity(0.05),
                ),
              ),
              title: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        colors: [Color(0xFFFF5F8A), Color(0xFFFF8FA5)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFFF5F8A).withOpacity(0.4),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.shield_moon, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 14),
                  const Text(
                    'Shrimati Setu Guardian',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 18,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
              actions: [
                Padding(
                  padding: const EdgeInsets.only(right: 16),
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
                      style: TextStyle(color: Colors.white70, fontWeight: FontWeight.w600),
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
      ),
      body: _UserDetailPanel(userId: userId),
    );
  }
}

class _UserDetailPanel extends StatelessWidget {
  final String userId;
  const _UserDetailPanel({required this.userId});

  @override
  Widget build(BuildContext context) {
    final sosQuery = FirebaseFirestore.instance
        .collection('users')
        .doc(userId)
        .collection('sos_events')
        .orderBy('time', descending: true)
        .limit(1);

    final liveLocationRef = FirebaseFirestore.instance
        .collection('users')
        .doc(userId)
        .collection('live_location');

    final recordingsQuery = FirebaseFirestore.instance
        .collection('users')
        .doc(userId)
        .collection('incidents')
        .orderBy('time', descending: true)
        .limit(10);

    final size = MediaQuery.of(context).size;

    return Stack(
      children: [
        // Background Glowing Orbs
        Positioned(
          top: -size.height * 0.1,
          left: -size.width * 0.2,
          child: Container(
            width: size.width * 0.6,
            height: size.height * 0.6,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFFFF5F8A).withOpacity(0.12),
            ),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 140, sigmaY: 140),
              child: Container(color: Colors.transparent),
            ),
          ),
        ),
        Positioned(
          bottom: -size.height * 0.1,
          right: -size.width * 0.1,
          child: Container(
            width: size.width * 0.5,
            height: size.height * 0.5,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFF5F65FF).withOpacity(0.12),
            ),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 140, sigmaY: 140),
              child: Container(color: Colors.transparent),
            ),
          ),
        ),

        // Foreground Scrollable Content
        SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header details
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.radar_rounded, color: Colors.white, size: 24),
                    ),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Real-Time Safety Overview',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.3,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Monitoring active SOS, live locations, and evidence blocks.',
                          style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 30),

                // Top cards
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 5,
                      child: _GlassCard(
                        padding: const EdgeInsets.all(24),
                        child: StreamBuilder<QuerySnapshot>(
                          stream: sosQuery.snapshots(),
                          builder: (context, snapshot) {
                            if (snapshot.connectionState == ConnectionState.waiting) {
                              return const _CardLoader(label: 'Fetching SOS...');
                            }

                            if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                              return const _CardEmptyState(
                                title: 'No SOS Data',
                                subtitle: 'Everything is fine. The latest SOS will appear here.',
                                icon: Icons.verified_user_rounded,
                                iconColor: Colors.greenAccent,
                              );
                            }

                            final doc = snapshot.data!.docs.first;
                            final data = doc.data() as Map<String, dynamic>? ?? {};
                            final time = data['time'];
                            final triggerType = (data['triggerType'] ?? 'Unknown').toString();
                            final status = (data['status'] ?? 'Pending').toString();
                            final lat = data['lat'];
                            final lng = data['lng'];
                            final address = (data['address'] ?? 'Not available').toString();
                            final mapLink = (data['map'] ?? '').toString();

                            String timeText = '';
                            if (time != null && time is Timestamp) {
                              timeText = time.toDate().toLocal().toString().split('.').first;
                            }

                            Color statusColor = Colors.redAccent;
                            bool isResolved = false;
                            switch (status.toLowerCase()) {
                              case 'resolved':
                                statusColor = Colors.greenAccent;
                                isResolved = true;
                                break;
                              case 'in_progress':
                                statusColor = Colors.orangeAccent;
                                break;
                              default:
                                statusColor = const Color(0xFFFF416C);
                            }

                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const _CardTitle(
                                      title: 'Latest SOS Alert',
                                      icon: Icons.emergency_share_rounded,
                                      accent: Color(0xFFFF416C),
                                    ),
                                    if (!isResolved)
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: statusColor.withOpacity(0.15),
                                          borderRadius: BorderRadius.circular(20),
                                          border: Border.all(color: statusColor.withOpacity(0.3)),
                                        ),
                                        child: Row(
                                          children: [
                                            Container(
                                              width: 8, height: 8,
                                              decoration: BoxDecoration(
                                                color: statusColor,
                                                shape: BoxShape.circle,
                                                boxShadow: [
                                                  BoxShadow(color: statusColor, blurRadius: 4),
                                                ],
                                              ),
                                            ),
                                            const SizedBox(width: 6),
                                            Text(
                                              status.toUpperCase(),
                                              style: TextStyle(
                                                color: statusColor, fontSize: 11, fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                  ],
                                ),
                                const SizedBox(height: 24),
                                _InfoRow('Time', timeText),
                                _InfoRow('Trigger', triggerType),
                                _InfoRow('Location', lat != null && lng != null ? '$lat, $lng' : 'Not available'),
                                _InfoRow('Address', address),
                                const SizedBox(height: 24),
                                if (mapLink.isNotEmpty)
                                  SizedBox(
                                    width: double.infinity,
                                    child: ElevatedButton.icon(
                                      onPressed: () {},
                                      icon: const Icon(Icons.map_rounded, size: 18),
                                      label: const Text('Open Coordinates in Maps'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.white.withOpacity(0.1),
                                        foregroundColor: Colors.white,
                                        elevation: 0,
                                        padding: const EdgeInsets.symmetric(vertical: 14),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(14),
                                        ),
                                      ),
                                    ),
                                  ),
                              ],
                            );
                          },
                        ),
                      ),
                    ),
                    const SizedBox(width: 24),
                    Expanded(
                      flex: 4,
                      child: _GlassCard(
                        padding: const EdgeInsets.all(24),
                        child: StreamBuilder<QuerySnapshot>(
                          stream: liveLocationRef.snapshots(),
                          builder: (context, snapshot) {
                            if (snapshot.connectionState == ConnectionState.waiting) {
                              return const _CardLoader(label: 'Linking satellite...');
                            }

                            if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                              return const _CardEmptyState(
                                title: 'No Live Tracking',
                                subtitle: 'Subject currently offline or tracking disabled.',
                                icon: Icons.location_off_rounded,
                                iconColor: Colors.white38,
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
                            
                            final doc = docs.first;
                            final data = doc.data() as Map<String, dynamic>? ?? {};
                            final lat = data['lat'];
                            final lng = data['lng'];
                            final lastUpdated = data['updatedAt'] ?? data['time'];

                            String timeText = '';
                            if (lastUpdated != null && lastUpdated is Timestamp) {
                              final dt = lastUpdated.toDate().toLocal();
                              timeText = '${dt.hour}:${dt.minute.toString().padLeft(2, '0')}:${dt.second.toString().padLeft(2, '0')}';
                            }

                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const _CardTitle(
                                  title: 'Live Telemetry',
                                  icon: Icons.my_location_rounded,
                                  accent: Colors.lightBlueAccent,
                                ),
                                const SizedBox(height: 24),
                                _InfoRow('Coordinates', lat != null && lng != null ? '$lat, $lng' : 'Unknown'),
                                _InfoRow('Last ping', timeText),
                                const SizedBox(height: 32),
                                Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(14),
                                    color: Colors.lightBlueAccent.withOpacity(0.08),
                                    border: Border.all(color: Colors.lightBlueAccent.withOpacity(0.15)),
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(6),
                                        decoration: BoxDecoration(
                                          color: Colors.lightBlueAccent.withOpacity(0.2),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(Icons.info_outline, color: Colors.lightBlueAccent, size: 16),
                                      ),
                                      const SizedBox(width: 12),
                                      const Expanded(
                                        child: Text(
                                          'Active polling keeps these coordinates alive in real-time.',
                                          style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            );
                          },
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                // Incidents
                _GlassCard(
                  padding: EdgeInsets.zero,
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const _CardTitle(
                                title: 'Encrypted Media Vault',
                                icon: Icons.mic_external_on_rounded,
                                accent: Color(0xFFC765FF),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Audio and video stream dumps recorded automatically on SOS events.',
                                style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                        const Divider(height: 1, color: Colors.white10),
                        StreamBuilder<QuerySnapshot>(
                          stream: recordingsQuery.snapshots(),
                            builder: (context, snapshot) {
                              if (snapshot.connectionState == ConnectionState.waiting) {
                                return const Center(
                                  child: CircularProgressIndicator(color: Color(0xFFC765FF)),
                                );
                              }

                              if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                                return const _CardEmptyState(
                                  title: 'Vault is Empty',
                                  subtitle: 'No incidents recorded currently.',
                                  icon: Icons.shield_rounded,
                                  iconColor: Colors.white24,
                                );
                              }

                              final docs = snapshot.data!.docs;
                              return ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                padding: const EdgeInsets.all(12),
                                itemCount: docs.length,
                                separatorBuilder: (_, __) => const SizedBox(height: 8),
                                itemBuilder: (context, index) {
                                  final doc = docs[index];
                                  final data = doc.data() as Map<String, dynamic>? ?? {};
                                  final type = (data['type'] ?? 'Unknown format').toString();
                                  final url = (data['url'] ?? '').toString();
                                  final notes = (data['notes'] ?? '').toString();
                                  final time = data['time'];

                                  String timeText = '';
                                  if (time != null && time is Timestamp) {
                                    timeText = time.toDate().toLocal().toString().split('.').first;
                                  }

                                  final isVideo = type.toLowerCase().contains('video');

                                  return Container(
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.02),
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: Colors.white.withOpacity(0.04)),
                                    ),
                                    child: ListTile(
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                      leading: Container(
                                        padding: const EdgeInsets.all(12),
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          gradient: LinearGradient(
                                            colors: isVideo
                                                ? [const Color(0xFFC765FF).withOpacity(0.2), const Color(0xFF9147FF).withOpacity(0.2)]
                                                : [Colors.orangeAccent.withOpacity(0.2), Colors.deepOrangeAccent.withOpacity(0.2)],
                                            begin: Alignment.topLeft,
                                            end: Alignment.bottomRight,
                                          ),
                                          boxShadow: [
                                            BoxShadow(
                                              color: (isVideo ? const Color(0xFFC765FF) : Colors.orangeAccent).withOpacity(0.15),
                                              blurRadius: 8,
                                            ),
                                          ],
                                        ),
                                        child: Icon(
                                          isVideo ? Icons.videocam_rounded : Icons.mic_rounded,
                                          color: isVideo ? const Color(0xFFE2A1FF) : Colors.orangeAccent,
                                          size: 22,
                                        ),
                                      ),
                                      title: Text(
                                        type,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w600,
                                          fontSize: 15,
                                        ),
                                      ),
                                      subtitle: Padding(
                                        padding: const EdgeInsets.only(top: 6),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                const Icon(Icons.access_time_rounded, size: 12, color: Colors.white38),
                                                const SizedBox(width: 4),
                                                Text(timeText, style: const TextStyle(color: Colors.white54, fontSize: 12)),
                                              ],
                                            ),
                                            if (notes.isNotEmpty) ...[
                                              const SizedBox(height: 6),
                                              Text(notes, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                                            ],
                                          ],
                                        ),
                                      ),
                                      trailing: url.isNotEmpty
                                          ? OutlinedButton.icon(
                                              onPressed: () {},
                                              icon: const Icon(Icons.play_arrow_rounded, size: 18),
                                              label: const Text('Play'),
                                              style: OutlinedButton.styleFrom(
                                                foregroundColor: const Color(0xFFC765FF),
                                                side: const BorderSide(color: Color(0xFFC765FF), width: 1.5),
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                              ),
                                            )
                                          : const SizedBox.shrink(),
                                    ),
                                  );
                                },
                              );
                            },
                          ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  const _GlassCard({required this.child, this.padding = EdgeInsets.zero});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.04),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white.withOpacity(0.08), width: 1),
          ),
          padding: padding,
          child: child,
        ),
      ),
    );
  }
}

class _CardTitle extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color accent;
  const _CardTitle({required this.title, required this.icon, required this.accent});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: accent.withOpacity(0.15),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: accent.withOpacity(0.3)),
          ),
          child: Icon(icon, color: accent, size: 18),
        ),
        const SizedBox(width: 12),
        Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w700,
            fontSize: 16,
            letterSpacing: 0.3,
          ),
        ),
      ],
    );
  }
}

class _CardLoader extends StatelessWidget {
  final String label;
  const _CardLoader({required this.label});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40),
        child: Column(
          children: [
            const CircularProgressIndicator(color: Colors.white38, strokeWidth: 2.5),
            const SizedBox(height: 16),
            Text(label, style: const TextStyle(color: Colors.white54, fontSize: 13, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}

class _CardEmptyState extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color iconColor;
  const _CardEmptyState({
    required this.title,
    required this.subtitle,
    required this.icon,
    this.iconColor = Colors.white24,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: iconColor.withOpacity(0.1),
              ),
              child: Icon(icon, color: iconColor, size: 36),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16, letterSpacing: 0.3),
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white54, fontSize: 13, height: 1.4),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 90,
            child: Text(
              label,
              style: const TextStyle(color: Colors.white54, fontSize: 13, fontWeight: FontWeight.w500),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600, height: 1.3),
            ),
          ),
        ],
      ),
    );
  }
}
