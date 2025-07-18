import React, { useState } from "react";

// CONFIGURATION (EDIT THESE!)
// ---------------------------
// Your YouTube livestream video ID:
const YOUTUBE_VIDEO_ID = "5qap5aO4i9A"; // Demo: Lo-fi livestream
// Your donation links:
const PAYPAL_LINK = "https://paypal.me/YOURPAYPAL";
const KOFI_LINK = "https://ko-fi.com/YOURKOFI";
const CREDIT_LINK = "https://yourcustomdonate.com";

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
function QueuePanel({ queue, currentSpeaker, onPromote, onRemove }) {
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
            margin: "0.5rem 0"
          }}>
            <span>{user.name}</span>
            <div>
              <button onClick={() => onPromote(user)} style={{ marginRight: 5 }}>Promote</button>
              <button onClick={() => onRemove(user)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      {currentSpeaker && (
        <div style={{ marginTop: 10 }}>
          <strong>Current Speaker:</strong> {currentSpeaker.name}
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
  const [queue, setQueue] = useState([
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
    { id: "3", name: "Charlie" }
  ]);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [userName, setUserName] = useState("Streamer");
  const [isInQueue, setIsInQueue] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState(5.00);
  const [feeInfo, setFeeInfo] = useState("");

  // Fee calculation (edit platform fee as you like!)
  function calculateFees(amount) {
    const stripeFee = amount * 0.029 + 0.30;
    const platformFee = amount * 0.05;
    const net = amount - stripeFee - platformFee;
    return `Of your $${amount.toFixed(2)} donation, $${stripeFee.toFixed(2)} goes to Stripe, $${platformFee.toFixed(2)} to platform, and the streamer receives $${net.toFixed(2)}.`;
  }

  // Update fee breakdown
  React.useEffect(() => {
    setFeeInfo(calculateFees(donationAmount));
  }, [donationAmount]);

  const addNotification = (msg, type = "info") => {
    setNotifications(n => [...n, { id: Date.now() + Math.random(), message: msg, type }]);
  };
  const clearNotification = id => setNotifications(n => n.filter(i => i.id !== id));

  const joinQueue = () => {
    if (!userName.trim()) {
      addNotification("Enter your name to join!", "error");
      return;
    }
    if (queue.find(u => u.name === userName)) {
      addNotification("Already in queue!", "error");
      return;
    }
    setQueue(q => [...q, { id: Date.now().toString(), name: userName }]);
    setIsInQueue(true);
    addNotification(`${userName} joined the queue.`, "success`);
  };

  const leaveQueue = () => {
    setQueue(q => q.filter(u => u.name !== userName));
    setIsInQueue(false);
    addNotification(`${userName} left the queue.`, "info");
    if (currentSpeaker && currentSpeaker.name === userName) setCurrentSpeaker(null);
  };

  const promoteToSpeaker = user => {
    setCurrentSpeaker(user);
    setQueue(q => q.filter(u => u.id !== user.id));
    addNotification(`${user.name} is now speaking.`, "success`);
  };

  const removeFromQueue = user => {
    setQueue(q => q.filter(u => u.id !== user.id));
    addNotification(`${user.name} removed from queue.`, "info");
  };

  const endSpeaker = () => setCurrentSpeaker(null);

  return (
    <div style={{
      fontFamily: "sans-serif",
      background: "#181818",
      minHeight: "100vh",
      padding: "2rem"
    }}>
      <h1 style={{ color: "#fafafa" }}>Streamer Dashboard</h1>
      <button
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
              }}>Join Queue</button>
            ) : (
              <button onClick={leaveQueue} style={{
                padding: "8px 20px",
                borderRadius: 4
              }}>Leave Queue</button>
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
