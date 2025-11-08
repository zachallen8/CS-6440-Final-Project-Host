import { useState, useEffect } from 'react'
import {Send, Search, Paperclip, MoreVertical, Phone, Video} from 'lucide-react'
import '../css/Messaging.css'
import { supabase } from '../SupabaseClient'

function Messaging() {

  const [selectConversation, setSelectConversation] = useState(null);
  const [msgText, setMsgTxt] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchConversation();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (selectConversation) {
      fetchMessages(selectConversation);
    }
  }, [selectConversation]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
    else {
      setCurrentUserId('c666c5ee-fc9d-45a2-b8ee-893cfe982a6d');
    }
  };

  const fetchConversation = async () => {
    try {
      setLoading(true);

      console.log('Current User ID: ', currentUserId);

      const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        last_message, 
        last_message_at, 
        updated_at, 
        patient_id, 
        provider_id,
        patient:users!conversations_patient_id_fkey (
          id, full_name, avatar_initials
        ),
        provider:users!conversations_provider_id_fkey (
          id, full_name, avatar_initials, specialty
        )
      `)
      .or(`patient_id.eq.${currentUserId},provider_id.eq.${currentUserId}`)
      .order('updated_at', {ascending: false});

      console.log('Fetched data: ', data);
      console.log('Error: ', error);
      
      if (error) throw error;

      const transformed = (data ?? []).map((conv) => {
        const userIsPatient = conv.patient_id === currentUserId;
        const otherUser = userIsPatient ? conv.provider : conv.patient;

        return {
          id: conv.id,
          name: otherUser?.full_name ?? 'Unknown',
          title: userIsPatient ? (conv.provider?.specialty || 'Provider') : 'Patient',
          lastMessage: conv.last_message || 'No messages yet',
          timestamp: formatTimestamp(conv.last_message_at || conv.updated_at),
          unread: 0,
          online: false,
          avatar: otherUser?.avatar_initials ?? '?',
        };
      });

      setConversations(transformed);
    } catch (error) {
      console.error('Error fetching conversations: ', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const { data, error } = await supabase
      .from('messages')
      .select('id, text, created_at, sender_id, sender_type')
      .eq('conversation_id', conversationId)
      .order('created_at', {ascending: true});
      
      if (error) throw error;

      const transformMessages = data.map(msg => ({
        id: msg.id,
        sender: msg.sender_type,
        text: msg.text,
        timestamp: new Date(msg.created_at).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        }),
        date: formatDate(msg.created_at)
      }));

      setMessages(prev => ({
        ...prev,
        [conversationId]: transformMessages
      }));
    } catch (error) {
      console.error('Error fetching messages: ', error);
    }
  };

  const sendMessage = async () => {
    if (!msgText.trim() || !selectConversation) return;

    try {
      const { data: convData } = await supabase.from('conversations').select('patient_id, provider_id').eq('id', selectConversation).single();

      const senderType = convData.patient_id === currentUserId ? 'patient' : 'provider';

      const { data: newMessage, error: messageError } = await supabase.from('messages').insert([
        {
          conversation_id: selectConversation,
          sender_id: currentUserId,
          sender_type: senderType,
          text: msgText,
          read: false
        }
      ]).select().single();

      if(messageError) throw messageError;

      const { error: updateError } = await supabase.from('conversations').update({
        last_message: msgText,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq('id', selectConversation);

      if (updateError) throw updateError;

      const newMsg = {
        id: newMessage.id,
        sender: senderType,
        text: msgText,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        }),
        date: 'Today'
      };

      setMessages(prev => ({
        ...prev,
        [selectConversation]: [...(prev[selectConversation] || []), newMsg]
      }));

      setMsgTxt('');

      fetchConversation();
    } catch (error) {
      console.error('Error sending message: ', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now-date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit'});
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', {month: 'long', day: 'numeric'});
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filterConversations = conversations.filter((conv) => {
    const q = searchQuery.toLowerCase();
    return (conv.name || '').toLowerCase().includes(q) ||
           (conv.title || '').toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className='messaging-container'>
        <div>
          <p>Loading Conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='messaging-container'>
      <div className='conversations-sidebar'>
        <div className='sidebar-header'>
          <h2>Messages</h2>
        </div>

        <div className='search-bar'>
          <Search size={16}/>
          <input
            type='text'
            placeholder='Search conversations ...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className='conversations-list'>
          {filterConversations.length === 0 ? (
            <div>
              No conversations yet
            </div>
          ):(
            filterConversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${selectConversation === conv.id ? 'active': ''}`}
              onClick={() => setSelectConversation(conv.id)}
            >
              <div className='avatar-container'>
                <div className='avatar'>{conv.avatar}</div>
              </div>
              <div className='conversation-info'>
                <div className='conversation-header'>
                  <h3>{conv.name}</h3>
                  <span className='timestamp'>{conv.timestamp}</span>
                </div>
                <div className='conversation-preview'>
                  <p className='title'>{conv.title}</p>
                  <p className='last-message'>{conv.lastMessage}</p>
                </div>
              </div>
              {conv.unread > 0 && (
                <div className='unread'>{conv.unread}</div>
              )}
            </div>
          ))
        )}
        </div>
      </div>

      <div className='chat-area'>
        {selectConversation ? (
          <>
          <div className='chat-header'>
            <div className='chat-header-info'>
              <div className='avatar'>
                {conversations.find(c => c.id == selectConversation)?.avatar}
              </div>
              <div>
                <h3>{conversations.find(c => c.id === selectConversation)?.name}</h3>
              </div>
            </div>

            <div className='chat-actions'>
              <button className='icon-btn' title='Voice Call'>
                <Phone size={20} />
              </button>
              <button className='icon-btn' title='Video Call'>
                <Video size={20}/>
              </button>
              <button className='icon-btn' title='More Options'>
                <MoreVertical size={20}/>
              </button>
            </div>
          </div>

          <div className='messages-area'>
            {messages[selectConversation]?.map((msg, index) => {
              const showDate = index === 0 || messages[selectConversation][index-1].date != msg.date;

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className='date-divider'>
                      <span>
                        {msg.date}
                      </span>
                    </div>
                  )}
                  <div className={`message ${msg.sender}`}>
                    <div className='message-content'>
                      <p>{msg.text}</p>
                      <span className='message-time'>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className='message-input-container'>
            <button className='icon-btn' title='Attach File'>
              <Paperclip size={20} />
            </button>
            <textarea 
              placeholder='Type your message...' 
              value={msgText}
              onChange={(e) => setMsgTxt(e.target.value)}
              onKeyPress={handleKeyPress}
              rows="1"
            />
            <button
              className='send-btn'
              onClick={sendMessage}
              disabled={!msgText.trim()}
              title='Send Message'
            >
              <Send size={20}/>
            </button>
          </div>
        </>
      ): (
        <div className='no-conversation-selected'>
          <div className='empty-state'>
            <h3>Select a Conversation</h3>
            <p>Choose a provider from the list to start messaging</p>
          </div>
        </div>
      )}
    </div>
  </div>
);
}

export default Messaging
