
import React, { useEffect, useState } from 'react';
import { useAgentStore } from '../../stores/agentStore';
import { useAuthStore } from '../../stores/authStore';
import { type Agent, type QuickReply, type WelcomeMessage, type BlacklistedUser } from '../../types';
import Button from '../ui/Button';
import { ICONS } from '../../constants';

const AgentSettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { settings, fetchAgentData, updateSettings, isLoading } = useAgentStore();
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (user && user.role.name === 'agent' && !settings) {
      fetchAgentData(user.id);
    }
  }, [user, settings, fetchAgentData]);

  if (isLoading || !settings || !user) {
    return <div className="p-6">Loading settings...</div>;
  }
  
  const handleSettingsChange = (data: Partial<typeof settings>) => {
    updateSettings(user.id, data);
  };
  
  const agentUser = user as Agent;
  const shareLink = `${window.location.origin}${window.location.pathname}#/chat/${agentUser.shareId}`;

  const renderTabContent = () => {
    switch(activeTab) {
        case 'general':
            return <GeneralSettings settings={settings} onUpdate={handleSettingsChange} shareLink={shareLink}/>
        case 'profile':
            return <ProfileSettings agent={agentUser} />
        case 'quickReplies':
            return <QuickRepliesSettings settings={settings} onUpdate={handleSettingsChange} />
        case 'welcomeMessages':
            return <WelcomeMessagesSettings settings={settings} onUpdate={handleSettingsChange} />
        case 'blacklist':
            return <BlacklistSettings settings={settings} onUpdate={handleSettingsChange} />
        default:
            return null;
    }
  }

  return (
    <div className="p-6 md:p-10 bg-slate-100 flex-1 overflow-y-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Agent Settings</h1>
      <p className="text-slate-500 mb-8">Manage your chat behavior, shortcuts, and personal preferences.</p>
      
      <div className="flex border-b border-slate-300 mb-6">
        <TabButton name="General" id="general" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton name="Profile" id="profile" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton name="Quick Replies" id="quickReplies" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton name="Welcome Messages" id="welcomeMessages" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton name="Blacklist" id="blacklist" activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px]">
          {renderTabContent()}
      </div>
    </div>
  );
};

const TabButton: React.FC<{name: string, id: string, activeTab: string, setActiveTab: (id: string) => void}> = ({name, id, activeTab, setActiveTab}) => (
    <button onClick={() => setActiveTab(id)} className={`px-4 py-2 text-sm font-medium ${activeTab === id ? 'border-b-2 border-sky-500 text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}>
        {name}
    </button>
)

const GeneralSettings: React.FC<{settings: any, onUpdate: (data: any) => void, shareLink: string}> = ({settings, onUpdate, shareLink}) => {
    const [copied, setCopied] = useState(false);
    
    const copyLink = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    
    return (
        <div>
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Your Chat Link</h2>
            <p className="text-sm text-slate-600 mb-2">Share this link with visitors to start a chat session directly with you.</p>
             <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-md">
                <input type="text" readOnly value={shareLink} className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"/>
                <Button onClick={copyLink} size="sm" variant="secondary" leftIcon={ICONS.copy}>
                    {copied ? 'Copied!' : 'Copy'}
                </Button>
            </div>
             <p className="text-sm text-slate-600 my-4">Or share this QR code for mobile users:</p>
            <div className="bg-white p-4 inline-block rounded-lg shadow">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareLink)}`} alt="Chat QR Code" />
            </div>
        </div>
    )
}

const ProfileSettings: React.FC<{agent: Agent}> = ({ agent }) => {
    const { updateAgentDetails } = useAgentStore();
    const { updateCurrentUser } = useAuthStore();
    const [name, setName] = useState(agent.name);
    const [avatar, setAvatar] = useState(agent.avatarUrl);
    const [isSaving, setIsSaving] = useState(false);

    const handleAvatarChange = () => {
        const seed = Math.random().toString(36).substring(7);
        const newAvatarUrl = `https://picsum.photos/seed/${seed}/100`;
        setAvatar(newAvatarUrl);
    }
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedAgent = await updateAgentDetails(agent.id, { name, avatarUrl: avatar });
            updateCurrentUser({ name: updatedAgent.name, avatarUrl: updatedAgent.avatarUrl });
            alert('Profile updated successfully!');
        } catch (e) {
            alert('Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div>
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Edit Profile</h2>
            <div className="space-y-6">
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">Display Name</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full max-w-sm rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Avatar</label>
                    <div className="mt-1 flex items-center gap-4">
                        <img src={avatar} alt="Avatar" className="h-20 w-20 rounded-full" />
                        <Button type="button" variant="secondary" onClick={handleAvatarChange}>Generate New Avatar</Button>
                    </div>
                </div>
            </div>
             <div className="mt-8 flex justify-end">
                <Button variant="primary" onClick={handleSave} isLoading={isSaving}>Save Changes</Button>
            </div>
        </div>
    )
}


