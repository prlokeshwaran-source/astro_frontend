import { useEffect, useRef, useState } from 'react';
import { consultationApi } from '../api/consultationApi';
import { chatApi } from '../api/chatApi';
import ChatAttachment from '../components/chat/ChatAttachment';
import { PageHeading, PageState } from '../components/common/PageState';
import { useLanguage } from '../contexts/LanguageContext';

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

function encodeAttachment(file) {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error('Attachments must be 8 MiB or smaller.');
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read this attachment.'));
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const comma = dataUrl.indexOf(',');
      if (comma < 0) {
        reject(new Error('Could not encode this attachment.'));
        return;
      }
      resolve({
        filename: file.name || 'voice-message.webm',
        mime_type: (file.type || 'application/octet-stream').split(';')[0],
        size_bytes: file.size,
        data_base64: dataUrl.slice(comma + 1),
      });
    };
    reader.readAsDataURL(file);
  });
}

function mergeMessages(current, incoming) {
  const byId = new Map();
  [...current, ...incoming].forEach((message) => {
    const id = message.id || message._id;
    if (id) byId.set(id, message);
  });
  return [...byId.values()].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
}

export default function ChatPage({ token, user, role }) {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const fileInput = useRef(null);
  const recorder = useRef(null);
  const mediaStream = useRef(null);

  useEffect(() => {
    consultationApi.list(1, 100, token)
      .then((data) => setSessions(data.items || []))
      .catch((err) => setError(err.message));
  }, [token]);

  useEffect(() => {
    if (!sessionId) return undefined;
    let socket;
    let active = true;
    chatApi.messages(sessionId, token)
      .then((rows) => { if (active) setMessages((current) => mergeMessages(current, rows || [])); })
      .catch((err) => setError(err.message));
    try {
      socket = chatApi.connect(sessionId, token);
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages((current) => mergeMessages(current, [data]));
        } catch { /* Ignore malformed socket events. */ }
      };
      socket.onerror = () => setError('Live chat connection failed. You can still send messages.');
    } catch (err) {
      setError(err.message);
    }
    return () => {
      active = false;
      socket?.close();
    };
  }, [sessionId, token]);

  useEffect(() => () => {
    recorder.current?.stop();
    mediaStream.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const chooseFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    try {
      setAttachment(await encodeAttachment(file));
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleVoiceRecording = async () => {
    setError('');
    if (recorder.current?.state === 'recording') {
      recorder.current.stop();
      setRecording(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('Voice recording is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      const chunks = [];
      const mediaRecorder = new MediaRecorder(stream);
      recorder.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      mediaRecorder.onerror = () => setError('Voice recording failed.');
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        mediaStream.current = null;
        recorder.current = null;
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
        if (!blob.size) return;
        const extension = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm';
        try {
          setAttachment(await encodeAttachment(new File([blob], `voice-message.${extension}`, { type: blob.type })));
        } catch (err) {
          setError(err.message);
        }
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      setError(err.message || 'Could not access the microphone.');
    }
  };

  const send = async (event) => {
    event.preventDefault();
    if (!sessionId || (!content.trim() && !attachment)) return;
    setSending(true);
    setError('');
    try {
      const sent = await chatApi.send(sessionId, {
        content: content.trim(),
        ...(attachment ? { attachment } : {}),
      }, token);
      setMessages((current) => mergeMessages(current, [sent]));
      setContent('');
      setAttachment(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const currentRole = role || user?.role || 'USER';
  const conversationDescription = currentRole === 'ASTROLOGER'
    ? t('Chat with your consultation clients. Select a client session to reply.')
    : currentRole === 'USER'
      ? t('Chat privately with the astrologer assigned to your consultation.')
      : t('Review consultation conversations as an administrator.');

  return <>
    <PageHeading eyebrow={currentRole === 'ASTROLOGER' ? t('ASTROLOGER MESSAGES') : t('YOUR CONVERSATIONS')} title={t('Messages')} description={conversationDescription} />
    <div className="content-card">
      <label className="select-session">{t('Consultation')}
        <select value={sessionId} onChange={(event) => { setSessionId(event.target.value); setMessages([]); }}>
          <option value="">{t('Choose a consultation')}</option>
          {sessions?.map((session) => <option value={session.id} key={session.id}>
            {session.counterpart_name || session.astrologer_id} · {session.consultation_type} · {session.status}
          </option>)}
        </select>
      </label>
      {sessionId && <>
        <div className="chat-participant-heading">
          <span className="avatar">{(sessions?.find((session) => session.id === sessionId)?.counterpart_name || 'A')[0].toUpperCase()}</span>
          <span><b>{sessions?.find((session) => session.id === sessionId)?.counterpart_name || t('Consultation participant')}</b>
            <small>{currentRole === 'ASTROLOGER' ? t('Client') : currentRole === 'USER' ? t('Astrologer') : t('Conversation')}</small></span>
        </div>
        <div className="message-list">
          {messages.map((message, index) => {
            const isOwn = message.sender_id === user?.id || message.sender_id === user?._id;
            return <article className={`message-bubble ${isOwn ? 'message-own' : 'message-peer'}`} key={message.id || message._id || index}>
            <small className="message-sender">{isOwn ? t('You') : message.sender_name || (message.sender_role === 'ASTROLOGER' ? t('Astrologer') : t('Client'))}</small>
            {message.content && <p>{message.content}</p>}
            {message.attachment && <ChatAttachment consultationId={sessionId} message={message} token={token} />}
            <small>{message.created_at ? new Date(message.created_at).toLocaleString() : ''}</small>
          </article>;
          })}
        </div>
        <form className="message-form chat-composer" onSubmit={send}>
          <div className="chat-composer-tools">
            <button type="button" className="chat-tool-button" onClick={() => fileInput.current?.click()}>Attach file</button>
            <input
              ref={fileInput}
              className="chat-file-input"
              type="file"
              accept="image/*,video/*,audio/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
              onChange={chooseFile}
            />
            <button type="button" className={recording ? 'chat-tool-button recording' : 'chat-tool-button'} onClick={toggleVoiceRecording}>
              {recording ? 'Stop voice' : 'Record voice'}
            </button>
            {attachment && <span className="pending-attachment">{attachment.filename}<button type="button" aria-label="Remove attachment" onClick={() => setAttachment(null)}>×</button></span>}
          </div>
          <div className="chat-composer-send">
            <input value={content} onChange={(event) => setContent(event.target.value)} placeholder={t('Write a message…')} />
            <button className="primary-button" disabled={sending || (!content.trim() && !attachment)}>{sending ? t('Sending…') : t('Send')}<span>↗</span></button>
          </div>
          <small className="field-help">Images, video, audio and files up to 8 MiB. Voice recordings are sent as base64 audio attachments.</small>
        </form>
      </>}
      {error && <p className="page-error" role="alert">{t(error)}</p>}
    </div>
  </>;
}
