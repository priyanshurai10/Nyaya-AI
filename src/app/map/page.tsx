'use client';

import React, { useState, useEffect, useRef } from 'react';
import { translations, LanguageCode } from '@/lib/translations';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Search, Compass, ShieldAlert, Phone, Globe, Clock, User, Landmark, Route, ExternalLink } from 'lucide-react';
import PincodeSearch from '@/components/PincodeSearch';
import { apiClient } from '@/lib/api';

interface MapMarker {
  id: string;
  name: string;
  type: 'court' | 'police' | 'legal_aid' | 'consumer';
  address: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  website?: string;
  phone?: string;
  hours?: string;
  judge?: string;
  jurisdiction?: string;
  image_url?: string;
}

const mapTranslations = {
  title: {
    en: "Legal Proximity Map Finder", hi: "समीपस्थ कानूनी मानचित्र खोजक", bn: "আইনি সান্নিধ্য মানচিত্র অনুসন্ধানকারী", ta: "சட்ட அருகாமை வரைபடக் கண்டுபிடிப்பான்", te: "న్యాయ సామీప్య మ್ಯಾప్ ఫైండర్", mr: "कायदेशीर नकाशा शोधक", gu: "કાનૂની નકશો શોધક", kn: "ಕಾನೂನು ಸಾಮೀಪ್ಯ ನಕ್ಷೆ ಹುಡುಕುವ ಯಂತ್ರ", ml: "നിയಮപരമായ മാപ്പ് ഫൈൻಡರ್", pa: "ਕਾਨੂੰਨੀ ਨਕਸ਼ਾ ਖੋਜਕ"
  },
  desc: {
    en: "Instantly discover local courts, police stations, legal aid desks, and consumer forums near you.",
    hi: "तुरंत अपने पास के स्थानीय न्यायालयों, पुलिस थानों, कानूनी सहायता डेस्क और उपभोक्ता मंचों की खोज करें।",
    bn: "তাত্ক্ষণিকভাবে আপনার কাছাকাছি স্থানীয় আদালত, पुलिस স্টেশন, আইনি সহায়তা ডেস্ক এবং ভোক্তা ফোরামগুলি আবিষ্কার করুন।",
    ta: "உங்களுக்கு அருகிலுள்ள உள்ளூர் நீதிமன்றங்கள், காவல் நிலையங்கள், சட்ட உதவி மையங்கள் மற்றும் நுகர்வோர் மன்றங்களை உடனடியாகக் கண்டறியவும்.",
    te: "మీకు సమీపంలోని స్థానిక కోర్టులు, పోలీస్ స్టేషన్లు, ఉచిత న్యాయ సహాయ కేంద్రాలు మరియు వినియోగదారుల ఫోరమ్‌లను తక్షణమే కనుగొనండి.",
    mr: "तुमच्या जवळील स्थानिक न्यायालये, पोलिस ठाणे, कायदेशीर मदत केंद्रे आणि ग्राहक मंच त्वरित शोधा.",
    gu: "તમારી નજીકની સ્થાનಿಕ અદಾಲતો, પોલીસ સ્ટેશનો, કાનૂની સહાય ડેસ્ક અને ગ્રાહક મંચો તુરંત શોધો.",
    kn: "ನಿಮ್ಮ ಹತ್ತಿರದ ಸ್ಥಳೀಯ ನ್ಯಾಯಾಲಯಗಳು, ಪೊಲೀಸ್ ಠಾಣೆಗಳು, ಕಾನೂನು ಸಹಾಯ ಕೇಂದ್ರಗಳು ಮತ್ತು ಗ್ರಾಹಕ ವೇದಿಕೆಗಳನ್ನು ತಕ್ಷಣವೇ ಪತ್ತೆ ಮಾಡಿ.",
    ml: "നിങ്ങൾക്ക് ചുറ്റുമുള്ള പ്രാദേശಿಕ കോടതികൾ, പോലീസ് സ്റ്റേഷനുകൾ, നിയമ സഹായ കേന്ദ്രങ്ങൾ എന്നിവ കണ്ടെത്തുക.",
    pa: "ਤੁਰੰਤ ਆਪਣੇ ਨੇੜੇ ਦੀਆਂ ਸਥਾਨਕ ਅਦਾਲਤਾਂ, ਪੁਲਿਸ ਸਟੇਸ਼ਨਾਂ, ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ ਡੈਸਕਾਂ ਅਤੇ ਖਪਤਕਾਰ ਫੋਰਮਾਂ ਦੀ ਖੋಜ ਕਰੋ।"
  },
  detectGps: {
    en: "Detect GPS Location", hi: "जीपीएस स्थान का पता लगाएं", bn: "জিপিএস অবস্থান সনাক্ত করুন", ta: "ஜிபிஎஸ் இருப்பிடத்தைக் கண்டறி", te: "GPS స్థానాన్ని గుర్తించండి", mr: "जीपीएस स्थान शोधा", gu: "GPS સ્થાન શોધો", kn: "ಜಿಪಿಎಸ್ ಸ್ಥಳ ಪತ್ತೆ ಹಚ್ಚಿ", ml: "ಜಿಪಿಎಸ್ ಲೊಕേഷൻ കണ്ടെത്തുക", pa: "ਜੀਪੀਐਸ ਸਥਾਨ ਲੱਭੋ"
  },
  courtDetailCard: {
    en: "Jurisdiction & Court Details", hi: "क्षेत्राधिकार एवं न्यायालय विवरण", bn: "এখতিয়ার এবং আদালতের বিবরণ", ta: "நீதி எல்லை மற்றும் நீதிமன்ற விவரங்கள்", te: "అధికార పరిధి & కోర్టు వివరాలు", mr: "अधिकारक्षेत्र आणि न्यायालयीन तपशील", gu: "અદિકારક્ષેત્ર અને અદાલતની વિगતો", kn: "ಅಧಿಕಾರ ವ್ಯಾಪ್ತಿ ಮತ್ತು ನ್ಯಾಯಾಲಯದ ವಿವರಗಳು", ml: "അധികാരപരിധിയും കോടതി വിവരങ്ങളും", pa: "ਅਧਿਕਾਰ ਖေਤਰ ਅਤੇ ਅਦਾਲਤ ਦੇ ਵੇರਵੇ"
  },
  filters: {
    en: "Map Markers Filters", hi: "मानचित्र फ़िल्टर", bn: "মানচিত্র ফিল্টার", ta: "வரைபட வடிகட்டிகள்", te: "మ్యాప్ ఫిల్టర్లు", mr: "नकाशा फिल्टर", gu: "નકશો ફિલ્ટર", kn: "ನಕ್ಷೆಯ ಫಿಲ್ಟರ್‌ಗಳು", ml: "മാപ്പ് ഫിൽട്ടറുകൾ", pa: "ਨਕਸ਼ਾ ਫਿਲਟਰ"
  },
  btnDirections: {
    en: "Draw Route Path", hi: "मार्ग का नक्शा बनाएं", bn: "রুট পথ আঁকুন", ta: "பாதை வரைபடம்", te: "మార్గం గీయండి", mr: "मार्ग दाखवा", gu: "રૂટ દોરો", kn: "ಮಾರ್ಗ ನಕ್ಷೆ ರಚಿಸಿ", ml: "വഴി രേഖപ്പെടുത്തുക", pa: "ਰਸਤਾ ਦੇਖੋ"
  }
};

