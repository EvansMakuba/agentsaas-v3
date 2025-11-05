import { MessageCircle } from "lucide-react";
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io("http://localhost:5000"); // Matches backend port

export default function Messages() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", message);
      setMessage("");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Messages</h2>

      {/* Your existing UI */}
      <div className="bg-white rounded-xl shadow-sm p-6 border text-center text-gray-500">
        <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>No new messages.</p>
      </div>

      {/* Real-Time Chat */}
      <div style={{ textAlign: "center", marginTop: '50px' }}>
        <h2>Real-Time Chat</h2>
        <div
          style={{
            height: '200px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
            margin: '10px 0',
            background: '#f9f9f9',
          }}
        >
          {chat.map((msg, index) => (
            <p key={index} style={{ margin: '5px 0' }}>
              <strong>User:</strong> {msg}
            </p>
          ))}
        </div>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{ width: '70%', padding: '8px' }}
        />
        <button onClick={sendMessage} style={{ padding: '8px 16px' }}>
          Send
        </button>
      </div>
    </div>
  );
}