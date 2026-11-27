import { useEffect, useState } from 'react';
import { chatApi } from '../../api/chatApi';

export default function ChatAttachment({ consultationId, message, token }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const attachment = message.attachment;

  useEffect(() => {
    let active = true;
    let objectUrl = '';
    chatApi.attachment(consultationId, message.id, token)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch((err) => { if (active) setError(err.message); });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [consultationId, message.id, token]);

  if (error) return <small className="chat-attachment-error">{error}</small>;
  if (!url) return <small className="chat-attachment-loading">Loading {attachment.filename}…</small>;

  if (attachment.mime_type?.startsWith('image/')) {
    return <a className="chat-attachment" href={url} download={attachment.filename}>
      <img src={url} alt={attachment.filename} /><small>{attachment.filename}</small>
    </a>;
  }
  if (attachment.mime_type?.startsWith('video/')) {
    return <div className="chat-attachment"><video controls preload="metadata" src={url} /><small>{attachment.filename}</small></div>;
  }
  if (attachment.mime_type?.startsWith('audio/')) {
    return <div className="chat-attachment chat-audio-attachment"><audio controls preload="metadata" src={url} /><small>{attachment.filename}</small></div>;
  }
  return <a className="chat-file-attachment" href={url} download={attachment.filename}>⇩ {attachment.filename}</a>;
}
