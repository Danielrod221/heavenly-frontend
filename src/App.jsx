import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_URL = 'https://heavenly-server-xgc4.onrender.com';

const fixImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  return url.replace('heavenly-frontend-m76p24irf-danielrod221s-projects.vercel.app', API_URL).replace('localhost', 'heavenly-server-xgc4.onrender.com');
};

const bgImageUrl = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2560&auto=format&fit=crop';
const satelliteMapUrl = 'https://images.unsplash.com/photo-1584464457692-54527961288c?q=80&w=2560&auto=format&fit=crop';

const createHudIcon = (isSelected) => new L.DivIcon({
  className: 'clear-custom-icon',
  html: `<div style="width: 20px; height: 20px; background: ${isSelected ? '#4ade80' : '#38bdf8'}; border-radius: 50%; box-shadow: 0 0 15px ${isSelected ? '#4ade80' : '#38bdf8'}; border: 2px solid white;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const userIcon = new L.DivIcon({
  className: 'clear-custom-icon',
  html: `<div style="width: 20px; height: 20px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 15px #ef4444; border: 2px solid white; animation: pulse 1.5s infinite;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

const PageWrapper = ({ children }) => (<div style={{ minHeight: '100vh', backgroundImage: `url(${bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>{children}</div>);
const ContentWrapper = ({ children }) => (<div style={{ minHeight: 'calc(100vh - 100px)', background: 'transparent', paddingBottom: '40px' }}>{children}</div>);

const CollapsiblePanel = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="card" style={{ marginBottom: '20px', background: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div className="hide-on-print" onClick={() => setIsOpen(!isOpen)} style={{ padding: '20px 25px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isOpen ? '#f1f5f9' : 'transparent', transition: 'background 0.2s' }}>
        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>{icon} {title}</h3>
        <span style={{ color: '#0f172a', fontSize: '13px', fontWeight: 'bold', background: 'white', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          {isOpen ? '▼ Hide' : '▶ Expand'}
        </span>
      </div>
      {isOpen && (
        <div style={{ padding: '25px', borderTop: '1px solid #e2e8f0' }}>
          {children}
        </div>
      )}
    </div>
  );
};

// OVERLAP FIX: Navbar z-index set to 9999 so nothing can cover it on phones
const Navbar = ({ title, role, view, setView, handleLogout, token }) => (
  <nav className="hide-on-print" style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px', position: 'sticky', top: 0, zIndex: 9999, borderBottom: '1px solid #e2e8f0' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div onClick={() => setView(token ? (role === 'admin' ? 'admin' : 'cooler') : 'cooler')} style={{ background: '#0f172a', color: '#38bdf8', padding: '8px', borderRadius: '8px', fontWeight: '900', cursor: 'pointer', border: '1px solid #38bdf8', boxShadow: '0 0 10px rgba(56,189,248,0.3)', letterSpacing: '1px' }} title="Return to Map">HT</div>
      <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '1px' }}>{title}</h2>
    </div>
    <div style={{ display: 'flex', gap: '15px' }}>
      {token ? (
        <>
          {role !== 'admin' && view !== 'cooler' && <button onClick={() => setView('cooler')} className="btn-primary" style={{ background: '#0f172a', color: '#38bdf8', border: '1px solid #38bdf8', boxShadow: '0 0 10px rgba(56,189,248,0.2)' }}>📍 Live Market Map</button>}
          {role === 'buyer' && view !== 'orders' && <button onClick={() => setView('orders')} className="btn-secondary" style={{ border: '1px solid #0ea5e9', color: '#0ea5e9', fontWeight: 'bold' }}>My Account & Orders</button>}
          {role === 'grower' && view !== 'dashboard' && <button onClick={() => setView('dashboard')} className="btn-secondary" style={{ border: '1px solid #0ea5e9', color: '#0ea5e9', fontWeight: 'bold' }}>Grower Dashboard</button>}
          <button onClick={handleLogout} className="btn-secondary" style={{ color: '#64748b' }}>Sign Out</button>
        </>
      ) : (
        <button onClick={() => setView('login')} className="btn-primary" style={{ background: '#38bdf8', color: '#0f172a', border: 'none', fontWeight: 'bold', boxShadow: '0 0 10px rgba(56,189,248,0.4)' }}>Sign In / Register</button>
      )}
    </div>
  </nav>
);

const ComplianceCard = ({ myDocs, handleDocUpload, role }) => {
  const [localCertType, setLocalCertType] = useState('PrimusGFS');
  const isGrower = role === 'grower';
  const isMissingDocs = isGrower ? (!myDocs.w9_url || !myDocs.cert_url) : (!myDocs.w9_url);

  return (
    <CollapsiblePanel title="Compliance Vault" icon="📁" defaultOpen={isMissingDocs}>
      <p style={{ color: '#64748b', margin: '0 0 20px 0' }}>
        Upload your required regulatory documents below. 
        {isGrower ? (
          <strong style={{color: '#991b1b'}}> Both documents are strictly required to post inventory.</strong>
        ) : (
          <strong style={{color: '#0ea5e9'}}> W-9 is strictly required to purchase. Vendor Packet is optional.</strong>
        )}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>W-9 Form <span style={{color: '#991b1b', fontSize: '12px'}}>*Required</span></h4>
          {myDocs.w9_url ? ( <p style={{ color: '#0ea5e9', fontWeight: 'bold', margin: '0 0 10px 0' }}>✅ Uploaded (<a href={fixImageUrl(myDocs.w9_url)} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9' }}>View</a>)</p> ) : ( <p style={{ color: '#991b1b', margin: '0 0 10px 0', fontWeight: 'bold' }}>❌ Missing Document</p> )}
          <form onSubmit={(e) => handleDocUpload(e, 'w9')} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="file" id="file-w9" className="modern-input" accept="image/jpeg, image/png, image/jpg, application/pdf" style={{ padding: '8px', background: '#f8fafc', cursor: 'pointer' }} />
            <button type="submit" className="btn-primary" style={{ padding: '8px 15px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px' }}>Save W-9</button>
          </form>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>
            {isGrower ? 'Food Safety Cert ' : 'Vendor Packet / Other '} 
            {isGrower ? <span style={{color: '#991b1b', fontSize: '12px'}}>*Required</span> : <span style={{color: '#64748b', fontSize: '12px'}}>(Optional)</span>}
          </h4>
          {myDocs.cert_url ? ( 
            <p style={{ color: '#0ea5e9', fontWeight: 'bold', margin: '0 0 10px 0' }}>✅ Uploaded{isGrower ? `: ${myDocs.cert_type}` : ''} (<a href={fixImageUrl(myDocs.cert_url)} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9' }}>View</a>)</p> 
          ) : ( 
            <p style={{ color: isGrower ? '#991b1b' : '#64748b', margin: '0 0 10px 0', fontWeight: 'bold' }}>{isGrower ? '❌ Missing Document' : 'No Document Uploaded'}</p> 
          )}
          <form onSubmit={(e) => handleDocUpload(e, 'cert', isGrower ? localCertType : 'Vendor Packet')} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isGrower && (
              <select value={localCertType} onChange={e => setLocalCertType(e.target.value)} className="modern-input" style={{ padding: '8px' }}>
                <option value="PrimusGFS">PrimusGFS</option>
                <option value="GlobalGAP">GlobalGAP</option>
                <option value="SQF">SQF</option>
                <option value="BRCGS">BRCGS</option>
                <option value="Other">Other</option>
              </select>
            )}
            <input type="file" id="file-cert" className="modern-input" accept="image/jpeg, image/png, image/jpg, application/pdf" style={{ padding: '8px', background: '#f8fafc', cursor: 'pointer' }} />
            <button type="submit" className="btn-primary" style={{ padding: '8px 15px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px' }}>{isGrower ? 'Save Certificate' : 'Save Document'}</button>
          </form>
        </div>
      </div>
    </CollapsiblePanel>
  );
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [view, setView] = useState(token ? (role === 'admin' ? 'admin' : 'cooler') : 'cooler');

  const [tick, setTick] = useState(0);
  useEffect(() => { const interval = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(interval); }, []);

  const [selectedMapLocation, setSelectedMapLocation] = useState(null); 
  const [apptTimes, setApptTimes] = useState({});
  const [userLocation, setUserLocation] = useState(null); 
  const [mapCenter, setMapCenter] = useState([35.7688, -119.2471]); 
  const [mapZoom, setMapZoom] = useState(9);

  const [expandedImage, setExpandedImage] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState('buyer');
  const [error, setError] = useState('');

  const [isSignUp, setIsSignUp] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regPaca, setRegPaca] = useState(''); 
  const [agreedToTerms, setAgreedToTerms] = useState(false); 
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);

  const [coolerData, setCoolerData] = useState([]);
  const [growerData, setGrowerData] = useState(null);
  const [myListings, setMyListings] = useState([]); 
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [buyerTotal, setBuyerTotal] = useState('0.00');
  
  const [growerOffers, setGrowerOffers] = useState([]);
  const [buyerOffers, setBuyerOffers] = useState([]);
  const [offeringPalletId, setOfferingPalletId] = useState(null);
  const [makeOfferAmount, setMakeOfferAmount] = useState('');
  const [counteringOfferId, setCounteringOfferId] = useState(null);
  const [counterAmount, setCounterAmount] = useState('');

  const [buyQty, setBuyQty] = useState({}); 
  const [newPalletsAvailable, setNewPalletsAvailable] = useState('');
  const [newBoxesPerPallet, setNewBoxesPerPallet] = useState('');

  const [adminStats, setAdminStats] = useState({ total_pallets: 0, total_revenue: '0.00' });
  const [adminUsers, setAdminUsers] = useState([]); 
  const [adminUnpaidOrders, setAdminUnpaidOrders] = useState([]); 
  const [adminListings, setAdminListings] = useState([]); 

  const [myDocs, setMyDocs] = useState({ w9_url: null, cert_url: null, cert_type: '' }); 

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('grower');
  const [newCompany, setNewCompany] = useState('');
  const [newPaca, setNewPaca] = useState(''); 

  const [newCommodity, setNewCommodity] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newPackStyle, setNewPackStyle] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newVariety, setNewVariety] = useState('');
  const [newBrand, setNewBrand] = useState(''); 
  
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [newLat, setNewLat] = useState(null); 
  const [newLon, setNewLon] = useState(null); 
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  const [newLoadingWindow, setNewLoadingWindow] = useState('Mon-Fri: 8:00 AM - 4:00 PM'); 
  const [newGrade, setNewGrade] = useState('Fancy');
  const [newSize, setNewSize] = useState('');
  const [newPaymentTerms, setNewPaymentTerms] = useState('Net 30'); 
  const [newStorageTemp, setNewStorageTemp] = useState(''); 

  const [newPhotoFile, setNewPhotoFile] = useState(null); 
  const [newPhotoFile2, setNewPhotoFile2] = useState(null);

  const [editingPalletId, setEditingPalletId] = useState(null);
  const [editBoxes, setEditBoxes] = useState('');
  const [editPrice, setEditPrice] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout_success') === 'true') {
      const orderId = params.get('order_id');
      fetch(`${API_URL}/api/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
      }).then(() => {
        alert('💳 Payment Successful! Your Purchase Order has been marked as PAID.');
        window.history.replaceState({}, document.title, "/"); 
        if (token) setView('orders'); 
      });
    }
    if (params.get('checkout_cancel') === 'true') {
      alert('Payment was cancelled. You can try again from your dashboard.');
      window.history.replaceState({}, document.title, "/"); 
      if (token) setView('orders');
    }
  }, [token]);

  const handleStripeCheckout = async (orderId, totalCost, poNumber) => {
    try {
      const res = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, total_cost: totalCost, po_number: poNumber })
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url; 
      } else { alert('Failed to initialize Stripe secure payment gateway.'); }
    } catch (err) { alert('Cannot connect to payment server.'); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, role: loginRole }) });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token); localStorage.setItem('userId', data.userId); localStorage.setItem('role', loginRole);
        setToken(data.token); setUserId(data.userId); setRole(loginRole);
        setView(loginRole === 'admin' ? 'admin' : 'cooler');
        setError('');
      } else { setError(data.message); }
    } catch (err) { setError('Cannot connect to server.'); }
  };

  const handlePublicSignUp = async (e) => { 
    e.preventDefault();
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service to create an account.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/public-signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: regEmail, password: regPassword, company_name: regCompany, paca_number: regPaca }) });
      const data = await res.json();
      if (data.success) { 
        alert('Account created! You can now log in.'); 
        setIsSignUp(false); setRegEmail(''); setRegPassword(''); setRegCompany(''); setRegPaca(''); setAgreedToTerms(false); setHasReadTerms(false); setError('');
      } else { setError(data.message); }
    } catch (err) { setError('Cannot connect to server.'); }
  };

  const handleLogout = () => { localStorage.clear(); setToken(null); setUserId(null); setRole(null); setView('cooler'); };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/create-user`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole, company_name: newCompany, paca_number: newPaca }) });
      const data = await res.json();
      if (data.success) { alert('Success! The new account is ready to use.'); setNewEmail(''); setNewPassword(''); setNewCompany(''); setNewPaca(''); fetchAdminData();
      } else { alert(data.message); }
    } catch (err) { alert('Failed to connect to server.'); }
  };

  const handleLocationSearch = (query) => {
    setNewLocation(query); 
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeoutId = setTimeout(async () => {
      if (query.length > 3) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us&limit=5`);
          const data = await res.json();
          setLocationResults(data);
        } catch (e) { setLocationResults([]); }
      } else { setLocationResults([]); }
    }, 800); 
    setSearchTimeout(timeoutId);
  };

  const handleAddPallet = async (e) => {
    e.preventDefault();
    if (!myDocs.w9_url || !myDocs.cert_url) { alert("🛑 COMPLIANCE HOLD: You must upload your documents before you can list inventory."); return; }
    if (!newLocation || newLocation.trim() === '') { alert("Please provide a physical Loading Location."); return; }
    if (!newPhotoFile || !newPhotoFile2) { alert("Please select BOTH a photo of the Box and Fruit!"); return; }
    
    let finalLat = newLat; let finalLon = newLon;

    if (!finalLat || !finalLon) {
      try {
        let searchRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newLocation)}&countrycodes=us&limit=1`);
        let searchData = await searchRes.json();
        if (searchData && searchData.length > 0) { finalLat = searchData[0].lat; finalLon = searchData[0].lon; } 
      } catch (err) {}
    }
    if (!finalLat || !finalLon) { finalLat = "35.7688"; finalLon = "-119.2471"; }

    const formData = new FormData();
    formData.append('grower_id', userId); formData.append('commodity_type', newCommodity); 
    formData.append('pallets_available', newPalletsAvailable); formData.append('boxes_per_pallet', newBoxesPerPallet); 
    formData.append('asking_price', newPrice); formData.append('pack_style', newPackStyle); formData.append('weight', newWeight); formData.append('variety', newVariety); formData.append('location', newLocation); formData.append('loading_window', newLoadingWindow); formData.append('grade', newGrade); 
    formData.append('size', newSize); formData.append('payment_terms', newPaymentTerms); formData.append('storage_temp', newStorageTemp);
    formData.append('brand', newBrand); formData.append('lat', finalLat); formData.append('lon', finalLon); 
    formData.append('photo', newPhotoFile); formData.append('photo2', newPhotoFile2);

    try {
      const res = await fetch(`${API_URL}/api/add-pallet`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        alert('Success! Your fruit is now live in the cooler.');
        setNewCommodity(''); setNewPalletsAvailable(''); setNewBoxesPerPallet(''); setNewPrice(''); setNewPackStyle(''); setNewWeight(''); setNewVariety(''); setNewBrand('');
        setNewLocation(''); setLocationResults([]); setNewLat(null); setNewLon(null);
        setNewLoadingWindow('Mon-Fri: 8:00 AM - 4:00 PM'); setNewGrade('Fancy'); setNewSize(''); setNewPaymentTerms('Net 30'); setNewStorageTemp('');
        setNewPhotoFile(null); setNewPhotoFile2(null);
        document.getElementById('file-box').value = ""; document.getElementById('file-fruit').value = "";
        refreshMyListings();
      } else { alert(data.message || 'Upload failed.'); }
    } catch (err) { alert('Failed to connect to server.'); }
  };

  const handleDocUpload = async (e, docType, certTypeValue) => {
    e.preventDefault();
    const fileInput = document.getElementById(`file-${docType}`);
    const file = fileInput.files[0];
    if (!file) return alert('Please select a file first.');
    const formData = new FormData();
    formData.append('user_id', userId); formData.append('doc_type', docType); formData.append('document', file);
    if (docType === 'cert') formData.append('cert_type', certTypeValue);

    try {
      const res = await fetch(`${API_URL}/api/upload-doc`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) { alert('Document uploaded securely to the vault!'); fileInput.value = ""; fetchMyDocs();
      } else { alert('Upload failed.'); }
    } catch(err) { alert('Server error'); }
  };

  const handleMarkPaid = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/api/mark-paid`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderId }) });
      if ((await res.json()).success) { alert('Invoice marked as paid!'); fetchAdminData(); }
    } catch (err) {}
  };

  const handleDeletePallet = async (palletId) => {
    if (!window.confirm("Are you sure you want to permanently delete this listing?")) return;
    try {
      const res = await fetch(`${API_URL}/api/delete-pallet/${palletId}`, { method: 'DELETE' });
      if ((await res.json()).success) refreshMyListings(); 
    } catch(err) {}
  };

  const handleAdminDeletePallet = async (palletId) => {
    if (!window.confirm("ADMIN OVERRIDE: Are you sure you want to permanently delete this user's listing?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin-delete-pallet/${palletId}`, { method: 'DELETE' });
      if ((await res.json()).success) fetchAdminData(); 
    } catch(err) {}
  };

  const handleSaveEdit = async (palletId) => {
    try {
      const res = await fetch(`${API_URL}/api/edit-pallet/${palletId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pallets_available: editBoxes, asking_price: editPrice }) });
      if ((await res.json()).success) { setEditingPalletId(null); refreshMyListings(); }
    } catch(err) {}
  };

  const handleMakeOffer = async (palletId, growerId) => {
    if (!myDocs.w9_url) { alert('🛑 COMPLIANCE HOLD: You must upload your W-9 before making an offer.'); setView('orders'); return; }
    const pallet = coolerData.find(p => p.id === palletId);
    if (pallet.loading_window === 'By Appointment Only' && !apptTimes[palletId]) { alert('Please select an appointment time before offering.'); return; }
    
    const qty = buyQty[palletId] || 1;
    try {
      const res = await fetch(`${API_URL}/api/offers/make`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pallet_id: palletId, buyer_id: userId, grower_id: growerId, offer_amount: makeOfferAmount, appointment_time: apptTimes[palletId] || null, buy_pallets: qty }) });
      const data = await res.json();
      if (data.success) { alert(`Offer for ${qty} pallet(s) sent to the grower!`); setOfferingPalletId(null); setMakeOfferAmount(''); fetchTradingFloor(); }
    } catch(err) { alert('Failed to send offer.'); }
  };

  const handleCounterOffer = async (offerId) => {
    try {
      const res = await fetch(`${API_URL}/api/offers/counter`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ offer_id: offerId, new_amount: counterAmount, actor: role }) });
      if ((await res.json()).success) { setCounteringOfferId(null); setCounterAmount(''); fetchTradingFloor(); }
    } catch(err) {}
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      const res = await fetch(`${API_URL}/api/offers/accept`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ offer_id: offerId }) });
      const data = await res.json();
      if (data.success) { alert(`Deal Locked! PO Generated: ${data.po_number}`); fetchTradingFloor(); if (role === 'buyer') setView('orders'); } else { alert(data.message); }
    } catch(err) {}
  };

  const handleRejectOffer = async (offerId) => {
    try {
      const res = await fetch(`${API_URL}/api/offers/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ offer_id: offerId }) });
      if ((await res.json()).success) fetchTradingFloor();
    } catch(err) {}
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("WARNING: This will void the PO and return the pallets to the marketplace. Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/api/cancel-order`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderId }) });
      const data = await res.json();
      if (data.success) { 
        alert('Order Voided. Pallets returned.'); 
        fetch(`${API_URL}/api/buyer-orders/${userId}`).then(res => res.json()).then(data => { if(data.success) { setBuyerOrders(data.orders); setBuyerTotal(data.total_owed); } });
      } else { alert(data.message || 'Failed to cancel.'); }
    } catch(err) { alert('Server error'); }
  };

  const fetchTradingFloor = () => {
    if (role === 'grower') { fetch(`${API_URL}/api/offers/grower/${userId}`).then(r => r.json()).then(d => { if(d.success) setGrowerOffers(d.offers) }); } 
    else if (role === 'buyer') { fetch(`${API_URL}/api/offers/buyer/${userId}`).then(r => r.json()).then(d => { if(d.success) setBuyerOffers(d.offers) }); }
  };

  const refreshMyListings = () => { fetch(`${API_URL}/api/my-listings/${userId}`).then(r => r.json()).then(d => { if(d.success) setMyListings(d.listings) }); };
  const fetchMyDocs = () => { fetch(`${API_URL}/api/my-docs/${userId}`).then(r => r.json()).then(d => { if(d.success) setMyDocs(d.docs) }); };
  
  const fetchAdminData = () => {
    fetch(`${API_URL}/api/admin-dashboard`).then(r => r.json()).then(d => { if(d.success) setAdminStats(d); });
    fetch(`${API_URL}/api/admin-users`).then(r => r.json()).then(d => { if(d.success) setAdminUsers(d.users); });
    fetch(`${API_URL}/api/admin-orders`).then(r => r.json()).then(d => { if(d.success) setAdminUnpaidOrders(d.orders); }); 
    fetch(`${API_URL}/api/admin-listings`).then(r => r.json()).then(d => { if(d.success) setAdminListings(d.listings); }); 
  };

  useEffect(() => {
    if (view === 'cooler') { fetch(`${API_URL}/api/live-cooler`).then(res => res.json()).then(data => { if(data.success) setCoolerData(data.data) }); }
    if (!token) return;

    fetchTradingFloor(); 
    if (view === 'dashboard') { fetch(`${API_URL}/api/grower-dashboard/${userId}`).then(res => res.json()).then(data => { if(data.success) setGrowerData(data) }); refreshMyListings(); fetchMyDocs(); } 
    else if (view === 'orders') { fetch(`${API_URL}/api/buyer-orders/${userId}`).then(res => res.json()).then(data => { if(data.success) { setBuyerOrders(data.orders); setBuyerTotal(data.total_owed); } }); fetchMyDocs(); } 
    else if (view === 'admin') { fetchAdminData(); }
  }, [view, token, userId]);

  const handleBuy = async (palletId) => {
    if (!myDocs.w9_url) { alert('🛑 COMPLIANCE HOLD: You must upload your W-9 in the Compliance Vault before making a purchase.'); setView('orders'); return; }
    const pallet = coolerData.find(p => p.id === palletId);
    if (pallet.loading_window === 'By Appointment Only' && !apptTimes[palletId]) { alert('Please select an appointment time before buying.'); return; }
    
    const qty = buyQty[palletId] || 1;
    try {
      const res = await fetch(`${API_URL}/api/buy-now`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ buyer_id: userId, pallet_id: palletId, appointment_time: apptTimes[palletId] || null, buy_pallets: qty }) });
      const data = await res.json();
      if (data.success) { alert(`Success! PO generated for ${qty} pallet(s). PO Number: ${data.po_number}`); setView('orders'); } else { alert(data.message); }
    } catch (err) { alert('Purchase failed.'); }
  };

  const handlePrintPO = () => { window.print(); };

  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setUserLocation([lat, lon]); setMapCenter([lat, lon]); setMapZoom(11);
        },
        () => alert("Location access denied or unavailable.")
      );
    } else { alert("Geolocation is not supported by this browser."); }
  };

  const uniqueLocations = useMemo(() => {
    const locations = {};
    coolerData.forEach(p => {
      if (!p.location || !p.lat || !p.lon) return; 
      if (!locations[p.location]) { locations[p.location] = { lat: p.lat, lon: p.lon, count: 0 }; }
      locations[p.location].count += 1;
    });
    return Object.entries(locations).map(([name, data]) => ({ name, ...data }));
  }, [coolerData]);

  const formatApptDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

  const renderLightbox = () => {
    if (!expandedImage) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 23, 0.95)', zIndex: 100000, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'zoom-out', backdropFilter: 'blur(8px)' }} onClick={() => setExpandedImage(null)}>
        <img src={expandedImage} style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain', borderRadius: '8px', border: '2px solid #38bdf8', boxShadow: '0 20px 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()} />
        <button onClick={() => setExpandedImage(null)} style={{ position: 'absolute', top: '25px', right: '35px', background: 'rgba(15, 23, 42, 0.8)', border: '2px solid #38bdf8', borderRadius: '50%', color: 'white', width: '50px', height: '50px', fontSize: '24px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✕</button>
      </div>
    );
  };

  // --- 1. LOGIN VIEW ---
  if (view === 'login') {
    return (
      <PageWrapper>
        {renderLightbox()}
        
        {showTermsModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 23, 0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
            <div className="card" style={{ background: 'white', padding: '30px', borderRadius: '12px', maxWidth: '600px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>Terms of Service & Protection Policy</h2>
                <button onClick={() => setShowTermsModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
              </div>
              <div style={{ overflowY: 'auto', flex: 1, paddingRight: '15px', fontSize: '13px', lineHeight: '1.6', color: '#475569' }}>
                <p><strong>1. FREE MEMBERSHIP:</strong> The Heavy Terminal is 100% free to sign up and maintain a membership. There are no hidden subscription fees to access the platform.</p>
                <p><strong>2. NATURE OF THE PLATFORM:</strong> The Heavy Terminal operates strictly as a digital marketplace. We handle the matchmaking, PO generation, and regulatory compliance checks. The Facilitator is not a buyer, seller, broker, or inspector of perishable agricultural commodities.</p>
                <p><strong>3. PLATFORM FEES:</strong> A flat toll fee of $0.35 per box shall be assessed on every pallet successfully transacted through the platform.</p>
                <p><strong>4. PLATFORM PROTECTION & ESCROW (THE 6-MONTH RULE):</strong> To ensure secure transactions and verified compliance, all initial orders matched on The Heavy Terminal must be processed through the platform. If a Buyer and a Grower are connected through our system, they are legally bound to process transactions on-platform for six (6) months. Attempting to bypass the system to avoid the $0.35 fee constitutes a material breach and will result in permanent removal.</p>
                <p><strong>5. HOLD HARMLESS:</strong> User agrees to fully indemnify and hold harmless The Heavy Terminal and its developers from any claims arising out of spoilage, unpaid invoices, disputes, or logistical failures.</p>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '15px', textAlign: 'center' }}>
                <button type="button" onClick={() => { setHasReadTerms(true); setAgreedToTerms(true); setShowTermsModal(false); }} className="btn-primary" style={{ width: '100%', background: '#0ea5e9', padding: '12px', fontSize: '15px', fontWeight: 'bold' }}>I Have Read and Agree</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(5px)' }}>
          <div className="card" style={{ padding: '40px', width: '100%', maxWidth: isSignUp ? '550px' : '400px', background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 20px 40px rgba(0,0,0,0.8)', animation: 'fadeIn 0.5s ease-out', borderRadius: '12px' }}>
            <button onClick={() => setView('cooler')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', marginBottom: '20px', display: 'block', fontWeight: 'bold' }}>← Back to Map</button>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}><div style={{ background: '#0f172a', color: '#38bdf8', padding: '15px', borderRadius: '12px', display: 'inline-block', fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', border: '2px solid #38bdf8', boxShadow: '0 0 15px rgba(56,189,248,0.3)' }}>HT</div><h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a', fontWeight: '900', letterSpacing: '1px' }}>THE HEAVY TERMINAL</h1><p style={{ color: '#64748b', marginTop: '5px' }}>{isSignUp ? "Register a verified wholesale account." : "Enter your credentials to access the cooler."}</p></div>
            {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' }}>{error}</div>}
            
            {isSignUp ? (
              <form onSubmit={handlePublicSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Company Name</label><input type="text" required value={regCompany} onChange={e => setRegCompany(e.target.value)} className="modern-input" /></div>
                  <div><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>PACA License Number</label><input type="text" required value={regPaca} onChange={e => setRegPaca(e.target.value)} className="modern-input" placeholder="Required" /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Email</label><input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} className="modern-input" /></div>
                  <div><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Password</label><input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)} className="modern-input" /></div>
                </div>
                <div style={{ background: hasReadTerms ? '#f8fafc' : '#fef2f2', padding: '15px', borderRadius: '8px', border: hasReadTerms ? '1px solid #cbd5e1' : '1px solid #fca5a5', transition: 'all 0.3s' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input type="checkbox" id="terms-checkbox" required disabled={!hasReadTerms} checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} style={{ marginTop: '2px', cursor: hasReadTerms ? 'pointer' : 'not-allowed', transform: 'scale(1.1)' }} />
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', lineHeight: '1.4' }}>I agree to the <span onClick={() => setShowTermsModal(true)} style={{ color: '#0ea5e9', textDecoration: 'underline', cursor: 'pointer' }}>Heavy Terminal Terms of Service</span>{!hasReadTerms && <span style={{ color: '#ef4444', display: 'block', fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>* You must click and read the terms before accepting.</span>}</label>
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ background: '#38bdf8', color: '#0f172a', fontSize: '16px', padding: '12px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(56, 189, 248, 0.4)', opacity: hasReadTerms ? 1 : 0.5 }}>Create Secure Account</button>
                <button type="button" onClick={() => {setIsSignUp(false); setError(''); setHasReadTerms(false); setAgreedToTerms(false);}} style={{ background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>← Back to Login</button>
              </form>
            ) : (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="modern-input" /></div>
                <div><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Password</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="modern-input" /></div>
                <div><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Account Type</label><select value={loginRole} onChange={e => setLoginRole(e.target.value)} className="modern-input"><option value="buyer">Buyer Account</option><option value="grower">Grower Account</option><option value="admin">Admin (HQ Only)</option></select></div>
                <button type="submit" className="btn-primary" style={{ background: '#38bdf8', color: '#0f172a', fontSize: '16px', padding: '12px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(56, 189, 248, 0.4)' }}>Secure Login</button>
                <div style={{ textAlign: 'center', marginTop: '10px' }}><span style={{ fontSize: '14px', color: '#64748b' }}>New wholesale buyer? </span><button type="button" onClick={() => {setIsSignUp(true); setError('');}} style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontSize: '14px', fontWeight: '900' }}>Create an account</button></div>
              </form>
            )}
          </div>
        </div>
      </PageWrapper>
    );
  }

  // --- 2. ADMIN VIEW ---
  if (view === 'admin') {
    return (
      <PageWrapper>
        {renderLightbox()}
        <Navbar title="HQ Admin Control Room" role={role} view={view} setView={setView} handleLogout={handleLogout} token={token} />
        <ContentWrapper>
        <div style={{ padding: '0 40px 0 40px', maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '30px', background: '#0f172a', color: 'white', border: 'none' }}>
              <p style={{ color: '#94a3b8', fontWeight: '600', margin: '0 0 5px 0' }}>Total Terminal Revenue</p>
              <h2 style={{ fontSize: '48px', color: '#38bdf8', margin: 0 }}>${adminStats.total_revenue}</h2>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '10px', margin: '5px 0 0 0' }}>From $0.35 per-box fees</p>
            </div>
            <div className="card" style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', height: 'auto' }}><p style={{ color: '#64748b', fontWeight: '600', margin: '0 0 5px 0' }}>Total Pallets Moved</p><h2 style={{ fontSize: '42px', color: '#0f172a', margin: 0 }}>{adminStats.total_pallets}</h2></div>
          </div>
          <div className="card" style={{ padding: '30px', height: 'auto', background: 'rgba(255, 255, 255, 0.95)' }}>
            <h2 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>Create New Account</h2>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Company Name</label><input type="text" required value={newCompany} onChange={e => setNewCompany(e.target.value)} className="modern-input" /></div>
              <div><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Login Email</label><input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} className="modern-input" /></div>
              <div><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Temporary Password</label><input type="text" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="modern-input" /></div>
              <div><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>PACA Number</label><input type="text" value={newPaca} onChange={e => setNewPaca(e.target.value)} className="modern-input" placeholder="Optional for Growers" /></div>
              <div><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Account Role</label><select value={newRole} onChange={e => setNewRole(e.target.value)} className="modern-input"><option value="grower">Seller / Grower</option><option value="buyer">Wholesale Buyer</option></select></div>
              <button type="submit" className="btn-primary" style={{ background: '#0f172a', marginTop: '10px' }}>Generate Account</button>
            </form>
          </div>

          <div className="card" style={{ padding: '30px', gridColumn: '1 / -1', background: 'rgba(255, 255, 255, 0.95)', border: '2px solid #ef4444', height: 'auto' }}>
            <h2 style={{ margin: '0 0 5px 0', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '10px' }}>⚠️ Global Market Oversight (Override)</h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>As Admin, you have authority to delete any active listing on the platform.</p>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}><th style={{ padding: '10px' }}>Grower</th><th style={{ padding: '10px' }}>Commodity</th><th style={{ padding: '10px' }}>Boxes</th><th style={{ padding: '10px' }}>Price</th><th style={{ padding: '10px' }}>Action</th></tr></thead>
                <tbody>
                  {adminListings.map(pallet => (
                    <tr key={pallet.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: '600' }}>{pallet.grower_company}</td>
                      <td style={{ padding: '10px' }}>{pallet.commodity_type} - {pallet.variety}</td>
                      <td style={{ padding: '10px' }}>{pallet.quantity_boxes}</td>
                      <td style={{ padding: '10px', color: '#0ea5e9', fontWeight: 'bold' }}>${pallet.asking_price}</td>
                      <td style={{ padding: '10px' }}>
                        <button onClick={() => handleAdminDeletePallet(pallet.id)} className="btn-secondary" style={{ color: '#ef4444', border: '1px solid #fca5a5', padding: '4px 10px', fontSize: '11px', background: '#fef2f2' }}>Override Delete</button>
                      </td>
                    </tr>
                  ))}
                  {adminListings.length === 0 && <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No active fruit on the platform.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ padding: '30px', gridColumn: '1 / -1', background: 'rgba(255, 255, 255, 0.95)', height: 'auto' }}>
            <h2 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>Accounts Receivable (Unpaid Invoices)</h2><p style={{ color: '#64748b', marginBottom: '20px' }}>Mark invoices as paid once the check clears.</p>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}><th style={{ padding: '10px' }}>Date</th><th style={{ padding: '10px' }}>Buyer</th><th style={{ padding: '10px' }}>PO Number</th><th style={{ padding: '10px' }}>Invoice Total</th><th style={{ padding: '10px' }}>Action</th></tr></thead>
              <tbody>
                {adminUnpaidOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '15px 10px', color: '#64748b' }}>{new Date(order.created_at).toLocaleDateString()}</td><td style={{ padding: '15px 10px', fontWeight: '600' }}>{order.buyer_company}</td><td style={{ padding: '15px 10px' }}>{order.po_number}</td><td style={{ padding: '15px 10px', fontWeight: 'bold', color: '#991b1b' }}>${order.total_cost}</td><td style={{ padding: '15px 10px' }}><button onClick={() => handleMarkPaid(order.id)} className="btn-primary" style={{ background: '#0ea5e9', padding: '6px 12px', fontSize: '12px' }}>Mark as Paid</button></td></tr>
                ))}
                {adminUnpaidOrders.length === 0 && <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>All invoices are paid!</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="card" style={{ padding: '30px', gridColumn: '1 / -1', background: 'rgba(255, 255, 255, 0.95)', height: 'auto' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Partner Compliance Roster</h2>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead><tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}><th style={{ padding: '10px' }}>Company</th><th style={{ padding: '10px' }}>Email</th><th style={{ padding: '10px' }}>Type</th><th style={{ padding: '10px' }}>PACA #</th><th style={{ padding: '10px' }}>W-9</th><th style={{ padding: '10px' }}>Cert</th></tr></thead>
              <tbody>{adminUsers.filter(u => u.role !== 'admin').map(user => (<tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '15px 10px', fontWeight: '500' }}>{user.company_name}</td><td style={{ padding: '15px 10px', color: '#0ea5e9', userSelect: 'all' }}>{user.email}</td><td style={{ padding: '15px 10px', textTransform: 'capitalize' }}>{user.role}</td><td style={{ padding: '15px 10px', color: '#64748b' }}>{user.paca_number || 'N/A'}</td><td style={{ padding: '15px 10px' }}>{user.w9_url ? <a href={fixImageUrl(user.w9_url)} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', fontWeight: '600' }}>View</a> : <span style={{ color: '#991b1b' }}>Missing</span>}</td><td style={{ padding: '15px 10px' }}>{user.cert_url ? <a href={fixImageUrl(user.cert_url)} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', fontWeight: '600' }}>View</a> : <span style={{ color: '#991b1b' }}>Missing</span>}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
        </ContentWrapper>
      </PageWrapper>
    );
  }

  // --- 3. ORDERS VIEW (BUYER DASHBOARD) ---
  if (view === 'orders') {
    return (
      <PageWrapper>
        {renderLightbox()}
        <Navbar title="Buyer Dashboard" role={role} view={view} setView={setView} handleLogout={handleLogout} token={token} />
        <ContentWrapper>
        <div style={{ padding: '0 40px 0 40px', maxWidth: '1000px', margin: '0 auto' }}>
          
          {buyerOffers.length > 0 && (
            <CollapsiblePanel title="Active Negotiations" icon="🤝" defaultOpen={true}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {buyerOffers.map(offer => (
                  <div key={offer.id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>{offer.commodity_type} - {offer.variety}</h4>
                      <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Original Asking: ${offer.asking_price} • Terms: {offer.payment_terms}</p>
                      {offer.appointment_time && <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#0ea5e9', fontWeight: 'bold' }}>📅 Requested Pickup: {formatApptDate(offer.appointment_time)}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: 'bold', color: offer.last_actor === 'grower' ? '#d97706' : '#64748b' }}>
                        {offer.last_actor === 'grower' ? '🚨 GROWER COUNTERED' : 'WAITING ON GROWER'}
                      </p>
                      <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Current Offer: <span style={{ color: '#0ea5e9' }}>${offer.current_offer}</span></h3>
                      
                      {offer.last_actor === 'grower' && (
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleAcceptOffer(offer.id)} className="btn-primary" style={{ padding: '6px 15px', background: '#0ea5e9', fontSize: '13px', width: 'auto' }}>Accept Deal</button>
                          {counteringOfferId === offer.id ? (
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <input type="number" step="0.01" value={counterAmount} onChange={e => setCounterAmount(e.target.value)} className="modern-input" style={{ padding: '4px', width: '80px' }} placeholder="$" />
                              <button onClick={() => handleCounterOffer(offer.id)} className="btn-primary" style={{ padding: '6px 10px', fontSize: '13px', width: 'auto', background: '#0f172a' }}>Send</button>
                            </div>
                          ) : (
                            <button onClick={() => setCounteringOfferId(offer.id)} className="btn-secondary" style={{ padding: '6px 15px', fontSize: '13px', border: '1px solid #cbd5e1', background: 'white' }}>Counter</button>
                          )}
                          <button onClick={() => handleRejectOffer(offer.id)} className="btn-secondary" style={{ padding: '6px 15px', fontSize: '13px', color: '#991b1b', border: 'none' }}>Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsiblePanel>
          )}
          
          <CollapsiblePanel title="Account Ledger & Balance" icon="💳" defaultOpen={true}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>Total Outstanding Balance</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Invoices to be paid via negotiated terms. (*Includes $0.35 HT fee/box)</p>
              </div>
              <h2 style={{ margin: 0, fontSize: '36px', color: '#991b1b' }}>${buyerTotal}</h2>
            </div>
          </CollapsiblePanel>

          <ComplianceCard myDocs={myDocs} handleDocUpload={handleDocUpload} role={role} />
          
          <CollapsiblePanel title="Purchased Pallets & PO Records" icon="🧾" defaultOpen={false}>
            <div style={{ textAlign: 'right', marginBottom: '15px' }}>
              <button onClick={handlePrintPO} className="btn-secondary hide-on-print" style={{ background: 'white', color: '#0f172a', border: '1px solid #cbd5e1' }}>🖨 Print PO Records</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {buyerOrders.map((order, i) => {
                const orderTime = new Date(order.created_at).getTime();
                const msPassed = Date.now() - orderTime;
                const msRemaining = (10 * 60 * 1000) - msPassed;
                const canCancel = msRemaining > 0;
                const minsLeft = Math.floor(msRemaining / 60000);
                const secsLeft = Math.floor((msRemaining % 60000) / 1000);
                const timeString = `${minsLeft}:${secsLeft < 10 ? '0' : ''}${secsLeft}`;

                return (
                <div key={i} className="card po-record" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(248, 250, 252, 0.95)', border: '1px solid #e2e8f0', height: 'auto' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div className="hide-on-print" style={{ display: 'flex', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={fixImageUrl(order.photo_url)} style={{ width: order.photo_url_2 ? '50%' : '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }} onClick={(e) => { e.stopPropagation(); setExpandedImage(fixImageUrl(order.photo_url)); }} />
                      {order.photo_url_2 && <img src={fixImageUrl(order.photo_url_2)} style={{ width: '50%', height: '100%', objectFit: 'cover', borderLeft: '1px solid white', cursor: 'zoom-in' }} onClick={(e) => { e.stopPropagation(); setExpandedImage(fixImageUrl(order.photo_url_2)); }} />}
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>
                        {order.purchased_pallets} Pallets of {order.commodity_type} <span style={{ fontWeight: 'normal', color: '#64748b' }}>({order.purchased_boxes} boxes)</span>
                        <span style={{ fontSize: '12px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '6px', fontWeight: '600', color: '#475569' }}>{order.grade}</span>
                      </h3>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>PO Number: <strong>{order.po_number}</strong> {order.brand && `| Brand: ${order.brand}`}</p>
                      <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '12px' }}>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                      <p style={{ margin: '5px 0 0 0', color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}>📍 Pickup: <span style={{ fontWeight: 'normal', color: '#475569' }}>{order.location}</span></p>
                      {order.appointment_time && <p style={{ margin: '5px 0 0 0', color: '#166534', fontSize: '12px', fontWeight: 'bold' }}>📅 Scheduled: {formatApptDate(order.appointment_time)}</p>}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }} className="hide-on-print">
                         {order.grower_w9 && <a href={fixImageUrl(order.grower_w9)} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: '11px', padding: '4px 8px', border: '1px solid #cbd5e1' }}>📄 View Grower W-9</a>}
                         {order.grower_cert && <a href={fixImageUrl(order.grower_cert)} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: '11px', padding: '4px 8px', border: '1px solid #cbd5e1' }}>📄 View {order.cert_type || 'Safety'} Cert</a>}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ margin: '0 0 5px 0', color: '#0ea5e9', fontSize: '24px' }}>${order.total_cost}</h3>
                    <div style={{ marginBottom: '10px' }}>
                      {order.payment_status === 'paid' ? 
                        <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>✓ PAID</span> : 
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>UNPAID</span>
                          <button onClick={() => handleStripeCheckout(order.id, order.total_cost, order.po_number)} className="hide-on-print" style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>💳 Pay Now</button>
                        </div>
                      }
                    </div>
                    {canCancel && (
                      <button onClick={() => handleCancelOrder(order.id)} className="hide-on-print" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '4px', padding: '6px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}>
                        ⏳ Cancel Window: {timeString}
                      </button>
                    )}
                  </div>
                </div>
              )})}
              {buyerOrders.length === 0 && (<div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>You haven't bought any pallets yet. Check the Live Cooler!</div>)}
            </div>
          </CollapsiblePanel>
        </div>
        </ContentWrapper>
      </PageWrapper>
    );
  }

  // --- 4. DASHBOARD VIEW (GROWER) ---
  if (view === 'dashboard') {
    return (
      <PageWrapper>
        {renderLightbox()}
        <Navbar title="Grower Dashboard" role={role} view={view} setView={setView} handleLogout={handleLogout} token={token} />
        <ContentWrapper>
        <div style={{ padding: '0 40px 0 40px', maxWidth: '1200px', margin: '0 auto' }}>
          
          <ComplianceCard myDocs={myDocs} handleDocUpload={handleDocUpload} role={role} />

          {growerOffers.length > 0 && (
            <div className="card hide-on-print" style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.95)', border: '2px solid #d97706', marginBottom: '30px', height: 'auto' }}>
              <h2 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>🔔 Action Required: Incoming Offers</h2>
              <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>Review the PACA license of the buyer before accepting. You are allowed 2 counteroffers per negotiation.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {growerOffers.map(offer => (
                  <div key={offer.id} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>Offer for {offer.requested_pallets} Pallets of {offer.commodity_type} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'normal' }}>(Original Price: ${offer.asking_price})</span></h3>
                      <p style={{ margin: '0 0 5px 0', color: '#0ea5e9', fontWeight: 'bold' }}>Buyer: HT Verified Buyer | PACA #: {offer.paca_number || 'N/A'}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Requested Terms: {offer.payment_terms} | Counters used: {offer.grower_counter_count} / 2</p>
                      {offer.appointment_time && <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#d97706', fontWeight: 'bold' }}>📅 Requested Pickup: {formatApptDate(offer.appointment_time)}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: 'bold', color: offer.last_actor === 'buyer' ? '#d97706' : '#64748b' }}>
                        {offer.last_actor === 'buyer' ? 'YOUR TURN TO RESPOND' : 'WAITING ON BUYER'}
                      </p>
                      <h2 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '32px' }}>${offer.current_offer} <span style={{fontSize: '14px', color: '#64748b'}}>/ box</span></h2>
                      
                      {offer.last_actor === 'buyer' && (
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleAcceptOffer(offer.id)} className="btn-primary" style={{ padding: '8px 20px', background: '#0ea5e9', width: 'auto' }}>Accept Deal</button>
                          
                          {offer.grower_counter_count < 2 && (
                            counteringOfferId === offer.id ? (
                              <div style={{ display: 'flex', gap: '5px' }}>
                                <input type="number" step="0.01" value={counterAmount} onChange={e => setCounterAmount(e.target.value)} className="modern-input" style={{ padding: '6px', width: '90px' }} placeholder="$" />
                                <button onClick={() => handleCounterOffer(offer.id)} className="btn-primary" style={{ padding: '8px 15px', width: 'auto', background: '#d97706' }}>Send</button>
                              </div>
                            ) : (
                              <button onClick={() => setCounteringOfferId(offer.id)} className="btn-secondary" style={{ padding: '8px 20px', border: '1px solid #cbd5e1', background: 'white', color: '#d97706' }}>Counter</button>
                            )
                          )}
                          
                          <button onClick={() => handleRejectOffer(offer.id)} className="btn-secondary" style={{ padding: '8px 20px', color: '#991b1b', border: 'none', background: '#fee2e2' }}>Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
            {growerData && (<div className="card" style={{ padding: '30px', height: 'fit-content', background: 'rgba(255, 255, 255, 0.95)' }}><p style={{ color: '#64748b', fontWeight: '600' }}>Total Sales Revenue</p><h2 style={{ fontSize: '42px', color: '#0ea5e9', margin: 0 }}>${growerData.total_net_profit}</h2></div>)}
            
            <div className="card" style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.95)', height: 'auto' }}>
              <h2 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>Add Inventory to Cooler</h2>
              
              {(!myDocs.w9_url || !myDocs.cert_url) ? (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '8px', marginTop: '20px' }}>
                  <span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>🔒</span>
                  <h3 style={{ color: '#0f172a', margin: '0 0 10px 0' }}>Market Access Locked</h3>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>You must upload your W-9 and Food Safety Certificate in the Compliance Vault above before you can post inventory.</p>
                </div>
              ) : (
                <>
                  <p style={{ color: '#64748b', marginBottom: '25px' }}>Upload your specs, a photo of the box, and a photo of the fruit.</p>
                  <form onSubmit={handleAddPallet} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Commodity (e.g. Grapes)</label><input type="text" required value={newCommodity} onChange={e => setNewCommodity(e.target.value)} className="modern-input" /></div>
                      <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Variety</label><input type="text" value={newVariety} onChange={e => setNewVariety(e.target.value)} className="modern-input" /></div>
                      <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Brand</label><input type="text" value={newBrand} onChange={e => setNewBrand(e.target.value)} className="modern-input" placeholder="e.g. Sunview" /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Pack Style</label><input type="text" value={newPackStyle} onChange={e => setNewPackStyle(e.target.value)} className="modern-input" /></div>
                      <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Weight</label><input type="text" value={newWeight} onChange={e => setNewWeight(e.target.value)} className="modern-input" /></div>
                      <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Size (e.g. 88s)</label><input type="text" value={newSize} onChange={e => setNewSize(e.target.value)} className="modern-input" /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Total Pallets Available</label><input type="number" required value={newPalletsAvailable} onChange={e => setNewPalletsAvailable(e.target.value)} className="modern-input" /></div>
                      <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Boxes per Pallet</label><input type="number" required value={newBoxesPerPallet} onChange={e => setNewBoxesPerPallet(e.target.value)} className="modern-input" placeholder="e.g. 54" /></div>
                      <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Asking Price ($/box)</label><input type="number" step="0.01" required value={newPrice} onChange={e => setNewPrice(e.target.value)} className="modern-input" /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Grade</label><select value={newGrade} onChange={e => setNewGrade(e.target.value)} className="modern-input" style={{ width: '100%' }}><option value="Fancy">Fancy</option><option value="Combo">Combo</option><option value="Choice">Choice</option><option value="Premium">Premium</option><option value="Standard">Standard</option></select></div>
                      <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>💳 Payment Terms</label>
                        <select value={newPaymentTerms} onChange={e => setNewPaymentTerms(e.target.value)} className="modern-input" style={{ width: '100%' }}>
                          <option value="Net 7">Net 7</option>
                          <option value="Net 14">Net 14</option>
                          <option value="Net 21">Net 21</option>
                          <option value="Net 30">Net 30</option>
                          <option value="Payment upon Purchase">Payment upon Purchase</option>
                        </select>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '15px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ flex: 2, position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#0ea5e9' }}>📍 Verified Loading Location</label>
                        <input type="text" required value={newLocation} onChange={e => handleLocationSearch(e.target.value)} className="modern-input" placeholder="Start typing U.S. address..." autoComplete="off" />
                        {locationResults.length > 0 && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', marginTop: '5px' }}>
                            {locationResults.map((result, idx) => (
                              <div key={idx} onClick={() => { setLocationQuery(result.display_name); setNewLocation(result.display_name); setNewLat(result.lat); setNewLon(result.lon); setLocationResults([]); }} style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '13px', color: '#0f172a', lineHeight: '1.4' }} onMouseEnter={e => e.target.style.background = '#f8fafc'} onMouseLeave={e => e.target.style.background = 'white'}>📍 {result.display_name}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#0ea5e9' }}>🕒 Loading Hours</label>
                        <select required value={newLoadingWindow} onChange={e => setNewLoadingWindow(e.target.value)} className="modern-input" style={{ width: '100%' }}>
                          <option value="Mon-Fri: 8:00 AM - 4:00 PM">Mon-Fri: 8:00 AM - 4:00 PM</option>
                          <option value="Mon-Fri: 6:00 AM - 2:00 PM">Mon-Fri: 6:00 AM - 2:00 PM</option>
                          <option value="Mon-Sat: 8:00 AM - 4:00 PM">Mon-Sat: 8:00 AM - 4:00 PM</option>
                          <option value="Mon-Sat: 7:00 AM - 3:00 PM">Mon-Sat: 7:00 AM - 3:00 PM</option>
                          <option value="7 Days a Week: 8:00 AM - 4:00 PM">7 Days a Week: 8:00 AM - 4:00 PM</option>
                          <option value="By Appointment Only">By Appointment Only</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#0ea5e9' }}>❄️ Storage Temp</label><input type="text" required value={newStorageTemp} onChange={e => setNewStorageTemp(e.target.value)} className="modern-input" placeholder="e.g. 34°F" /></div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>📦 Upload Box Photo</label><input type="file" id="file-box" className="modern-input" accept="image/jpeg, image/png, image/jpg, image/webp" onChange={e => setNewPhotoFile(e.target.files[0])} style={{ padding: '8px', background: '#f8fafc', cursor: 'pointer' }} /></div>
                      <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>🍇 Upload Fruit Photo</label><input type="file" id="file-fruit" className="modern-input" accept="image/jpeg, image/png, image/jpg, image/webp" onChange={e => setNewPhotoFile2(e.target.files[0])} style={{ padding: '8px', background: '#f8fafc', cursor: 'pointer' }} /></div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '10px', background: '#0ea5e9' }}>List Pallet in Cooler</button>
                  </form>
                </>
              )}
            </div>
          </div>

          <h3 style={{ margin: '40px 0 20px 0', color: '#0f172a', background: 'rgba(255,255,255,0.95)', padding: '15px 20px', borderRadius: '8px', display: 'inline-block' }}>My Active Listings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            {myListings.map(pallet => (
              <div key={pallet.id} className="card" style={{ padding: '15px', border: '1px solid #0ea5e9', background: 'rgba(255, 255, 255, 0.95)', height: 'auto', minHeight: 'fit-content' }}>
                <div style={{ display: 'flex', height: '120px', width: '100%', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px', background: '#0f172a', flexShrink: 0 }}>
                  <img src={fixImageUrl(pallet.photo_url)} style={{ width: pallet.photo_url_2 ? '50%' : '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }} onClick={(e) => { e.stopPropagation(); setExpandedImage(fixImageUrl(pallet.photo_url)); }} />
                  {pallet.photo_url_2 && <img src={fixImageUrl(pallet.photo_url_2)} style={{ width: '50%', height: '100%', objectFit: 'cover', borderLeft: '2px solid white', cursor: 'zoom-in' }} onClick={(e) => { e.stopPropagation(); setExpandedImage(fixImageUrl(pallet.photo_url_2)); }} />}
                </div>
                <h4 style={{ margin: '0 0 5px 0' }}>{pallet.commodity_type} {pallet.variety && `- ${pallet.variety}`}</h4>
                
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b' }}>
                  {pallet.pack_style} • {pallet.weight} {pallet.size && <span style={{ color: '#0f172a', fontWeight: 'bold' }}>• Size: {pallet.size}</span>} <span style={{ background: '#e0f2fe', padding: '2px 4px', borderRadius: '4px', fontWeight: '600', marginLeft: '5px', color: '#0284c7' }}>{pallet.grade}</span>
                </p>

                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#0f172a' }}>📍 {pallet.location}</p>

                {editingPalletId === pallet.id ? (
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input type="number" value={editBoxes} onChange={e => setEditBoxes(e.target.value)} className="modern-input" style={{ padding: '6px' }} title="Update Pallets Available" />
                    <input type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="modern-input" style={{ padding: '6px' }} title="Update Price" />
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '14px', marginBottom: '10px' }}>
                    <span>{pallet.pallets_available} pallets ({pallet.boxes_per_pallet} box)</span>
                    <span style={{ fontWeight: 'bold', color: '#0f172a' }}>${pallet.asking_price}/ea</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  {editingPalletId === pallet.id ? (
                    <>
                      <button onClick={() => handleSaveEdit(pallet.id)} className="btn-primary" style={{ padding: '8px', fontSize: '13px', background: '#0ea5e9', flex: 1 }}>Save</button>
                      <button onClick={() => setEditingPalletId(null)} className="btn-secondary" style={{ padding: '8px', fontSize: '13px', flex: 1, border: '1px solid #cbd5e1' }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingPalletId(pallet.id); setEditBoxes(pallet.pallets_available); setEditPrice(pallet.asking_price); }} className="btn-secondary" style={{ padding: '8px', fontSize: '13px', flex: 1, border: '1px solid #cbd5e1', background: 'white', color: '#0ea5e9' }}>✏️ Edit</button>
                      <button onClick={() => handleDeletePallet(pallet.id)} className="btn-secondary" style={{ padding: '8px', fontSize: '13px', flex: 1, color: '#991b1b', border: '1px solid #fee2e2', background: '#fef2f2' }}>🗑 Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {myListings.length === 0 && (<div style={{ color: '#64748b' }}>No active fruit in the cooler right now.</div>)}
          </div>
          
        </div>
        </ContentWrapper>
      </PageWrapper>
    ); 
  }

  // --- 5. DEFAULT PUBLIC VIEW (THE COOLER) ---
  return (
    <PageWrapper>
      {renderLightbox()}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#020617' }}>
        <Navbar title="Command Center" role={role} view={view} setView={setView} handleLogout={handleLogout} token={token} />
        
        <div className="dashboard-container">
          <div className="map-section">
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '200%', height: '200%', background: 'conic-gradient(from 0deg, transparent 70%, rgba(56, 189, 248, 0.3) 100%)', transform: 'translate(-50%, -50%)', borderRadius: '50%', animation: 'spin 4s linear infinite', pointerEvents: 'none', zIndex: 1000 }} />
            <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(15,23,42,0.85)', padding: '15px', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc', zIndex: 2000, boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>
              <h3 style={{ margin: 0, fontSize: '14px', color: '#38bdf8', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 10px #4ade80' }}></span>LIVE SATELLITE GRID</h3>
              <p style={{ margin: '5px 0 10px 0', fontSize: '12px', color: '#94a3b8' }}>Select a pin to view isolated inventory.</p>
              <button onClick={locateUser} className="btn-primary" style={{ background: '#0ea5e9', fontSize: '11px', padding: '6px 10px', width: '100%', marginBottom: selectedMapLocation ? '10px' : '0' }}>📡 Scan My Location</button>
              {selectedMapLocation && (<button onClick={() => setSelectedMapLocation(null)} style={{ background: 'transparent', border: '1px dashed #ef4444', color: '#ef4444', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', width: '100%', display: 'block' }}>✕ Clear Filter</button>)}
            </div>
            
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%', background: '#020617', zIndex: 1 }} zoomControl={false}>
              <MapController center={mapCenter} zoom={mapZoom} />
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="&copy; Esri" />
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}" />
              {userLocation && (<Marker position={userLocation} icon={userIcon}><Popup><div style={{ fontWeight: 'bold', color: '#0f172a' }}>📍 You Are Here</div></Popup></Marker>)}
              {uniqueLocations.map((loc, i) => {
                const isSelected = selectedMapLocation === loc.name;
                if (!loc.lat || !loc.lon) return null;
                return (
                  <Marker key={i} position={[loc.lat, loc.lon]} icon={createHudIcon(isSelected)} eventHandlers={{ click: () => { setSelectedMapLocation(loc.name); setMapCenter([loc.lat, loc.lon]); setMapZoom(14); } }}>
                    <Popup><div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '5px' }}>{loc.name}</div><div style={{ color: '#0ea5e9', fontSize: '12px' }}>{loc.count} Pallet(s) Available</div></Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          <div className="inventory-section">
            <div style={{ padding: '20px', borderBottom: '1px solid #1e293b', background: '#0f172a' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '18px' }}>{selectedMapLocation ? `Inventory at Location` : 'All Available Inventory'}</h3>
              <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>{displayedPallets.length} Pallets Found</p>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {displayedPallets.map(pallet => (
                <div 
                  key={pallet.id} 
                  className="card" 
                  onClick={() => { if (pallet.lat && pallet.lon) { setMapCenter([pallet.lat, pallet.lon]); setMapZoom(16); setSelectedMapLocation(pallet.location); } }}
                  style={{ height: 'auto', minHeight: 'fit-content', display: 'flex', flexDirection: 'column', background: '#0f172a', border: '1px solid #334155', overflow: 'hidden', color: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#38bdf8'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}
                >
                  <div style={{ display: 'flex', height: '140px', width: '100%', background: '#020617', flexShrink: 0 }}>
                    <img src={fixImageUrl(pallet.photo_url)} style={{ width: pallet.photo_url_2 ? '50%' : '100%', height: '100%', objectFit: 'cover', opacity: 0.9, cursor: 'zoom-in' }} onClick={(e) => { e.stopPropagation(); setExpandedImage(fixImageUrl(pallet.photo_url)); }} title="Click to zoom" />
                    {pallet.photo_url_2 && <img src={fixImageUrl(pallet.photo_url_2)} style={{ width: '50%', height: '100%', objectFit: 'cover', borderLeft: '2px solid #0f172a', opacity: 0.9, cursor: 'zoom-in' }} onClick={(e) => { e.stopPropagation(); setExpandedImage(fixImageUrl(pallet.photo_url_2)); }} title="Click to zoom" />}
                  </div>
                  <div style={{ padding: '20px', flex: 1 }}>
                    <h2 style={{ margin: '0 0 5px 0', color: '#f8fafc', fontSize: '18px' }}>
                      {pallet.commodity_type} {pallet.variety && `- ${pallet.variety}`}
                      {pallet.grade && <span style={{ fontSize: '10px', background: '#1e293b', border: '1px solid #334155', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '8px', fontWeight: '600', color: '#cbd5e1' }}>{pallet.grade}</span>}
                    </h2>
                    <div style={{ color: '#0ea5e9', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                      🏢 HT Verified Grower <span style={{ background: '#dcfce3', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '900', letterSpacing: '0.5px' }}>✓ CERT: {pallet.cert_type ? pallet.cert_type.toUpperCase() : 'DOCS'}</span>
                    </div>
                    
                    <p style={{ margin: '0 0 15px 0', color: '#e2e8f0', fontSize: '15px', fontWeight: 'bold' }}>
                      {pallet.pallets_available} Pallet(s) Available <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 'normal' }}>({pallet.boxes_per_pallet} boxes/pallet)</span>
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '15px', color: '#cbd5e1', fontSize: '13px', lineHeight: '1.4' }}>
                      <span style={{ color: '#ef4444' }}>📍</span>
                      <span style={{ fontWeight: '500' }}>{pallet.location}</span>
                    </div>

                    <div style={{ background: '#1e293b', borderRadius: '6px', padding: '10px', marginBottom: '15px', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold' }}>TERMS:</span><span style={{ color: '#4ade80', fontSize: '11px', fontWeight: 'bold' }}>{pallet.payment_terms}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold' }}>TEMP:</span><span style={{ color: '#e2e8f0', fontSize: '11px' }}>{pallet.storage_temp || 'N/A'}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold' }}>HOURS:</span><span style={{ color: pallet.loading_window === 'By Appointment Only' ? '#f59e0b' : '#e2e8f0', fontSize: '11px', fontWeight: pallet.loading_window === 'By Appointment Only' ? 'bold' : 'normal' }}>{pallet.loading_window}</span></div>
                    </div>
                    {pallet.loading_window === 'By Appointment Only' && (
                      <div style={{ marginBottom: '15px', background: '#020617', padding: '10px', borderRadius: '6px', border: '1px dashed #f59e0b' }} onClick={e => e.stopPropagation()}>
                        <label style={{ display: 'block', fontSize: '11px', color: '#f59e0b', fontWeight: 'bold', marginBottom: '5px' }}>📅 APPOINTMENT REQUIRED:</label>
                        <input type="datetime-local" className="modern-input" style={{ padding: '6px', fontSize: '12px', width: '100%', background: '#0f172a', color: 'white', borderColor: '#334155' }} value={apptTimes[pallet.id] || ''} onChange={e => setApptTimes({...apptTimes, [pallet.id]: e.target.value})} />
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <span style={{ fontSize: '24px', fontWeight: '700', color: '#38bdf8' }}>${pallet.asking_price}</span> <span style={{ fontSize: '12px', color: '#94a3b8' }}>/ box</span>
                      </div>
                      {token ? (
                        role === 'buyer' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={e => e.stopPropagation()}>
                            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}>QTY:</label>
                              <input type="number" min="1" max={pallet.pallets_available} value={buyQty[pallet.id] || 1} onChange={e => setBuyQty({...buyQty, [pallet.id]: e.target.value})} className="modern-input" style={{ width: '40px', padding: '2px 4px', fontSize: '14px', background: '#0f172a', color: 'white', border: 'none', textAlign: 'center' }} />
                            </div>
                            <button onClick={() => handleBuy(pallet.id)} className="btn-primary" style={{ background: '#38bdf8', color: '#0f172a', width: 'auto', padding: '8px 15px', fontWeight: 'bold', fontSize: '13px' }}>Buy Now</button>
                          </div>
                        )
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setView('login'); }} className="btn-primary" style={{ background: '#0f172a', color: '#38bdf8', border: '1px solid #38bdf8', width: 'auto', padding: '8px 20px', fontWeight: 'bold', fontSize: '13px' }}>Sign in to Buy</button>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid #334155', paddingTop: '10px' }}>
                      {token ? (
                        role === 'buyer' && (
                          offeringPalletId === pallet.id ? (
                            <div style={{ display: 'flex', gap: '5px' }} onClick={e => e.stopPropagation()}>
                              <input type="number" step="0.01" value={makeOfferAmount} onChange={e => setMakeOfferAmount(e.target.value)} className="modern-input" style={{ background: '#020617', color: 'white', borderColor: '#334155', padding: '6px' }} placeholder="$" />
                              <button onClick={() => handleMakeOffer(pallet.id, pallet.grower_id)} className="btn-primary" style={{ width: 'auto', padding: '6px 10px', background: '#38bdf8', color: '#0f172a', fontSize: '12px' }}>Send</button>
                              <button onClick={() => setOfferingPalletId(null)} className="btn-secondary" style={{ color: '#94a3b8', fontSize: '12px', padding: '6px' }}>X</button>
                            </div>
                          ) : (
                            <button onClick={(e) => { e.stopPropagation(); setOfferingPalletId(pallet.id); }} style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px dashed #38bdf8', color: '#38bdf8', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>🤝 Make an Offer</button>
                          )
                        )
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setView('login'); }} style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px dashed #64748b', color: '#94a3b8', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>🔒 Sign in to Make an Offer</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {displayedPallets.length === 0 && (<div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px' }}>No inventory available here.</div>)}
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}

export default App;