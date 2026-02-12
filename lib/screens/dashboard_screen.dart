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
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final userId = user.uid;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Dashboard',
          style: TextStyle(color: Colors.white),
        ),
        actions: [
          IconButton(
            tooltip: 'Logout',
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await FirebaseAuth.instance.signOut();
              if (context.mounted) {
                Navigator.pushReplacementNamed(context, '/login');
              }
            },
          ),
        ],
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
    // Nested structure queries (based on mobile app)
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

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // SOS + Live Location cards
          Row(
            children: [
              Expanded(
                child: Card(
                  color: const Color(0xFF160A2B),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: StreamBuilder<QuerySnapshot>(
                      stream: sosQuery.snapshots(),
                      builder: (context, snapshot) {
                        if (snapshot.connectionState ==
                            ConnectionState.waiting) {
                          return const Center(
                            child: SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.pinkAccent,
                              ),
                            ),
                          );
                        }

                        if (!snapshot.hasData ||
                            snapshot.data!.docs.isEmpty) {
                          return const Text(
                            'No SOS events yet.',
                            style: TextStyle(color: Colors.white70),
                          );
                        }

                        final doc = snapshot.data!.docs.first;
                        final data =
                            doc.data() as Map<String, dynamic>? ?? {};

                        final time = data['time'];
                        final triggerType =
                            (data['triggerType'] ?? 'unknown').toString();
                        final status =
                            (data['status'] ?? 'pending').toString();
                        final lat = data['lat'];
                        final lng = data['lng'];
                        final address =
                            (data['address'] ?? 'N/A').toString();
                        final mapLink =
                            (data['map'] ?? '').toString();

                        String timeText = '';
                        if (time != null && time is Timestamp) {
                          timeText = time.toDate().toLocal().toString();
                        }

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Last SOS',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 12),
                            _InfoRow('Time', timeText),
                            _InfoRow('Trigger', triggerType),
                            _InfoRow('Status', status),
                            _InfoRow(
                              'Location',
                              '$lat, $lng',
                            ),
                            _InfoRow('Address', address),
                            const SizedBox(height: 8),
                            if (mapLink.isNotEmpty)
                              ElevatedButton.icon(
                                onPressed: () {
                                  // TODO: open mapLink in browser
                                },
                                icon: const Icon(Icons.map, size: 16),
                                label: const Text('View on Map'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.pinkAccent,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 8,
                                  ),
                                ),
                              ),
                          ],
                        );
                      },
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Card(
                  color: const Color(0xFF160A2B),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: StreamBuilder<QuerySnapshot>(
                      stream: liveLocationRef.snapshots(),
                      builder: (context, snapshot) {
                        if (snapshot.connectionState ==
                            ConnectionState.waiting) {
                          return const Center(
                            child: SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.pinkAccent,
                              ),
                            ),
                          );
                        }

                        if (!snapshot.hasData ||
                            snapshot.data!.docs.isEmpty) {
                          return const Text(
                            'No live location.',
                            style: TextStyle(color: Colors.white70),
                          );
                        }

                        // Get first/latest document
                        final doc = snapshot.data!.docs.first;
                        final data =
                            doc.data() as Map<String, dynamic>;

                        final lat = data['lat'];
                        final lng = data['lng'];
                        final updatedAt = data['updatedAt'];

                        String timeText = '';
                        if (updatedAt != null &&
                            updatedAt is Timestamp) {
                          timeText =
                              updatedAt.toDate().toLocal().toString();
                        }

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Live Location',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 12),
                            _InfoRow(
                              'Coordinates',
                              '$lat, $lng',
                            ),
                            _InfoRow('Last Update', timeText),
                            const SizedBox(height: 8),
                            const Text(
                              '(Google Maps integration can be added)',
                              style: TextStyle(
                                color: Colors.white38,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Recordings section
          Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'Recent incidents',
              style: Theme.of(context)
                  .textTheme
                  .titleSmall
                  ?.copyWith(color: Colors.white),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: Card(
              color: const Color(0xFF160A2B),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(18),
              ),
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: StreamBuilder<QuerySnapshot>(
                  stream: recordingsQuery.snapshots(),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState ==
                        ConnectionState.waiting) {
                      return const Center(
                        child: SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.pinkAccent,
                          ),
                        ),
                      );
                    }

                    if (!snapshot.hasData ||
                        snapshot.data!.docs.isEmpty) {
                      return const Center(
                        child: Text(
                          'No incidents recorded.',
                          style: TextStyle(color: Colors.white70),
                        ),
                      );
                    }

                    final docs = snapshot.data!.docs;
                    return ListView.separated(
                      itemCount: docs.length,
                      separatorBuilder: (_, __) =>
                          Divider(color: Colors.white12),
                      itemBuilder: (context, index) {
                        final doc = docs[index];
                        final data = doc.data() as Map<String, dynamic>;

                        final time = data['time'];
                        final description =
                            (data['description'] ?? 'No description')
                                .toString();
                        final lat = data['lat'];
                        final lng = data['lng'];

                        String timeText = '';
                        if (time != null && time is Timestamp) {
                          timeText =
                              time.toDate().toLocal().toString();
                        }

                        return ListTile(
                          leading: const Icon(
                            Icons.warning_amber,
                            color: Colors.orangeAccent,
                          ),
                          title: Text(
                            description,
                            style: const TextStyle(color: Colors.white),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          subtitle: Text(
                            timeText,
                            style: const TextStyle(
                              color: Colors.white60,
                              fontSize: 12,
                            ),
                          ),
                          trailing: IconButton(
                            icon: const Icon(
                              Icons.info_outline,
                              color: Colors.white70,
                              size: 20,
                            ),
                            onPressed: () {
                              // Show details dialog
                              showDialog(
                                context: context,
                                builder: (ctx) => AlertDialog(
                                  backgroundColor:
                                      const Color(0xFF160A2B),
                                  title: const Text(
                                    'Incident Details',
                                    style:
                                        TextStyle(color: Colors.white),
                                  ),
                                  content: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Description: $description',
                                        style: const TextStyle(
                                          color: Colors.white70,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        'Time: $timeText',
                                        style: const TextStyle(
                                          color: Colors.white70,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        'Location: $lat, $lng',
                                        style: const TextStyle(
                                          color: Colors.white70,
                                        ),
                                      ),
                                    ],
                                  ),
                                  actions: [
                                    TextButton(
                                      onPressed: () =>
                                          Navigator.pop(ctx),
                                      child: const Text(
                                        'Close',
                                        style: TextStyle(
                                          color: Colors.pinkAccent,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Helper widget for info rows
class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              '$label:',
              style: const TextStyle(
                color: Colors.white60,
                fontSize: 12,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