export default function LegalMapPage() {
  const { selectedLang, t } = useLanguage();
  
  // Geolocation States
  const [latitude, setLatitude] = useState<number>(28.6915);  // default Ashok Vihar Delhi
  const [longitude, setLongitude] = useState<number>(77.1724);
  const [locating, setLocating] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  // Manual input fields
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);

  // Markers
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [dynamicJudge, setDynamicJudge] = useState<any>(null);
  const [bookmarkedCourtIds, setBookmarkedCourtIds] = useState<string[]>([]);
  
  // Filters
  const [showCourts, setShowCourts] = useState(true);
  const [showPolice, setShowPolice] = useState(true);
  const [showLegalAid, setShowLegalAid] = useState(true);
  const [showConsumer, setShowConsumer] = useState(true);

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [mapFailed, setMapFailed] = useState(false);

  // Load Leaflet via CDN dynamically to bypass Next.js SSR build errors
  useEffect(() => {
    // 1. Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // 2. Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);

    // Sync location change
    const handleLocChange = () => {
      const storedLoc = localStorage.getItem('nyaya_location');
      if (storedLoc) {
        try {
          const parsed = JSON.parse(storedLoc);
          setLatitude(parsed.latitude);
          setLongitude(parsed.longitude);
          fetchNearbyLocations(parsed.latitude, parsed.longitude, parsed);
        } catch (e) {
          console.error(e);
        }
      } else {
        const lat = localStorage.getItem('nyaya_lat');
        const lon = localStorage.getItem('nyaya_lon');
        if (lat && lon) {
          const parsedLat = parseFloat(lat);
          const parsedLon = parseFloat(lon);
          setLatitude(parsedLat);
          setLongitude(parsedLon);
          fetchNearbyLocations(parsedLat, parsedLon);
        } else {
          fetchNearbyLocations(28.6915, 77.1724);
        }
      }
    };
    window.addEventListener('nyaya_location_changed', handleLocChange);
    // Call immediately on mount to load initial active location!
    handleLocChange();

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
      window.removeEventListener('nyaya_location_changed', handleLocChange);
    };
  }, []);

  // Fetch dynamic judge when court is selected
  useEffect(() => {
    if (!selectedMarker || selectedMarker.type !== 'court') {
      setDynamicJudge(null);
      return;
    }
    
    // Clear previous judge before query
    setDynamicJudge(null);
    
    apiClient.post<any>('/navigation/judges/search', { court_name: selectedMarker.name })
      .then(data => {
        if (data && data.length > 0) {
          setDynamicJudge(data[0]);
        }
      })
      .catch(err => console.warn('Failed to query dynamic judge directory:', err));
  }, [selectedMarker]);

  // Load bookmarked courts on mount
  useEffect(() => {
    apiClient.get<any>('/user/bookmarks')
      .then(data => {
        const list = data.data || data || [];
        if (Array.isArray(list)) {
          setBookmarkedCourtIds(list.map((b: any) => b.court_id));
        }
      })
      .catch(err => console.warn('Failed to load bookmarks on map load:', err));
  }, []);

  const toggleBookmark = async (courtId: string) => {
    try {
      const res: any = await apiClient.post('/user/bookmark/toggle', { court_id: courtId });
      if (res.status === 'added') {
        setBookmarkedCourtIds(prev => [...prev, courtId]);
      } else if (res.status === 'removed') {
        setBookmarkedCourtIds(prev => prev.filter(id => id !== courtId));
      }
      // Dispatch event to trigger sidebar reload in main page.tsx
      window.dispatchEvent(new Event('nyaya_bookmarks_changed'));
    } catch (e) {
      console.error('Failed to toggle bookmark:', e);
    }
  };

  // Seed DB first in case it is fresh
  const ensureSeeded = async () => {
    try {
      await apiClient.post('/navigation/courts/seed');
    } catch (e) {
      console.warn('Seeding failed / offline', e);
    }
  };

  const fetchNearbyLocations = async (latVal: number, lonVal: number, manualPayload?: any) => {
    setLoading(true);
    setApiError(null);
    await ensureSeeded();

    try {
      let payload = { latitude: latVal, longitude: lonVal, ...manualPayload };

      const data = await apiClient.post<any>('/navigation/courts/search', payload);
      
      // Update coordinates to user center resolved by backend
      const centerLat = data.user_location.latitude;
      const centerLon = data.user_location.longitude;
      setLatitude(centerLat);
      setLongitude(centerLon);

      // Process Courts from API
      const courtMarkers: MapMarker[] = Object.entries(data.nearest_courts)
        .filter(([_, court]: any) => court !== null)
        .map(([cType, court]: any) => ({
          id: court.id,
          name: court.name,
          type: 'court',
          address: court.address,
          latitude: court.latitude,
          longitude: court.longitude,
          distance_km: court.distance_km,
          website: court.website || 'https://districts.ecourts.gov.in',
          phone: court.contact_number || '+91-11-23386341',
          hours: court.working_hours || '10:00 AM - 4:00 PM',
          judge: court.judge_info || 'Presiding Judicial Officer',
          jurisdiction: court.jurisdiction || 'General Jurisdiction',
          image_url: court.image_url || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80'
        }));

      // Generate local police cells, aid clinics, and consumer forums
      const policeStations: MapMarker[] = [
        {
          id: 'police_station_alpha',
          name: `Model Police Cell (${manualPayload?.city || 'Jurisdiction Spot'})`,
          type: 'police',
          address: `Police Complex Road, Civil Area, Lat ${centerLat.toFixed(4)}`,
          latitude: centerLat + 0.006,
          longitude: centerLon - 0.005,
          distance_km: 0.9,
          phone: '100 / +91-11-27429811',
          hours: '24 Hours Open',
          judge: 'Station House Officer (SHO)',
          jurisdiction: 'Filing complaints, local law enforcement, accident reporting, and FIR filing.',
          image_url: 'https://images.unsplash.com/photo-1562920841-029f94cd37bb?auto=format&fit=crop&w=400&q=80'
        }
      ];

      const legalAidCenters: MapMarker[] = [
        {
          id: 'legal_aid_district',
          name: 'DLSA District Legal Aid Clinic',
          type: 'legal_aid',
          address: 'Room 12, Court Annex Block, District Complex',
          latitude: centerLat + 0.003,
          longitude: centerLon + 0.004,
          distance_km: 0.5,
          website: 'https://nalsa.gov.in',
          phone: '15100 (Toll Free)',
          hours: '10:00 AM - 4:00 PM',
          judge: 'Member Secretary DLSA / Panel Advocates',
          jurisdiction: 'Provides free legal counseling, advocates for low-income citizens, women, SC/ST, and marginalized sections.',
          image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80'
        }
      ];

      const consumerForums: MapMarker[] = [
        {
          id: 'consumer_forum_city',
          name: 'District Consumer Disputes Commission Office',
          type: 'consumer',
          address: 'Administrative Wing, Vikas Complex',
          latitude: centerLat - 0.004,
          longitude: centerLon - 0.004,
          distance_km: 1.2,
          website: 'https://edaakhil.nic.in',
          phone: '1915 (National Consumer Helpline)',
          hours: '10:00 AM - 5:00 PM',
          judge: 'Presiding Judge & Technical Members',
          jurisdiction: 'Adjudication of product defects, medical negligence, service deficiencies, and refund claims up to Rs 50 Lakhs.',
          image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80'
        }
      ];

      const allMarkers = [...courtMarkers, ...policeStations, ...legalAidCenters, ...consumerForums];
      setMarkers(allMarkers);

      // Auto-select nearest
      if (courtMarkers.length > 0) {
        setSelectedMarker(courtMarkers[0]);
      } else if (allMarkers.length > 0) {
        setSelectedMarker(allMarkers[0]);
      }

    } catch (e: any) {
      setApiError(e.message || 'Error communicating with court navigator.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNearbyLocations(latitude, longitude);
    
    // Catch Google Maps auth/billing failure popups
    if (typeof window !== 'undefined') {
      (window as any).gm_authFailure = () => {
        console.warn("Google Maps authentication or billing failure detected!");
        setMapFailed(true);
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).gm_authFailure;
      }
    };
  }, []);

  // Leaflet map initialization
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapFailed) return;

    try {
      const L = (window as any).L;
      if (!L) {
        throw new Error("Leaflet L is not loaded");
      }
      
      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 14,
        zoomControl: true
      });

      // Dark styled map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CartoDB'
      }).addTo(map);

      mapInstanceRef.current = map;
    } catch (err) {
      console.error("Failed to initialize Map:", err);
      setMapFailed(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, latitude, longitude, mapFailed]);

  // Redraw markers when markers or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !leafletLoaded) return;

    const L = (window as any).L;

    // Clear old layers
    if (markersGroupRef.current) {
      map.removeLayer(markersGroupRef.current);
    }
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
    }

    const group = L.layerGroup().addTo(map);
    markersGroupRef.current = group;

    // Plot User Home
    const userHtml = `
      <div class="relative flex items-center justify-center">
        <div class="w-8 h-8 rounded-full bg-[#FF9933]/20 border border-[#FF9933]/50 flex items-center justify-center absolute animate-ping"></div>
        <div class="w-5 h-5 rounded-full bg-[#FF9933] border-2 border-white flex items-center justify-center shadow-lg text-[9px]">🏠</div>
      </div>
    `;
    const userIcon = L.divIcon({
      html: userHtml,
      className: '',
      iconSize: [32, 32]
    });
    L.marker([latitude, longitude], { icon: userIcon }).addTo(group).bindPopup("Your Location");

    // Filter markers
    const filtered = markers.filter((m) => {
      if (m.type === 'court' && !showCourts) return false;
      if (m.type === 'police' && !showPolice) return false;
      if (m.type === 'legal_aid' && !showLegalAid) return false;
      if (m.type === 'consumer' && !showConsumer) return false;
      return true;
    });

    // Plot markers
    filtered.forEach((m) => {
      const colors = {
        court: '#FF9933',
        police: '#3b82f6',
        legal_aid: '#22c55e',
        consumer: '#a855f7'
      };
      const emojis = {
        court: '🏛️',
        police: '👮',
        legal_aid: '🤝',
        consumer: '🛍️'
      };

      const color = colors[m.type] || '#FF9933';
      const emoji = emojis[m.type] || '🏛️';

      const pinHtml = `
        <div class="relative flex flex-col items-center">
          <div class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110" style="background-color: ${color};">
            <span class="text-xs">${emoji}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: pinHtml,
        className: '',
        iconSize: [32, 32]
      });

      L.marker([m.latitude, m.longitude], { icon: customIcon })
        .addTo(group)
        .on('click', () => {
          setSelectedMarker(m);
        });
    });

  }, [markers, showCourts, showPolice, showLegalAid, showConsumer, leafletLoaded, latitude, longitude]);

  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      alert('HTML5 Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationDenied(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);
        fetchNearbyLocations(lat, lon);
      },
      (err) => {
        setLocating(false);
        setLocationDenied(true);
        console.warn('GPS location request denied:', err);
      },
      { timeout: 8000 }
    );
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {};
    if (pincode.trim()) payload.pincode = pincode.trim();
    if (city.trim()) payload.city = city.trim();
    if (state.trim()) payload.state = state.trim();
    if (district.trim()) payload.district = district.trim();
    if (village.trim()) payload.village = village.trim();

    fetchNearbyLocations(latitude, longitude, payload);
    setShowManualForm(false);
  };

  const drawRoutePath = () => {
    const map = mapInstanceRef.current;
    if (!map || !selectedMarker || !leafletLoaded) return;

    const L = (window as any).L;

    // Clear previous line
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
    }

    // Draw straight line path representing navigation path vector
    const latlngs = [
      [latitude, longitude],
      [selectedMarker.latitude, selectedMarker.longitude]
    ];

    const polyline = L.polyline(latlngs, {
      color: '#00d2ff',
      weight: 3,
      dashArray: '8, 8',
      opacity: 0.8
    }).addTo(map);

    routeLineRef.current = polyline;

    // Zoom out to fit both user and target
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  };

  const handleLocationResolved = (loc: any) => {
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    fetchNearbyLocations(loc.latitude, loc.longitude, loc);
  };

  const mt = (key: keyof typeof mapTranslations) => {
    return mapTranslations[key]?.[selectedLang] || mapTranslations[key]?.['en'] || key;
  };

  return (
    <div className="min-h-screen bg-[#020813] text-white flex flex-col font-sans p-4 sm:p-6 space-y-6">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent">
          ⚖️ {mt('title')}
        </h1>
        <p className="text-xs text-white/50">{mt('desc')}</p>
      </div>

      {/* Pincode Search replacing city/gps selector */}
      <PincodeSearch
        onLocationResolved={handleLocationResolved}
        storageKey="nyaya_location_key"
      />

      {/* Error state if location access is denied */}
      {locationDenied && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-3">
          <ShieldAlert size={18} />
          <span>Location access denied by user browser parameters. Please enter details manually or allow location flags.</span>
        </div>
      )}

      {apiError && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
          ⚠️ {apiError}
        </div>
      )}

      {/* Map Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        
        {/* Column 1 & 2: Map Canvas */}
        <div className="lg:col-span-2 flex flex-col space-y-4 relative">
          
          {/* Map Filters */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#111827]/[0.02] border border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="font-bold text-white/50 text-[10px] uppercase tracking-wider">{mt('filters')}</span>
            <div className="flex flex-wrap gap-4 font-semibold text-white/80">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCourts}
                  onChange={(e) => setShowCourts(e.target.checked)}
                  className="rounded border-white/10 bg-white dark:bg-[#111827]/5 text-[#FF9933] focus:ring-0 w-3.5 h-3.5"
                />
                <span>🏛️ Courts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPolice}
                  onChange={(e) => setShowPolice(e.target.checked)}
                  className="rounded border-white/10 bg-white dark:bg-[#111827]/5 text-blue-400 focus:ring-0 w-3.5 h-3.5"
                />
                <span>👮 Police</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLegalAid}
                  onChange={(e) => setShowLegalAid(e.target.checked)}
                  className="rounded border-white/10 bg-white dark:bg-[#111827]/5 text-green-400 focus:ring-0 w-3.5 h-3.5"
                />
                <span>🤝 Legal Aid</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showConsumer}
                  onChange={(e) => setShowConsumer(e.target.checked)}
                  className="rounded border-white/10 bg-white dark:bg-[#111827]/5 text-purple-400 focus:ring-0 w-3.5 h-3.5"
                />
                <span>🛍️ Consumer</span>
              </label>
            </div>
          </div>

          {/* Geographical leaflet map div */}
          <div className="flex-1 rounded-3xl border border-white/5 relative overflow-hidden min-h-[400px] bg-[#0c1424] flex flex-col items-center justify-center p-6 text-center select-none">
            {mapFailed ? (
              <div className="space-y-3">
                <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">
                  🗺️
                </div>
                <h4 className="text-sm font-extrabold text-white">Interactive Maps are temporarily unavailable</h4>
                <p className="text-xs text-white/50 max-w-sm leading-relaxed mx-auto">
                  Map functionality will be enabled once Google Maps / Map Services are fully configured on your system. You can still view all nearby locations in the list.
                </p>
              </div>
            ) : (
              <>
                {/* The Map container */}
                <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-10" />

                {/* loading state */}
                {(!leafletLoaded || loading) && (
                  <div className="absolute inset-0 bg-[#020813]/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-3">
                    <div className="w-10 h-10 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Recalculating proximity vector markers...</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Column 3: Sidebar Proximity Cards */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827]/[0.02] border border-white/5 flex flex-col space-y-5 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-white/5">
          <h2 className="text-xs font-bold text-white/80 uppercase tracking-wider border-b border-white/5 pb-3">
            📑 {mt('courtDetailCard')}
          </h2>

          {selectedMarker ? (
            <div className="space-y-5 text-xs flex-1 flex flex-col">
              
              {/* Image & Basic Details */}
              <div className="space-y-3">
                {selectedMarker.image_url && (
                  <img
                    src={selectedMarker.image_url}
                    alt={selectedMarker.name}
                    className="w-full h-32 object-cover rounded-xl border border-white/5"
                  />
                )}
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-4">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-white dark:bg-[#111827]/5 border border-white/10 text-[9px] uppercase font-bold text-white/60">
                      {selectedMarker.type}
                    </span>
                    {selectedMarker.type === 'court' && (
                      <button
                        onClick={() => toggleBookmark(selectedMarker.id)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors shrink-0"
                        title={bookmarkedCourtIds.includes(selectedMarker.id) ? "Remove from Bookmarked Courts" : "Bookmark this Court"}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill={bookmarkedCourtIds.includes(selectedMarker.id) ? "#138808" : "none"} 
                          stroke={bookmarkedCourtIds.includes(selectedMarker.id) ? "#138808" : "currentColor"} 
                          strokeWidth="2" 
                          className="w-3.5 h-3.5"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{selectedMarker.name}</h3>
                  <p className="text-[10px] text-white/40">Distance: <span className="font-semibold text-green-400">{selectedMarker.distance_km.toFixed(2)} km</span> away</p>
                </div>
              </div>

              {/* Court info metadata */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                
                {/* Full Address */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-white/35 flex items-center gap-1.5"><Landmark size={12} /> Full Address</span>
                  <p className="text-white/70 leading-relaxed font-medium">{selectedMarker.address}</p>
                </div>

                {/* Hours */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-white/35 flex items-center gap-1.5"><Clock size={12} /> Working Hours</span>
                  <p className="text-white/70 font-medium">{selectedMarker.hours}</p>
                </div>

                {/* Phone */}
                {selectedMarker.phone && (
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-white/35 flex items-center gap-1.5"><Phone size={12} /> Helpline</span>
                    <p className="text-[#FF9933] font-bold">{selectedMarker.phone}</p>
                  </div>
                )}

                {/* Web */}
                {selectedMarker.website && (
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-white/35 flex items-center gap-1.5"><Globe size={12} /> Website Portal</span>
                    <p className="truncate font-medium">
                      <a href={selectedMarker.website} target="_blank" rel="noreferrer" className="text-[#00d2ff] hover:underline flex items-center gap-1">
                        <span>{selectedMarker.website}</span>
                        <ExternalLink size={10} />
                      </a>
                    </p>
                  </div>
                )}

                {/* Dynamic Presiding Judge details */}
                <div className="space-y-1 border-t border-white/5 pt-3 mt-1">
                  <span className="text-[9px] uppercase font-bold text-white/35 flex items-center gap-1.5"><User size={12} /> Presiding Judge</span>
                  {dynamicJudge ? (
                    <div className="p-3 rounded-xl bg-white dark:bg-[#111827]/[0.02] border border-white/5 space-y-2">
                      <div className="flex items-center gap-2">
                        <img src={dynamicJudge.photo_url} alt={dynamicJudge.name} className="w-8 h-8 rounded-full border border-white/10" />
                        <div>
                          <h4 className="font-bold text-white text-[11px]">{dynamicJudge.name}</h4>
                          <p className="text-[9px] text-white/40 uppercase font-semibold">{dynamicJudge.designation}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/60 leading-normal italic">&quot;{dynamicJudge.bio}&quot;</p>
                    </div>
                  ) : (
                    <p className="text-white/50 italic">{selectedMarker.judge}</p>
                  )}
                </div>

                {/* Jurisdiction */}
                {selectedMarker.jurisdiction && (
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-white/35">Court Jurisdiction</span>
                    <p className="text-white/60 leading-normal">{selectedMarker.jurisdiction}</p>
                  </div>
                )}
              </div>

              {/* Navigation Draw Triggers */}
              <div className="pt-4 mt-auto border-t border-white/5 grid grid-cols-2 gap-3">
                <button
                  onClick={drawRoutePath}
                  className="py-2.5 bg-white dark:bg-[#111827]/5 border border-white/10 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors hover:bg-white dark:bg-[#111827]/10"
                >
                  <Route size={14} className="text-[#00d2ff]" />
                  <span>{mt('btnDirections')}</span>
                </button>
                
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedMarker.name + ' ' + selectedMarker.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 bg-gradient-to-r from-[#FF9933] to-[#E8850B] rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-[#020813] hover:scale-[1.02]"
                >
                  <ExternalLink size={14} />
                  <span>Google Maps</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-white/30 italic py-10">
              Select any court or landmark pin on the map to review dynamic jurisdiction and presiding judge directory logs.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
