import React, { useEffect, useState } from 'react';
import { 
  Radar, 
  ShieldCheck, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Mic, 
  Video, 
  Play, 
  ShieldAlert, 
  Activity,
  Sparkles,
  Lock,
  Phone,
  Droplet,
  FileText,
  RefreshCw,
  Copy,
  Check,
  Battery,
  Wifi
} from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, collection, query, orderBy, limit, where } from 'firebase/firestore';
import MediaModal from '../components/MediaModal';
import { getPublicProfilePhotoUrl, resolveMediaUrl } from '../supabase';

// Leaflet Map Imports
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Glowing Radar Marker Icon for Leaflet
const createPulseIcon = () => {
  return L.divIcon({
    className: 'custom-pulse-marker',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute w-8 h-8 bg-[#FF5F8A]/40 rounded-full animate-ping"></div>
        <div class="absolute w-5 h-5 bg-[#FF5F8A] rounded-full border-2 border-white shadow-lg shadow-[#FF5F8A]/80 flex items-center justify-center">
          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

export default function Dashboard({ user }) {
  const [userData, setUserData] = useState(null);
  const [sosEvent, setSosEvent] = useState(null);
  const [sosLoading, setSosLoading] = useState(true);
  const [liveLocation, setLiveLocation] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [recordingsLoading, setRecordingsLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [copiedGps, setCopiedGps] = useState(false);
  const [activeMediaFilter, setActiveMediaFilter] = useState('all'); // 'all' | 'audio' | 'video'

  // Listen to User document (users/{userId})
  useEffect(() => {
    if (!user?.uid) return;
    const userRef = doc(db, 'users', user.uid);
    const unsub = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.data());
      } else {
        setUserData({});
      }
    }, (err) => {
      console.error("User doc snapshot error:", err);
    });
    return () => unsub();
  }, [user]);

  // Listen to Real-Time Live Location (liveLocations/{userId} or users/{userId}/live_location)
  useEffect(() => {
    if (!user?.uid) return;
    const liveLocRef = doc(db, 'liveLocations', user.uid);
    const unsub = onSnapshot(liveLocRef, (snapshot) => {
      if (snapshot.exists()) {
        setLiveLocation(snapshot.data());
      } else {
        // Fallback to subcollection users/{userId}/live_location
        const subLocRef = doc(db, 'users', user.uid, 'live_location', 'current');
        onSnapshot(subLocRef, (subSnap) => {
          if (subSnap.exists()) setLiveLocation(subSnap.data());
        });
      }
    }, (err) => {
      console.error("Live location snapshot error:", err);
    });
    return () => unsub();
  }, [user]);

  // Listen to Latest SOS Event (sosEvents/{sosId} or users/{userId}/sos_events)
  useEffect(() => {
    if (!user?.uid) return;

    // First try top-level collection `sosEvents`
    const topSosRef = collection(db, 'sosEvents');
    const topSosQuery = query(topSosRef, where('userId', '==', user.uid), limit(1));
    
    const unsubTop = onSnapshot(topSosQuery, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        setSosEvent({ id: docSnap.id, ...docSnap.data() });
        setSosLoading(false);
      } else {
        // Fallback to user subcollection `users/{userId}/sos_events`
        const subSosRef = collection(db, 'users', user.uid, 'sos_events');
        const subSosQuery = query(subSosRef, orderBy('time', 'desc'), limit(1));
        
        onSnapshot(subSosQuery, (subSnap) => {
          if (!subSnap.empty) {
            const d = subSnap.docs[0];
            setSosEvent({ id: d.id, ...d.data() });
          } else {
            setSosEvent(null);
          }
          setSosLoading(false);
        }, () => setSosLoading(false));
      }
    }, (err) => {
      console.error("SOS snapshot error:", err);
      setSosLoading(false);
    });

    return () => unsubTop();
  }, [user]);

  // Listen to Recordings / Media Vault (recordings/{recordId})
  useEffect(() => {
    if (!user?.uid) return;
    const recRef = collection(db, 'recordings');
    const recQuery = query(recRef, where('userId', '==', user.uid), limit(30));

    const unsub = onSnapshot(recQuery, (snapshot) => {
      const docs = snapshot.docs.map(d => {
        const data = d.data();
        const rawUrl = data.downloadUrl || data.storagePath || data.fileName || '';
        const resolvedUrl = resolveMediaUrl(rawUrl, user.uid);
        return { 
          id: d.id, 
          ...data,
          downloadUrl: resolvedUrl 
        };
      });
      setRecordings(docs);
      setRecordingsLoading(false);
    }, (err) => {
      console.error("Recordings snapshot error:", err);
      setRecordingsLoading(false);
    });
    return () => unsub();
  }, [user]);

  const displayName = userData?.name || userData?.displayName || user?.displayName || 'Protected Subject';
  const phone = userData?.phone || '';
  const bloodGroup = userData?.bloodGroup || '';
  const emergencyNote = userData?.emergencyNote || '';
  const email = userData?.email || user?.email || 'No email provided';
  
  const avatarUrl = userData?.photoUrl 
    ? resolveMediaUrl(userData.photoUrl, user?.uid) 
    : (user?.uid ? getPublicProfilePhotoUrl(user.uid) : '');
    
  const initials = displayName ? displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'P';

  // SOS status formatting
  const getStatusBadge = (status = 'PENDING') => {
    const s = status.toLowerCase();
    if (s === 'resolved') {
      return (
        <span className="px-3 py-1 text-[11px] sm:text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center gap-1.5 shrink-0 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5" />
          RESOLVED
        </span>
      );
    }
    if (s === 'in_progress') {
      return (
        <span className="px-3 py-1 text-[11px] sm:text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center gap-1.5 animate-pulse shrink-0 shadow-sm">
          <Activity className="w-3.5 h-3.5" />
          DISPATCH IN PROGRESS
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-[11px] sm:text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center gap-1.5 animate-pulse shrink-0 shadow-sm shadow-rose-500/20">
        <ShieldAlert className="w-3.5 h-3.5" />
        ACTIVE SOS ALARM
      </span>
    );
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'Not available';
    if (ts.toDate) return ts.toDate().toLocaleString();
    if (typeof ts === 'string' || typeof ts === 'number') return new Date(ts).toLocaleString();
    return String(ts);
  };

  // Determine current coordinates
  const lat = liveLocation?.latitude ?? liveLocation?.lat ?? sosEvent?.latitude ?? sosEvent?.lat ?? 18.5204;
  const lng = liveLocation?.longitude ?? liveLocation?.lng ?? sosEvent?.longitude ?? sosEvent?.lng ?? 73.8567;
  const hasValidLocation = (liveLocation?.latitude != null || liveLocation?.lat != null || sosEvent?.latitude != null || sosEvent?.lat != null);

  const copyCoordinates = () => {
    if (hasValidLocation) {
      navigator.clipboard.writeText(`${lat}, ${lng}`);
      setCopiedGps(true);
      setTimeout(() => setCopiedGps(false), 2000);
    }
  };

  // Filter media vault recordings
  const filteredRecordings = recordings.filter(rec => {
    if (activeMediaFilter === 'audio') {
      return (rec.type || '').toLowerCase().includes('audio') || (rec.fileName || '').toLowerCase().includes('.mp3') || (rec.fileName || '').toLowerCase().includes('.m4a');
    }
    if (activeMediaFilter === 'video') {
      return (rec.type || '').toLowerCase().includes('video') || (rec.fileName || '').toLowerCase().includes('.mp4');
    }
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Hero Sentinel Command Banner */}
      <div className="relative p-6 sm:p-8 lg:p-10 rounded-[32px] glass-panel overflow-hidden space-y-6 border border-white/10 shadow-2xl">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FF5F8A]/20 via-purple-600/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF5F8A]/10 border border-[#FF5F8A]/30 rounded-full text-[11px] sm:text-xs font-bold text-[#FF5F8A] shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guardian Sentinel Emergency Protocol Active</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Guardian Telemetry <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5F8A] via-pink-400 to-purple-400">Command Center</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
              Real-time emergency SOS dispatch, sub-meter GPS satellite tracking, geofence boundary monitoring, and encrypted incident evidence vault dumps.
            </p>
          </div>

          {/* Quick Telemetry Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-[#090A18]/80 border border-white/10 shadow-xl backdrop-blur-md">
              <Radar className="w-5 h-5 text-[#FF5F8A] mb-1.5 animate-spin-slow" />
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">System State</span>
              <span className="text-xs font-black text-emerald-400">NOMINAL</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#090A18]/80 border border-white/10 shadow-xl backdrop-blur-md">
              <Wifi className="w-5 h-5 text-purple-400 mb-1.5" />
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Satellite GPS</span>
              <span className="text-xs font-black text-white">{hasValidLocation ? 'CONNECTED' : 'STANDBY'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#090A18]/80 border border-white/10 shadow-xl backdrop-blur-md col-span-2 sm:col-span-1">
              <Lock className="w-5 h-5 text-pink-400 mb-1.5" />
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Media Evidence</span>
              <span className="text-xs font-black text-white">{recordings.length} Vault Files</span>
            </div>
          </div>
        </div>

        {/* Quick Emergency Action Buttons */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3 relative z-10">
          <button 
            onClick={copyCoordinates}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-all flex items-center gap-2 active:scale-95"
          >
            {copiedGps ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#FF5F8A]" />}
            <span>{copiedGps ? 'GPS Coordinates Copied!' : 'Copy GPS Lat/Lng'}</span>
          </button>

          {hasValidLocation && (
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#FF5F8A]/15 hover:bg-[#FF5F8A]/25 border border-[#FF5F8A]/30 text-xs font-bold text-[#FF5F8A] transition-all flex items-center gap-2 active:scale-95"
            >
              <MapPin className="w-4 h-4" />
              <span>View Location on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {phone && (
            <a
              href={`tel:${phone}`}
              className="px-4 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-xs font-bold text-purple-300 transition-all flex items-center gap-2 active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>Call Primary Phone ({phone})</span>
            </a>
          )}
        </div>

      </div>

      {/* Protected User Info Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-[32px] border border-white/10 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 relative z-10">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={displayName} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getPublicProfilePhotoUrl(user?.uid);
                }}
                className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl object-cover ring-2 ring-[#FF5F8A]/50 shadow-xl bg-slate-900"
              />
            ) : (
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-[#FF5F8A] via-pink-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-xl">
                {initials}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-[#090A18] rounded-full animate-pulse" />
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white truncate tracking-wide">
                  {displayName}
                </h3>
                <p className="text-xs text-slate-400 font-mono truncate mt-0.5">
                  {email} {phone && `• ${phone}`}
                </p>
              </div>

              {hasValidLocation && (
                <span className="px-3.5 py-1.5 text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center gap-2 animate-pulse shadow-sm">
                  <Radar className="w-4 h-4 text-emerald-400" />
                  Live GPS: {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
              )}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              {bloodGroup && (
                <span className="px-3 py-1 text-xs font-bold text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-rose-400" />
                  Blood: {bloodGroup}
                </span>
              )}
              {emergencyNote && (
                <span className="px-3 py-1 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center gap-1.5 truncate max-w-sm">
                  <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  Note: {emergencyNote}
                </span>
              )}
              <span className="px-3 py-1 text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Active Telemetry Shield
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Real-Time Satellite Map View */}
      <div className="glass-panel p-6 rounded-[32px] border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF5F8A]/10 border border-[#FF5F8A]/30 text-[#FF5F8A]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-wide">
                Live GPS Satellite Telemetry Map
              </h3>
              <p className="text-xs text-slate-400">
                Interactive real-time location satellite pin with boundary precision
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SUB-METER ACCURACY</span>
          </div>
        </div>

        {/* Leaflet Map Embed */}
        <div className="h-80 sm:h-96 w-full rounded-2xl overflow-hidden border border-white/10 relative shadow-inner z-0">
          <MapContainer 
            center={[lat, lng]} 
            zoom={14} 
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]} icon={createPulseIcon()}>
              <Popup>
                <div className="text-xs font-sans space-y-1 p-1">
                  <strong className="block text-[#FF5F8A] font-bold">{displayName}</strong>
                  <span>Coordinates: {lat.toFixed(5)}, {lng.toFixed(5)}</span>
                </div>
              </Popup>
            </Marker>
            <Circle 
              center={[lat, lng]} 
              radius={350}
              pathOptions={{
                color: '#FF5F8A',
                fillColor: '#FF5F8A',
                fillOpacity: 0.15,
                weight: 2
              }}
            />
          </MapContainer>
        </div>
      </div>

      {/* Grid: SOS Emergency Card & Encrypted Media Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Latest SOS Alert Event */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-6 sm:p-8 rounded-[32px] border border-white/10 space-y-6 relative overflow-hidden shadow-2xl">
            
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-wide">
                    Latest Emergency SOS Event
                  </h3>
                  <p className="text-xs text-slate-400">Real-time distress trigger telemetry</p>
                </div>
              </div>
              {sosEvent && getStatusBadge(sosEvent.status)}
            </div>

            {sosLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-[#FF5F8A] border-t-transparent rounded-full animate-spin" />
                <span>Streaming live SOS telemetry...</span>
              </div>
            ) : !sosEvent ? (
              <div className="py-12 px-6 text-center rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">No Active Emergency Triggers</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  System nominal. The protected individual has not triggered any emergency signals.
                </p>
              </div>
            ) : (() => {
              const sosLat = sosEvent.latitude ?? sosEvent.lat;
              const sosLng = sosEvent.longitude ?? sosEvent.lng;
              const sosTrigger = sosEvent.trigger_type || sosEvent.triggerType || 'Manual Panic Button';
              const sosTime = sosEvent.timestamp || sosEvent.time || sosEvent.createdAt;

              return (
                <div className="space-y-4 text-xs">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-2xl bg-[#090A18]/80 border border-white/10 space-y-1">
                      <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Timestamp</span>
                      <span className="text-white font-medium flex items-center gap-2 truncate">
                        <Clock className="w-4 h-4 text-[#FF5F8A] shrink-0" />
                        {formatTimestamp(sosTime)}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#090A18]/80 border border-white/10 space-y-1">
                      <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Trigger Mechanism</span>
                      <span className="text-white font-medium capitalize flex items-center gap-2 truncate">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        {sosTrigger}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#090A18]/80 border border-white/10 space-y-1">
                    <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Coordinates</span>
                    <span className="text-white font-mono font-medium break-all">
                      {sosLat != null && sosLng != null
                        ? `${sosLat}, ${sosLng}`
                        : 'Coordinates telemetry missing'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#090A18]/80 border border-white/10 space-y-1">
                    <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Address Reference</span>
                    <span className="text-white font-medium leading-relaxed block">
                      {sosEvent.address || 'Address telemetry auto-resolving...'}
                    </span>
                  </div>

                  {(sosEvent.map || (sosLat != null && sosLng != null)) && (
                    <a
                      href={sosEvent.map || `https://www.google.com/maps?q=${sosLat},${sosLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 px-4 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-[#FF5F8A] to-purple-600 hover:opacity-90 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-[#FF5F8A]/20 border border-white/10 active:scale-95"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Open SOS Pin in Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  )}

                </div>
              );
            })()}

          </div>
        </div>

        {/* Encrypted Media Evidence Vault */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 sm:p-8 rounded-[32px] border border-white/10 space-y-6 relative overflow-hidden shadow-2xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-wide">
                    Encrypted Evidence Vault
                  </h3>
                  <p className="text-xs text-slate-400">
                    SOS audio & video dumps
                  </p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold">
                <button
                  onClick={() => setActiveMediaFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeMediaFilter === 'all' ? 'bg-[#FF5F8A] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({recordings.length})
                </button>
                <button
                  onClick={() => setActiveMediaFilter('audio')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeMediaFilter === 'audio' ? 'bg-[#FF5F8A] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Audio
                </button>
                <button
                  onClick={() => setActiveMediaFilter('video')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeMediaFilter === 'video' ? 'bg-[#FF5F8A] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Video
                </button>
              </div>
            </div>

            {recordingsLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span>Decrypting media vault streams...</span>
              </div>
            ) : filteredRecordings.length === 0 ? (
              <div className="py-12 px-6 text-center rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <ShieldCheck className="w-8 h-8 text-slate-500 mx-auto" />
                <h4 className="text-sm font-bold text-white">Vault is Empty</h4>
                <p className="text-xs text-slate-400">
                  No incident recordings captured.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {filteredRecordings.map((rec) => {
                  const recType = rec.type || rec.fileName || 'Incident Recording';
                  const recUrl = rec.url || rec.downloadUrl || rec.storagePath || '';
                  const recTime = rec.createdAt || rec.recordedAt || rec.time;
                  const timeText = formatTimestamp(recTime);
                  const isVideo = recType.toLowerCase().includes('video') || recType.toLowerCase().includes('.mp4');

                  return (
                    <div 
                      key={rec.id}
                      className="p-4 rounded-2xl bg-[#090A18]/80 hover:bg-[#0D0E24] border border-white/10 hover:border-purple-500/40 transition-all flex items-center justify-between gap-3 shadow-lg group"
                    >
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        <div className={`p-3 rounded-xl shrink-0 ${
                          isVideo ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {isVideo ? <Video className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-white truncate">
                            {recType}
                          </h4>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                            <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                            {timeText}
                          </p>
                        </div>
                      </div>

                      {recUrl && (
                        <button
                          onClick={() => setSelectedMedia({ ...rec, type: recType, url: recUrl, timeText })}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-colors flex items-center gap-1.5 shrink-0 active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Play</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Media Player Modal */}
      {selectedMedia && (
        <MediaModal 
          media={selectedMedia} 
          onClose={() => setSelectedMedia(null)} 
        />
      )}

    </div>
  );
}