const QuickRepliesSettings: React.FC<{settings: any, onUpdate: (data: any) => void}> = ({settings, onUpdate}) => {
    const [replies, setReplies] = useState<QuickReply[]>(settings.quickReplies);
    
    const handleAddReply = () => {
        setReplies([...replies, {id: `new-${Date.now()}`, shortcut: '', message: ''}]);
    }
    
    const handleUpdateReply = (id: string, field: 'shortcut' | 'message', value: string) => {
        setReplies(replies.map(r => r.id === id ? {...r, [field]: value} : r));
    }
    
    const handleRemoveReply = (id: string) => {
        setReplies(replies.filter(r => r.id !== id));
    }

    const handleSaveChanges = () => {
        onUpdate({ quickReplies: replies });
        alert('Changes saved!');
    }
    
    return (
        <div>
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Manage Quick Replies</h2>
            <div className="space-y-4">
                {replies.map((reply) => (
                    <div key={reply.id} className="flex items-center gap-4">
                         <input type="text" placeholder="/shortcut" value={reply.shortcut} onChange={(e) => handleUpdateReply(reply.id, 'shortcut', e.target.value)} className="w-40 rounded-md border-slate-300 text-sm"/>
                         <input type="text" placeholder="Full message..." value={reply.message} onChange={(e) => handleUpdateReply(reply.id, 'message', e.target.value)} className="flex-1 rounded-md border-slate-300 text-sm"/>
                         <Button variant="ghost" size="sm" onClick={() => handleRemoveReply(reply.id)} className="text-red-500 hover:bg-red-100">{ICONS.delete}</Button>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-between">
                <Button variant="secondary" onClick={handleAddReply} leftIcon={ICONS.add}>Add Reply</Button>
                <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
            </div>
        </div>
    )
}

const WelcomeMessagesSettings: React.FC<{settings: any, onUpdate: (data: any) => void}> = ({settings, onUpdate}) => {
    const [messages, setMessages] = useState<WelcomeMessage[]>(settings.welcomeMessages);
    
    const handleAdd = () => {
        setMessages([...messages, {id: `new-${Date.now()}`, message: '', delaySeconds: 2}]);
    }
    
    const handleUpdate = (id: string, field: 'message' | 'delaySeconds', value: string | number) => {
        setMessages(messages.map(m => m.id === id ? {...m, [field]: value} : m));
    }
    
    const handleRemove = (id: string) => {
        setMessages(messages.filter(m => m.id !== id));
    }

    const handleSaveChanges = () => {
        onUpdate({ welcomeMessages: messages });
        alert('Changes saved!');
    }
    
    return (
        <div>
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Manage Welcome Messages</h2>
            <p className="text-sm text-slate-500 mb-4">These messages are sent automatically to new visitors after a short delay.</p>
            <div className="space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className="flex items-center gap-4">
                         <input type="text" placeholder="Welcome message..." value={msg.message} onChange={(e) => handleUpdate(msg.id, 'message', e.target.value)} className="flex-1 rounded-md border-slate-300 text-sm"/>
                         <input type="number" min="0" value={msg.delaySeconds} onChange={(e) => handleUpdate(msg.id, 'delaySeconds', parseInt(e.target.value) || 0)} className="w-24 rounded-md border-slate-300 text-sm" />
                         <span className="text-sm text-slate-500">seconds</span>
                         <Button variant="ghost" size="sm" onClick={() => handleRemove(msg.id)} className="text-red-500 hover:bg-red-100">{ICONS.delete}</Button>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-between">
                <Button variant="secondary" onClick={handleAdd} leftIcon={ICONS.add}>Add Message</Button>
                <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
            </div>
        </div>
    )
}

const BlacklistSettings: React.FC<{settings: any, onUpdate: (data: any) => void}> = ({settings, onUpdate}) => {
    const [blacklist, setBlacklist] = useState<BlacklistedUser[]>(settings.blacklist);
    const [newIp, setNewIp] = useState('');
    const [newReason, setNewReason] = useState('');

    const handleAdd = () => {
        if (!newIp.trim()) return;
        const newEntry: BlacklistedUser = {
            id: `bl-${Date.now()}`,
            ipAddress: newIp,
            reason: newReason,
            timestamp: new Date().toISOString()
        };
        setBlacklist([...blacklist, newEntry]);
        setNewIp('');
        setNewReason('');
    };

    const handleRemove = (id: string) => {
        setBlacklist(blacklist.filter(u => u.id !== id));
    }
    
    const handleSaveChanges = () => {
        onUpdate({ blacklist });
        alert('Changes saved!');
    }

    return (
        <div>
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Manage Blacklist</h2>
            <p className="text-sm text-slate-500 mb-4">Visitors from these IP addresses will be blocked from starting new chats.</p>
            
            <div className="flex items-end gap-2 mb-6 p-4 bg-slate-50 rounded-lg">
                <div className="flex-1">
                    <label htmlFor="ip-address" className="block text-xs font-medium text-slate-600">IP Address</label>
                    <input id="ip-address" type="text" placeholder="e.g., 123.45.67.89" value={newIp} onChange={e => setNewIp(e.target.value)} className="w-full mt-1 rounded-md border-slate-300 text-sm"/>
                </div>
                <div className="flex-1">
                    <label htmlFor="reason" className="block text-xs font-medium text-slate-600">Reason (Optional)</label>
                    <input id="reason" type="text" placeholder="e.g., Spam" value={newReason} onChange={e => setNewReason(e.target.value)} className="w-full mt-1 rounded-md border-slate-300 text-sm"/>
                </div>
                <Button variant="secondary" onClick={handleAdd} leftIcon={ICONS.add}>Add</Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {blacklist.length > 0 ? blacklist.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-100 rounded-md">
                        <div>
                            <p className="font-mono text-slate-800">{user.ipAddress}</p>
                            <p className="text-sm text-slate-500">{user.reason}</p>
                        </div>
                         <div className="text-right">
                             <p className="text-xs text-slate-400">Blocked on {new Date(user.timestamp).toLocaleDateString()}</p>
                            <Button variant="ghost" size="sm" onClick={() => handleRemove(user.id)} className="text-red-500 hover:bg-red-100 mt-1">Remove</Button>
                        </div>
                    </div>
                )) : <p className="text-slate-500 text-center py-4">Your blacklist is empty.</p>}
            </div>
            
            <div className="mt-6 flex justify-end">
                <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
            </div>
        </div>
    )
}


export default AgentSettingsPage;
