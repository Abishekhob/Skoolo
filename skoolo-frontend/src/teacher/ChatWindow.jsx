import React, { useEffect, useState, useRef } from 'react';
import { createStompClient } from '../wsClient';
import API from '../services/api';
import { Form, Button, Card, InputGroup, Tooltip, OverlayTrigger } from 'react-bootstrap';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
// Corrected import: Bs icons for most, Fa for EnvelopeOpenText
import { BsEmojiSmile, BsPaperclip, BsFillSendFill, BsFileEarmark } from 'react-icons/bs';
import { FaEnvelopeOpenText } from 'react-icons/fa'; // Import from 'react-icons/fa'

import './style/ChatWindow.css'; // Import our custom CSS

const ChatWindow = ({ conversationId, userId, otherUser }) => {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [file, setFile] = useState(null);
  const clientRef = useRef(null);
  const messagesEndRef = useRef(null); // Renamed for clarity
  const inputRef = useRef(null); // Ref for the textarea to manage focus
  const [lightboxOpen, setLightboxOpen] = useState(false);
const [lightboxImageUrl, setLightboxImageUrl] = useState(null);


  // Fetch initial messages and set up WebSocket
  useEffect(() => {
    if (!conversationId) {
      setMessages([]); // Clear messages if conversationId is null (e.g., no chat selected)
      if (clientRef.current) {
        clientRef.current.deactivate(); // Deactivate old client if conversation changes
        clientRef.current = null;
      }
      return;
    }

    // Fetch historical messages
    API.get(`/messages/conversation/${conversationId}`)
      .then(res => setMessages(res.data))
      .catch(console.error);

    // Set up STOMP client for real-time messages
    const client = createStompClient((msg) => {
      // This is the fallback message handler (e.g., for general topics)
      const body = JSON.parse(msg.body);
      if (body.conversation.id === conversationId) {
        // If a message comes on a general topic but is for this conversation, add it.
        // This might be redundant if specific topic subscription is working well.
        setMessages(prev => [...prev, body]);
      }
    });

    client.activate();
    clientRef.current = client;

    client.onConnect = () => {
      // Subscribe to conversation-specific topic
      client.subscribe(`/topic/messages/${conversationId}`, (msg) => {
        const body = JSON.parse(msg.body);
        // Normalize message structure (consider doing this on backend or more robustly)
        const normalized = {
          ...body,
          sender: body.sender || {
            id: body.senderId ?? (body.sender?.id ?? null),
            firstName: body.senderFirstName ?? '',
            lastName: body.senderLastName ?? '',
          },
          receiver: body.receiver || {
            id: body.receiverId ?? (body.receiver?.id ?? null),
            firstName: body.receiverFirstName ?? '',
            lastName: body.receiverLastName ?? '',
          },
        };
        setMessages(prev => [...prev, normalized]);
      }, (error) => {
        console.error('STOMP subscription error:', error);
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    // Clean up on component unmount or conversationId change
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [conversationId, userId]); // Re-run effect if conversationId or userId changes

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle emoji selection
  const addEmoji = (emoji) => {
    setInput(prevInput => prevInput + emoji.native);
    setShowEmojiPicker(false);
    inputRef.current?.focus(); // Keep focus on input after selecting emoji
  };

  // Handle sending message
  const sendMessage = async () => {
    if (!input.trim() && !file) return;

    // Determine receiverId for the new message
let receiverId = null;
if (messages.length > 0) {
  const lastMessage = messages[messages.length - 1];
  // The receiver is the user who is NOT the current sender
  receiverId = lastMessage.sender.id === userId
    ? lastMessage.receiver.id
    : lastMessage.sender.id;
} else if (otherUser?.id) {
  // If no messages, use the passed otherUser prop
  receiverId = otherUser.id;
}

if (!receiverId) {
  console.error("Cannot determine receiverId to send message.");
  return; // stop sending if no receiver found
}


    const message = {
      conversationId,
      senderId: userId,
      receiverId: receiverId, // Pass the determined receiverId
      content: input.trim(),
      type: file ? 'FILE' : 'TEXT',
    };

    const formData = new FormData();
    formData.append('conversationId', message.conversationId);
    formData.append('senderId', message.senderId);
    if (message.receiverId) { // Only append if valid
      formData.append('receiverId', message.receiverId);
    }
    formData.append('content', message.content || '');
    formData.append('type', message.type);
    if (file) {
      formData.append('file', file);
    }

    console.log("Sending message with:");
console.log("conversationId:", conversationId);
console.log("senderId:", userId);
console.log("receiverId:", receiverId);

    try {
      // Send message via API (WS will push it to all subscribers)
      await API.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setInput('');
      setFile(null);
      setShowEmojiPicker(false);
      // No need to manually add to messages state; WS subscription will handle it
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally show an error message to the user
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Clear input text if a file is selected and no text was typed
      if (!input.trim()) {
        setInput(`Attachment: ${selectedFile.name}`);
      }
    } else {
      setFile(null);
      // Clear placeholder text if file is deselected and it was just the attachment name
      if (input.startsWith("Attachment: ")) {
        setInput("");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Send on Enter, new line on Shift+Enter
      e.preventDefault();
      sendMessage();
    }
  };

  if (!conversationId) {
    return (
      <div className="chat-window-placeholder d-flex flex-column justify-content-center align-items-center text-muted">
        <BsFillSendFill size={100} className="mb-4 text-light" />
        <h4 className="text-white-50">No chat selected</h4>
        <p className="text-white-50">Select a conversation from the left to start chatting.</p>
      </div>
    );
  }

  return (
      <div className="d-flex flex-column h-100">
    <Card className="chat-window-card">
      <Card.Body className="messages-container-body custom-scroll">
        {messages.length === 0 ? (
          <div className="empty-chat-message">
            <FaEnvelopeOpenText size={60} className="mb-3" /> {/* Changed to FaEnvelopeOpenText */}
            <p>Say hello! Your conversation starts here.</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isSender = msg.sender?.id === userId; // Use optional chaining for sender
            const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            const senderName = isSender ? 'You' : (msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Unknown');

            return (
              <div
                key={msg.id || i} // Use msg.id if available, fallback to index
                className={`message-bubble-wrapper ${isSender ? 'sent' : 'received'}`}
              >
               <div className="message-bubble">
  {!isSender && (
    <div className="sender-name">{senderName}</div>
  )}
  <div className="message-content">
 {msg.type === 'FILE' && msg.attachment ? (() => {
  const extension = msg.attachment.split('.').pop().toLowerCase();
const BACKEND_BASE_URL = "http://localhost:8081";
const fileUrl = `${BACKEND_BASE_URL}/uploads/${encodeURIComponent(msg.attachment)}`;
// ✅ Encode the filename

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];

  if (imageExtensions.includes(extension)) {
    return <img
  src={fileUrl}
  alt={msg.attachment}
  className="chat-image"
  style={{ cursor: 'pointer' }}
  onClick={() => {
    setLightboxImageUrl(fileUrl);
    setLightboxOpen(true);
  }}
/>
;
  } else if (videoExtensions.includes(extension)) {
    return (
      <video controls className="chat-video">
        <source src={fileUrl} type={`video/${extension === 'mp4' ? 'mp4' : extension}`} />
        Your browser does not support the video tag.
      </video>
    );
  } else {
    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="file-attachment-link"
      >
        <BsFileEarmark className="me-2 file-icon" />
        {msg.attachment}
      </a>
    );
  }
})() : (
  msg.content
)}


  </div>
  <div className="message-time">{time}</div>
</div>

              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Card.Body>

      <Card.Footer className="chat-input-area">
        {file && (
          <div className="file-preview-pill">
            <span>{file.name}</span>
            <Button variant="link" className="remove-file-btn" onClick={() => { setFile(null); setInput(''); }}>
              &times;
            </Button>
          </div>
        )}
        <InputGroup className="message-input-group">
          <Button
            variant="transparent"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="emoji-button"
            aria-label="Toggle emoji picker"
          >
            <BsEmojiSmile size={20} />
          </Button>
          <Form.Control
            as="textarea"
            rows={1}
            ref={inputRef}
            value={input}
            placeholder="Type a message..."
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="message-textarea"
          />
          <label htmlFor="file-upload" className="file-upload-label">
            <BsPaperclip size={20} />
            <input
              id="file-upload"
              type="file"
              accept="*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
          <Button
            variant="primary"
            onClick={sendMessage}
            disabled={!input.trim() && !file}
            className="send-button"
          >
            <BsFillSendFill size={20} />
          </Button>
        </InputGroup>
      </Card.Footer>

      {showEmojiPicker && (
        <div className="emoji-picker-container">
          <Picker
            data={data}
            onEmojiSelect={addEmoji}
            theme="dark"
            native={true}
            previewPosition="none" // Hides the emoji preview
          />
        </div>
      )}
    </Card>
    {lightboxOpen && (
  <div
    className="lightbox-overlay"
    onClick={() => setLightboxOpen(false)}
    style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1050,
      cursor: 'zoom-out',
    }}
  >
    <img
      src={lightboxImageUrl}
      alt="Full size"
      style={{
        maxWidth: '90%',
        maxHeight: '90%',
        boxShadow: '0 0 15px rgba(255,255,255,0.3)',
        borderRadius: '8px',
      }}
      onClick={e => e.stopPropagation()} // Prevent closing if clicking on image itself
    />
  </div>
)}

      </div>
  );
};

export default ChatWindow;