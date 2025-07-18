import React, { useState, useEffect } from "react";
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, orderBy, where } from 'firebase/firestore';

// CONFIGURATION (EDIT THESE!)
// ---------------------------
// Your YouTube livestream video ID:
const YOUTUBE_VIDEO_ID = "5qap5aO4i9A"; // Demo: Lo-fi livestream
// Your donation links:
const PAYPAL_LINK = "https://paypal.me/YOURPAYPAL";
const KOFI_LINK = "https://ko-fi.com/YOURKOFI";
const CREDIT_LINK = "https://yourcustomdonate.com";

// Global Firebase variables (provided by the environment)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase (outside of component to avoid re-initialization)
let app;
let db;
let auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Handle Firebase initialization error gracefully, e.g., show a message to the user
}

// Shows the live video
function YouTubeLivestreamEmbed({ videoId }) {
  return (
    <iframe
      width="700"
      height="400"
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
      frameBorder="0"
      allow="autoplay; encrypted-media"
      allowFullScreen
      title="YouTube Livestream"
      style={{ borderRadius: 8, marginBottom: 8 }}
    />
  );
}

// Shows the live chat (official YouTube embed)
function YouTubeLiveChatEmbed({ videoId }) {
  const embedDomain = window.location.hostname;
  return (
    <iframe
      src={`https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${embedDomain}`}
      width="350"
      height="400"
      frameBorder="0"
      title="YouTube Live Chat"
      style={{ borderRadius: 8, marginBottom: 8 }}
    />
  );
}

