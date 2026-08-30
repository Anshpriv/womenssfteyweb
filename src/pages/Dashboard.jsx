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
  FileText
} from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, collection, query, orderBy, limit, where } from 'firebase/firestore';
import MediaModal from '../components/MediaModal';
import { getPublicProfilePhotoUrl, resolveMediaUrl } from '../supabase';

export default function Dashboard({ user }) {
  const [userData, setUserData] = useState(null);
  const [sosEvent, setSosEvent] = useState(null);
  const [sosLoading, setSosLoading] = useState(true);
  const [liveLocation, setLiveLocation] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [recordingsLoading, setRecordingsLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);

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
    const recQuery = query(recRef, where('userId', '==', user.uid), limit(20));

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

  const displayName = userData?.name || userData?.displayName || user?.displayName || 'Protected User';
  const phone = userData?.phone || '';
  const bloodGroup = userData?.bloodGroup || '';
  const emergencyNote = userData?.emergencyNote || '';
  const email = userData?.email || user?.email || 'No email provided';
  
  // Public profile photo link in Supabase recordings bucket
  const avatarUrl = userData?.photoUrl 
    ? resolveMediaUrl(userData.photoUrl, user?.uid) 
    : (user?.uid ? getPublicProfilePhotoUrl(user.uid) : '');
    
  const initials = displayName ? displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'G';

  // SOS status formatting
  const getStatusBadge = (status = 'PENDING') => {
    const s = status.toLowerCase();
    if (s === 'resolved') {
      return (
        <span className="px-2.5 py-1 text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 rounded-full flex items-center gap-1.5 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
          RESOLVED
        </span>
      );
    }
    if (s === 'in_progress') {
      return (
        <span className="px-2.5 py-1 text-[11px] sm:text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 rounded-full flex items-center gap-1.5 animate-pulse shrink-0">
          <Activity className="w-3.5 h-3.5" />
          IN PROGRESS
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-[11px] sm:text-xs font-bold text-rose-700 bg-rose-100 border border-rose-300 rounded-full flex items-center gap-1.5 animate-pulse shrink-0">
        <ShieldAlert className="w-3.5 h-3.5" />
        ACTIVE SOS
      </span>
    );
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'Not available';
    if (ts.toDate) {
      return ts.toDate().toLocaleString();
    }
    if (typeof ts === 'string' || typeof ts === 'number') {
      return new Date(ts).toLocaleString();
    }
    return String(ts);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Title & Live Telemetry Banner */}
      <div className="relative p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[32px] glass-panel overflow-hidden space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF5F8A]/10 border border-[#FF5F8A]/20 rounded-full text-[11px] sm:text-xs font-semibold text-[#FF5F8A]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guardian Sentinel Protocol</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Guardian Safety <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5F8A] to-purple-600">Console</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed font-medium">
              Real-time emergency SOS dispatch, sub-meter GPS tracking, geofence boundary monitoring, and encrypted incident vault dumps.
            </p>
          </div>

          {/* Quick Telemetry Stats */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 shrink-0">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm text-left backdrop-blur-md">
              <Radar className="w-4 h-4 text-[#FF5F8A] mb-1 animate-spin-slow" />
              <span className="text-[10px] text-slate-400 block font-semibold">Active Status</span>
              <span className="text-xs font-extrabold text-emerald-600">ONLINE</span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm text-left backdrop-blur-md">
              <Lock className="w-4 h-4 text-purple-600 mb-1" />
              <span className="text-[10px] text-slate-400 block font-semibold">Vault Media</span>
              <span className="text-xs font-extrabold text-slate-900">{recordings.length} Saved</span>
            </div>
          </div>
        </div>

      </div>

      {/* User Profile Card */}
      <div className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative z-10">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={displayName} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getPublicProfilePhotoUrl(user?.uid);
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-[#FF5F8A]/40 shadow-md bg-slate-100"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#FF5F8A] to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                {initials}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                {displayName}
              </h3>
              {liveLocation && (liveLocation.latitude || liveLocation.lat) && (
                <span className="px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full flex items-center gap-1.5 animate-pulse">
                  <Radar className="w-3.5 h-3.5" />
                  Live GPS: {(liveLocation.latitude || liveLocation.lat).toFixed(4)}, {(liveLocation.longitude || liveLocation.lng).toFixed(4)}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 font-mono truncate">
              {email} {phone && `• ${phone}`}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              {bloodGroup && (
                <span className="px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-rose-500" />
                  Blood: {bloodGroup}
                </span>
              )}
              {emergencyNote && (
                <span className="px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-full flex items-center gap-1 truncate max-w-xs">
                  <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  Note: {emergencyNote}
                </span>
              )}
              <span className="px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-purple-700 bg-purple-50/90 border border-purple-200/90 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Protection
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: SOS Alert & Encrypted Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Latest SOS Alert Card */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-5 sm:space-y-6 relative overflow-hidden">
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
                  <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-wide">
                  Latest SOS Alert Event
                </h3>
              </div>
              {sosEvent && getStatusBadge(sosEvent.status)}
            </div>

            {sosLoading ? (
              <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-[#FF5F8A] border-t-transparent rounded-full animate-spin" />
                <span>Loading latest telemetry...</span>
              </div>
            ) : !sosEvent ? (
              <div className="py-10 sm:py-12 px-4 text-center rounded-2xl bg-white/70 border border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Active SOS Triggers</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Everything is clear. The protected individual has not triggered any emergency signals.
                </p>
              </div>
            ) : (() => {
              const sosLat = sosEvent.latitude ?? sosEvent.lat;
              const sosLng = sosEvent.longitude ?? sosEvent.lng;
              const sosTrigger = sosEvent.trigger_type || sosEvent.triggerType || 'Manual Emergency';
              const sosTime = sosEvent.timestamp || sosEvent.time || sosEvent.createdAt;

              return (
                <div className="space-y-4 text-xs">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm space-y-1">
                      <span className="text-slate-500 font-semibold block text-[11px]">Timestamp</span>
                      <span className="text-slate-900 font-medium flex items-center gap-1.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-[#FF5F8A] shrink-0" />
                        {formatTimestamp(sosTime)}
                      </span>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm space-y-1">
                      <span className="text-slate-500 font-semibold block text-[11px]">Trigger Type</span>
                      <span className="text-slate-900 font-medium capitalize flex items-center gap-1.5 truncate">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        {sosTrigger}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Coordinates</span>
                    <span className="text-slate-900 font-mono font-medium break-all">
                      {sosLat != null && sosLng != null
                        ? `${sosLat}, ${sosLng}`
                        : 'Coordinates not attached'}
                    </span>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm space-y-1">
                    <span className="text-slate-500 font-semibold block text-[11px]">Address / Location Reference</span>
                    <span className="text-slate-900 font-medium leading-relaxed block">
                      {sosEvent.address || 'Address telemetry missing'}
                    </span>
                  </div>

                  {(sosEvent.map || (sosLat != null && sosLng != null)) && (
                    <a
                      href={sosEvent.map || `https://www.google.com/maps?q=${sosLat},${sosLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs text-slate-800 bg-white/80 hover:bg-white border border-slate-200 transition-colors flex items-center justify-center gap-2 group shadow-sm active:scale-95"
                    >
                      <MapPin className="w-4 h-4 text-[#FF5F8A]" />
                      <span>Open Coordinates in Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  )}

                </div>
              );
            })()}

          </div>
        </div>

        {/* Encrypted Media Vault Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-5 sm:space-y-6 relative overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-600">
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-wide">
                    Encrypted Media Vault
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Audio & video streams recorded on SOS events
                  </p>
                </div>
              </div>
            </div>

            {recordingsLoading ? (
              <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <span>Decrypting media dumps...</span>
              </div>
            ) : recordings.length === 0 ? (
              <div className="py-12 px-4 text-center rounded-2xl bg-white/70 border border-slate-200 space-y-2">
                <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Vault is Empty</h4>
                <p className="text-xs text-slate-500">
                  No incident recordings captured.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {recordings.map((rec) => {
                  const recType = rec.type || rec.fileName || 'Recording';
                  const recUrl = rec.url || rec.downloadUrl || rec.storagePath || '';
                  const recTime = rec.createdAt || rec.recordedAt || rec.time;
                  const timeText = formatTimestamp(recTime);
                  const isVideo = recType.toLowerCase().includes('video') || recType.toLowerCase().includes('.mp4');

                  return (
                    <div 
                      key={rec.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white/80 hover:bg-white border border-slate-200 hover:border-purple-300 transition-all flex items-center justify-between gap-3 shadow-sm group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          isVideo ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {isVideo ? <Video className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {recType}
                          </h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            {timeText}
                          </p>
                          {rec.notes && (
                            <p className="text-[11px] text-slate-600 truncate mt-1">
                              {rec.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {recUrl && (
                        <button
                          onClick={() => setSelectedMedia({ ...rec, type: recType, url: recUrl, timeText })}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center gap-1.5 shrink-0 active:scale-95"
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
