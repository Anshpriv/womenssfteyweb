import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Bell, 
  Plus, 
  MapPin, 
  Edit3, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle, 
  AlertTriangle, 
  LogIn, 
  LogOut, 
  Clock,
  Sparkles,
  Radio
} from 'lucide-react';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import SafeZoneMapModal from '../components/SafeZoneMapModal';

export default function SafeZones({ user }) {
  const [activeTab, setActiveTab] = useState('zones'); // 'zones' | 'alerts'
  const [safeZones, setSafeZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [boundaryAlerts, setBoundaryAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);

  // Stream Safe Zones for this guardian
  useEffect(() => {
    if (!user?.uid) return;
    const zonesRef = collection(db, 'safe_zones');
    const q = query(zonesRef, where('guardianId', '==', user.uid));

    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setSafeZones(docs);
      setZonesLoading(false);
    }, (err) => {
      console.error("Safe zones stream error:", err);
      setZonesLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Stream Boundary Alerts
  useEffect(() => {
    const alertsRef = collection(db, 'boundary_alerts');
    const q = query(alertsRef, orderBy('timestamp', 'desc'), limit(50));

    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setBoundaryAlerts(docs);
      setAlertsLoading(false);
    }, (err) => {
      console.error("Boundary alerts stream error:", err);
      setAlertsLoading(false);
    });
    return () => unsub();
  }, []);

  // Handle Create or Update Safe Zone
  const handleSaveZone = async (zoneData) => {
    try {
      if (editingZone) {
        // Update
        const zoneRef = doc(db, 'safe_zones', editingZone.id);
        await updateDoc(zoneRef, {
          zoneName: zoneData.zoneName,
          latitude: zoneData.latitude,
          longitude: zoneData.longitude,
          radius: zoneData.radius
        });
      } else {
        // Create
        await addDoc(collection(db, 'safe_zones'), {
          childId: 'child_placeholder',
          guardianId: user.uid,
          zoneName: zoneData.zoneName,
          latitude: zoneData.latitude,
          longitude: zoneData.longitude,
          radius: zoneData.radius,
          active: true,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      setEditingZone(null);
    } catch (err) {
      console.error("Save safe zone error:", err);
      alert("Failed to save safe zone: " + err.message);
    }
  };

  // Toggle active status
  const handleToggleActive = async (zoneId, currentActive) => {
    try {
      const zoneRef = doc(db, 'safe_zones', zoneId);
      await updateDoc(zoneRef, { active: !currentActive });
    } catch (err) {
      console.error("Toggle safe zone error:", err);
    }
  };

  // Delete Safe Zone
  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm("Are you sure you want to delete this safe zone?")) return;
    try {
      await deleteDoc(doc(db, 'safe_zones', zoneId));
    } catch (err) {
      console.error("Delete safe zone error:", err);
    }
  };

  // Calculate Real-Time status overview per zone from latest alerts
  const latestStatusPerZone = {};
  boundaryAlerts.forEach(alert => {
    if (alert.zoneId && !latestStatusPerZone[alert.zoneId]) {
      latestStatusPerZone[alert.zoneId] = alert;
    }
  });

  const formatTimestamp = (ts) => {
    if (!ts) return 'Just now';
    if (ts.toDate) return ts.toDate().toLocaleString();
    if (typeof ts === 'string' || typeof ts === 'number') return new Date(ts).toLocaleString();
    return String(ts);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header & Tabs Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Safe Zone & Geofence Management
            <Sparkles className="w-4 h-4 text-[#FF5F8A]" />
          </h2>
          <p className="text-xs text-slate-600">
            Define dynamic safety perimeters and monitor real-time boundary entry/exit alerts.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 sm:p-1.5 rounded-2xl bg-white/70 border border-slate-200 shrink-0 backdrop-blur-md w-full md:w-auto">
          <button
            onClick={() => setActiveTab('zones')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              activeTab === 'zones'
                ? 'bg-gradient-to-r from-[#FF5F8A] to-purple-600 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Safe Zones ({safeZones.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              activeTab === 'alerts'
                ? 'bg-gradient-to-r from-[#FF5F8A] to-purple-600 text-white shadow-md'
                : 'text-purple-700 hover:text-purple-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alerts ({boundaryAlerts.length})</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'zones' ? (
        <div className="space-y-6">
          
          {/* Add Zone Action Bar */}
          <div className="flex justify-between items-center gap-2">
            <p className="text-xs font-semibold text-slate-700">
              Active Geofence Perimeters
            </p>
            <button
              onClick={() => {
                setEditingZone(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-[#FF5F8A] to-[#D63162] hover:opacity-90 shadow-lg shadow-[#FF5F8A]/25 transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Safe Zone</span>
            </button>
          </div>

          {/* Zones List */}
          {zonesLoading ? (
            <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-2 border-[#FF5F8A] border-t-transparent rounded-full animate-spin" />
              <span>Fetching safe zone configs...</span>
            </div>
          ) : safeZones.length === 0 ? (
            <div className="glass-panel p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/80 text-slate-400 mx-auto flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Safe Zones Configured</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Set up geofenced boundaries like home, work, or college to receive instant boundary alerts.
              </p>
              <button
                onClick={() => {
                  setEditingZone(null);
                  setIsModalOpen(true);
                }}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 transition-colors active:scale-95"
              >
                <Plus className="w-4 h-4 text-[#FF5F8A]" />
                Create First Zone
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeZones.map((zone) => (
                <div 
                  key={zone.id}
                  className="glass-panel glass-panel-hover p-5 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-2.5 sm:p-3 rounded-2xl shrink-0 ${
                        zone.active ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                          {zone.zoneName}
                        </h4>
                        <span className="text-xs text-slate-500 font-mono">
                          Radius: <strong className="text-slate-800">{Math.round(zone.radius)}m</strong>
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <button
                      onClick={() => handleToggleActive(zone.id, zone.active)}
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 active:scale-95 ${
                        zone.active
                          ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {zone.active ? (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/80 border border-slate-200 text-xs font-mono text-slate-500 flex items-center justify-between">
                    <span>Coordinates</span>
                    <span className="text-slate-900 font-medium">
                      {zone.latitude?.toFixed(4)}, {zone.longitude?.toFixed(4)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setEditingZone(zone);
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-white transition-colors flex items-center gap-1.5 text-xs font-semibold active:scale-95"
                    >
                      <Edit3 className="w-4 h-4 text-sky-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone.id)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5 text-xs font-semibold active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      ) : (
        /* Boundary Alerts Tab */
        <div className="space-y-6">
          
          {/* Real-time Status Panel */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#FF5F8A] animate-pulse" />
              Live Boundary Telemetry Summary
            </h3>
            
            {Object.keys(latestStatusPerZone).length === 0 ? (
              <p className="text-xs text-slate-500 font-medium">No live telemetry reports registered yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(latestStatusPerZone).map((alert) => {
                  const isInside = alert.type?.toLowerCase() === 'entered' || alert.type?.toLowerCase() === 'inside';
                  return (
                    <div 
                      key={alert.id}
                      className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-3 ${
                        isInside 
                          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50/90 border-rose-200 text-rose-800'
                      }`}
                    >
                      {isInside ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <div className="overflow-hidden">
                        <span className="text-slate-900 block font-bold truncate">{alert.zoneName}</span>
                        <span>{isInside ? 'Inside Boundary' : 'Outside Boundary'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Alerts Feed */}
          {alertsLoading ? (
            <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span>Streaming boundary alert logs...</span>
            </div>
          ) : boundaryAlerts.length === 0 ? (
            <div className="glass-panel p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl space-y-3">
              <Bell className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">No Recent Boundary Alerts</h4>
              <p className="text-xs text-slate-500">
                Log events will appear automatically when safe boundaries are entered or crossed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {boundaryAlerts.map((alert) => {
                const isEntry = alert.type?.toLowerCase() === 'entered' || alert.type?.toLowerCase() === 'inside';
                return (
                  <div 
                    key={alert.id}
                    className="glass-panel p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 sm:gap-4"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        isEntry ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}>
                        {isEntry ? <LogIn className="w-4 h-4 sm:w-5 sm:h-5" /> : <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {isEntry ? 'Entered' : 'Exited'} {alert.zoneName || 'Safe Zone'}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          {formatTimestamp(alert.timestamp)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs shrink-0">
                      <span className="text-slate-400 block text-[10px]">Target ID</span>
                      <span className="text-slate-800 font-semibold text-[11px] sm:text-xs">{alert.childId || 'Protected User'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Map Config Modal */}
      {isModalOpen && (
        <SafeZoneMapModal 
          initialData={editingZone}
          onSave={handleSaveZone}
          onClose={() => {
            setIsModalOpen(false);
            setEditingZone(null);
          }}
        />
      )}

    </div>
  );
}