// Audio queue UI
function QueuePanel({ queue, currentSpeaker, onPromote, onRemove, currentUserId }) {
  return (
    <div style={{
      background: "#222",
      color: "#fff",
      padding: "1rem",
      borderRadius: 8,
      marginBottom: "1rem"
    }}> 
      <h2>Audio Queue</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {queue.map(user => (
          <li key={user.id} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "0.5rem 0",
            fontWeight: user.id === currentUserId ? 'bold' : 'normal' // Highlight current user
          }}>
            <span>{user.name} {user.id === currentUserId && "(You)"}</span>
            <div>
              <button onClick={() => onPromote(user)} style={{ marginRight: 5 }}>Promote</button>
              <button onClick={() => onRemove(user)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      {currentSpeaker && (
        <div style={{ marginTop: 10 }}>
          <strong>Current Speaker:</strong> {currentSpeaker.name} {currentSpeaker.id === currentUserId && "(You)"}
        </div>
      )}
    </div>
  );
}

// Notification display
function NotificationContainer({ notifications, onRemove }) {
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 99 }}>
      {notifications.map(n => (
        <div
          key={n.id}
          style={{
            background: n.type === "success" ? "#4caf50" : n.type === "error" ? "#f44336" : "#2196f3",
            color: "#fff",
            padding: "10px 16px",
            marginBottom: 8,
            borderRadius: 6,
            minWidth: 200,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <span>{n.message}</span>
          <button style={{
            marginLeft: 12,
            background: "#fff",
            color: "#000",
            border: "none",
            borderRadius: 3
          }} onClick={() => onRemove(n.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

// Custom Donation Modal (no 3rd-party branding!)
function DonationModal({ open, onClose, feeInfo, donationAmount, setDonationAmount }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1c1c1c",
          color: "#fff",
          padding: 32,
          borderRadius: 16,
          minWidth: 320,
          position: "relative",
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)"
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 8, right: 12,
            background: "transparent", border: "none",
            color: "#fff", fontSize: 24, cursor: "pointer"
          }}
        >
          ×
        </button>
        <h2 style={{ marginBottom: 16, color: "#4caf50" }}>Support Our Stream!</h2>
        <p>
          Your donations help us keep improving and creating awesome content.<br />
          Choose your favorite payment method below:
        </p>
        <div style={{ marginTop: 20 }}>
          <a href={PAYPAL_LINK} target="_blank" rel="noopener noreferrer"
            style={{ color: "#4caf50", fontWeight: "bold", display: "block", marginBottom: 12 }}>
            💸 PayPal
          </a>
          <a href={KOFI_LINK} target="_blank" rel="noopener noreferrer"
            style={{ color: "#29abe0", fontWeight: "bold", display: "block", marginBottom: 12 }}>
            ☕ Ko-fi
          </a>
          <a href={CREDIT_LINK} target="_blank" rel="noopener noreferrer"
            style={{ color: "#ff424d", fontWeight: "bold", display: "block", marginBottom: 12 }}>
            💳 Credit Card
          </a>
        </div>
        <div style={{
          background: "#232323",
          borderRadius: 8,
          padding: 16,
          marginTop: 16,
          color: "#ddd"
        }}> 
          <h3>Try a Donation Amount</h3>
          <input
            type="number"
            min="1"
            max="1000"
            step="0.01"
            value={donationAmount}
            onChange={e => setDonationAmount(Number(e.target.value))}
            style={{ padding: 8, borderRadius: 4, width: "60px", marginRight: 8 }}
          /> USD
        </div>
        <div style={{ color: "#aaa", fontSize: 13, marginTop: 18 }}>
          {feeInfo ? (
            <div>
              <strong>Fee Breakdown:</strong><br />
              {feeInfo}
            </div>
          ) : null}
          <br />
          Your support means the world to us. Thank you!
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [queue, setQueue] = useState([]); // Initialize as empty, will load from Firestore
  const [currentSpeaker, setCurrentSpeaker] = useState(null); // Will load from Firestore
  const [notifications, setNotifications] = useState([]);
  const [userName, setUserName] = useState(""); // User will input their name
  const [isInQueue, setIsInQueue] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState(5.00);
  const [feeInfo, setFeeInfo] = useState("");
  const [userId, setUserId] = useState(null); // Firebase User ID
  const [isAuthReady, setIsAuthReady] = useState(false); // Track Firebase auth state

  // Fee calculation (edit platform fee as you like!)
  function calculateFees(amount) {
    const stripeFee = amount * 0.029 + 0.30;
    const platformFee = amount * 0.05;
    const net = amount - stripeFee - platformFee;
    return `Of your $${amount.toFixed(2)} donation, $${stripeFee.toFixed(2)} goes to Stripe, $${platformFee.toFixed(2)} to platform, and the streamer receives $${net.toFixed(2)}.`;
  }

  // Update fee breakdown
  useEffect(() => {
    setFeeInfo(calculateFees(donationAmount));
  }, [donationAmount]);

  const addNotification = (msg, type = "info") => {
    setNotifications(n => [...n, { id: Date.now() + Math.random(), message: msg, type }]);
  };
  const clearNotification = id => setNotifications(n => n.filter(i => i.id !== id));

  // --- Firebase Initialization and Authentication ---
  useEffect(() => {
    if (!auth) {
      addNotification("Firebase Auth not initialized. Check console for errors.", "error");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
        // Try to load user's last known name from Firestore if available
        const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data');
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserName(userDocSnap.data().name || `User-${user.uid.substring(0, 4)}`);
        } else {
          setUserName(`User-${user.uid.substring(0, 4)}`); // Default name
          // Create initial user profile
          await setDoc(userDocRef, { name: `User-${user.uid.substring(0, 4)}` });
        }
      } else {
        // Sign in anonymously if no user is authenticated
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            await signInAnonymously(auth);
          }
        } catch (error) {
          console.error("Error signing in:", error);
          addNotification(`Authentication failed: ${error.message}`, "error");
        }
      }
    });

    return () => unsubscribe(); // Clean up auth listener
  }, [auth]); // Depend on 'auth' instance

  // --- Firestore Real-time Queue Listener ---
  useEffect(() => {
    if (!db || !isAuthReady || !userId) {
      // Wait for Firestore and Auth to be ready
      return;
    }

    const queueCollectionRef = collection(db, `artifacts/${appId}/public/data/queue`);
    const currentSpeakerDocRef = doc(db, `artifacts/${appId}/public/data/currentSpeaker`, 'speaker');

    // Listen for queue changes
    const unsubscribeQueue = onSnapshot(query(queueCollectionRef), (snapshot) => {
      const updatedQueue = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by timestamp to maintain join order
      updatedQueue.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      setQueue(updatedQueue);
      setIsInQueue(updatedQueue.some(u => u.id === userId));
    }, (error) => {
      console.error("Error fetching queue:", error);
      addNotification(`Failed to load queue: ${error.message}`, "error");
    });

    // Listen for current speaker changes
    const unsubscribeSpeaker = onSnapshot(currentSpeakerDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setCurrentSpeaker(docSnap.data());
      } else {
        setCurrentSpeaker(null);
      }
    }, (error) => {
      console.error("Error fetching current speaker:", error);
      addNotification(`Failed to load current speaker: ${error.message}`, "error");
    });

    return () => {
      unsubscribeQueue();
      unsubscribeSpeaker();
    }; // Clean up listeners
  }, [db, isAuthReady, userId]); // Depend on db, auth readiness, and userId

  // --- Firestore Operations ---

  const updateUserNameInFirestore = async (newName) => {
    if (!db || !userId) return;
    try {
      const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, 'data');
      await setDoc(userDocRef, { name: newName }, { merge: true });
      addNotification("Name updated!", "success");
    } catch (error) {
      console.error("Error updating user name:", error);
      addNotification(`Failed to update name: ${error.message}`, "error");
    }
  };

  const joinQueue = async () => {
    if (!userId || !userName.trim()) {
      addNotification("Enter your name and ensure authentication is ready to join!", "error");
      return;
    }
    if (queue.some(u => u.id === userId)) {
      addNotification("You are already in the queue!", "info");
      return;
    }
    try {
      const queueCollectionRef = collection(db, `artifacts/${appId}/public/data/queue`);
      await setDoc(doc(queueCollectionRef, userId), {
        name: userName,
        timestamp: Date.now(),
        userId: userId // Store userId explicitly in the document data
      });
      addNotification(`${userName} joined the queue.`, "success");
    } catch (error) {
      console.error("Error joining queue:", error);
      addNotification(`Failed to join queue: ${error.message}`, "error");
    }
  };

  const leaveQueue = async () => {
    if (!userId) return;
    try {
      const queueDocRef = doc(db, `artifacts/${appId}/public/data/queue`, userId);
      await deleteDoc(queueDocRef);
      addNotification(`${userName} left the queue.`, "info");
      if (currentSpeaker && currentSpeaker.id === userId) {
        await setDoc(doc(db, `artifacts/${appId}/public/data/currentSpeaker`, 'speaker'), {}); // Clear speaker
      }
    } catch (error) {
      console.error("Error leaving queue:", error);
      addNotification(`Failed to leave queue: ${error.message}`, "error");
    }
  };

  const promoteToSpeaker = async (user) => {
    if (!db || !user) return;
    try {
      // Set current speaker
      await setDoc(doc(db, `artifacts/${appId}/public/data/currentSpeaker`, 'speaker'), {
        id: user.id,
        name: user.name,
        timestamp: Date.now()
      });
      // Remove from queue
      const queueDocRef = doc(db, `artifacts/${appId}/public/data/queue`, user.id);
      await deleteDoc(queueDocRef);
      addNotification(`${user.name} is now speaking.`, "success");
    } catch (error) {
      console.error("Error promoting to speaker:", error);
      addNotification(`Failed to promote ${user.name}: ${error.message}`, "error");
    }
  };

  const removeFromQueue = async (user) => {
    if (!db || !user) return;
    try {
      const queueDocRef = doc(db, `artifacts/${appId}/public/data/queue`, user.id);
      await deleteDoc(queueDocRef);
      addNotification(`${user.name} removed from queue.`, "info");
      if (currentSpeaker && currentSpeaker.id === user.id) {
        await setDoc(doc(db, `artifacts/${appId}/public/data/currentSpeaker`, 'speaker'), {}); // Clear speaker
      }
    } catch (error) {
      console.error("Error removing from queue:", error);
      addNotification(`Failed to remove ${user.name}: ${error.message}`, "error");
    }
  };

  const endSpeaker = async () => {
    if (!db) return;
    try {
      await setDoc(doc(db, `artifacts/${appId}/public/data/currentSpeaker`, 'speaker'), {}); // Clear speaker
      addNotification("Current speaker ended.", "info");
    } catch (error) {
      console.error("Error ending speaker:", error);
      addNotification(`Failed to end speaker: ${error.message}`, "error");
    }
  };

  return (
    <div style={{
      fontFamily: "sans-serif",
      background: "#181818",
      minHeight: "100vh",
      padding: "2rem"
    }}> 
      <h1 style={{ color: "#fafafa" }}>Streamer Dashboard</h1>
      {userId && <p style={{ color: "#aaa" }}>Your User ID: {userId}</p>}
      {!isAuthReady && <p style={{ color: "#ffeb3b" }}>Connecting to Firebase...</p>}
      
      <button // This is the button that was problematic, now back in with clean code
        onClick={() => setDonationOpen(true)}
        style={{
          background: "#4caf50",
          color: "#fff",
          padding: "10px 20px",
          border: "none",
          borderRadius: 6,
          fontWeight: "bold",
          fontSize: "16px",
          marginBottom: "24px",
          cursor: "pointer"
        }}
      >
        Donate to the Stream
      </button>
      <DonationModal
        open={donationOpen}
        onClose={() => setDonationOpen(false)}
        feeInfo={feeInfo}
        donationAmount={donationAmount}
        setDonationAmount={setDonationAmount}
      />
      <div style={{
        display: "flex",
        gap: "2rem",
        marginBottom: "2rem",
        flexWrap: "wrap"
      }}>
        <div>
          <YouTubeLivestreamEmbed videoId={YOUTUBE_VIDEO_ID} />
          <YouTubeLiveChatEmbed videoId={YOUTUBE_VIDEO_ID} />
        </div>
        <div>
          <QueuePanel
            queue={queue}
            currentSpeaker={currentSpeaker}
            onPromote={promoteToSpeaker}
            onRemove={removeFromQueue}
            currentUserId={userId} // Pass current user ID to highlight in queue
          />
          <button onClick={endSpeaker} style={{ marginBottom: 12 }}>End Speaker</button>
          <NotificationContainer notifications={notifications} onRemove={clearNotification} />
          <div style={{
            background: "#232323",
            borderRadius: 8,
            padding: 24,
            marginTop: 16
          }}> 
            <h2 style={{ color: "#fff" }}>Change Your Name</h2>
            <input
              type="text"
              placeholder="Your name"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              style={{
                padding: 8,
                borderRadius: 4,
                width: "70%",
                marginBottom: 12
              }}
            />
            <br />
            {!isInQueue ? (
              <button onClick={joinQueue} style={{
                padding: "8px 20px",
                borderRadius: 4
              }} disabled={!isAuthReady}>Join Queue</button>
            ) : (
              <button onClick={leaveQueue} style={{
                padding: "8px 20px",
                borderRadius: 4
              }} disabled={!isAuthReady}>Leave Queue</button>
            )}
          </div>
          <div style={{
            background: "#232323",
            borderRadius: 8,
            padding: 16,
            marginTop: 16,
            color: "#ddd"
          }}> 
            <h3>Try a Donation Amount</h3>
            <input
              type="number"
              min="1"
              max="1000"
              step="0.01"
              value={donationAmount}
              onChange={e => setDonationAmount(Number(e.target.value))}
              style={{ padding: 8, borderRadius: 4, width: "60px", marginRight: 8 }}
            /> USD
          </div>
        </div>
      </div>
      <div style={{
        color: "#bbb",
        marginTop: "2rem",
        fontSize: "14px"
      }}> 
        <strong>Note:</strong> This is a <em>demo</em>. No backend or real audio yet.<br />
        Try joining/leaving the queue and promoting users!
      </div>
    </div>
  );
}
// END_OF_APP_JS_FILE_MARKER_20250718
