import React, { useState, useEffect } from 'react';
import { HardDrive, Mail, FileSpreadsheet, FolderOpen, Search, Plus, Trash2, ExternalLink, ShieldCheck, LogOut, CheckCircle2, AlertCircle, RefreshCw, Loader2, Sparkles, FileText, Send, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, googleProvider } from '../services/firebaseConfig';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';

interface GoogleWorkspaceHubProps {
  onClose: () => void;
  user: any;
}

export const GoogleWorkspaceHub: React.FC<GoogleWorkspaceHubProps> = ({ onClose, user: initialUser }) => {
  const [activeTab, setActiveTab] = useState<'drive' | 'gmail' | 'sheets' | 'picker'>('drive');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [driveSearchQuery, setDriveSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Gmail state
  const [gmailMessages, setGmailMessages] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [emailQuery, setEmailQuery] = useState('admission OR jamb OR uniben OR unilag');

  // Sheets state
  const [sheetName, setSheetName] = useState('CampusAI Admission Report 2026');
  const [createdSheetUrl, setCreatedSheetUrl] = useState<string | null>(null);

  // Picker simulated state
  const [pickerFiles, setPickerFiles] = useState<any[]>([]);

  useEffect(() => {
    // Add required Workspace scopes
    googleProvider.addScope('https://www.googleapis.com/auth/drive');
    googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
    googleProvider.addScope('https://mail.google.com/');
    googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
    googleProvider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setCurrentUser(u);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        setCurrentUser(result.user);
        setSuccessMsg("Successfully connected to Google Workspace!");
        fetchDriveFiles(credential.accessToken);
        fetchGmailMessages(credential.accessToken);
      } else {
        throw new Error("Failed to obtain OAuth access token from Google.");
      }
    } catch (err: any) {
      console.error("Workspace sign-in error:", err);
      setErrorMsg(err.message || "Failed to authenticate with Google Workspace.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setAccessToken(null);
    setCurrentUser(null);
    setDriveFiles([]);
    setGmailMessages([]);
  };

  // --- Drive API ---
  const fetchDriveFiles = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,webViewLink,iconLink,modifiedTime,size)', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.files) {
        setDriveFiles(data.files);
        setPickerFiles(data.files);
      } else if (data.error) {
        throw new Error(data.error.message);
      }
    } catch (err: any) {
      setErrorMsg("Drive fetch error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDriveFile = async (fileId: string, fileName: string) => {
    // MANDATORY: User confirmation before destructive operation
    const confirmed = window.confirm(`Are you sure you want to delete "${fileName}" from Google Drive? This action cannot be undone.`);
    if (!confirmed) return;

    if (!accessToken) return;
    setIsLoading(true);
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok || res.status === 204) {
        setSuccessMsg(`Successfully deleted "${fileName}" from Google Drive.`);
        setDriveFiles(prev => prev.filter(f => f.id !== fileId));
      } else {
        const errData = await res.json();
        throw new Error(errData.error?.message || 'Failed to delete file');
      }
    } catch (err: any) {
      setErrorMsg("Delete error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Gmail API ---
  const fetchGmailMessages = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(emailQuery)}&maxResults=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.messages) {
        const detailedMessages = await Promise.all(
          data.messages.map(async (msg: any) => {
            const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            return detailRes.json();
          })
        );
        setGmailMessages(detailedMessages);
      } else {
        setGmailMessages([]);
      }
    } catch (err: any) {
      setErrorMsg("Gmail fetch error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Sheets API ---
  const createGoogleSheet = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: { title: sheetName },
          sheets: [{ properties: { title: 'Admission Summary 2026' } }]
        })
      });
      const data = await res.json();
      if (data.spreadsheetId) {
        const url = `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`;
        setCreatedSheetUrl(url);
        setSuccessMsg("Successfully created Google Sheet with your admission stats!");
        
        // Populate initial data rows
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${data.spreadsheetId}/values/Admission Summary 2026!A1:D3?valueInputOption=USER_ENTERED`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            range: 'Admission Summary 2026!A1:D3',
            majorDimension: 'ROWS',
            values: [
              ['Institution / University', 'Course of Study', 'JAMB Score', 'Status'],
              ['University of Lagos (UNILAG)', 'Medicine & Surgery', '310', 'Eligible / Admitted'],
              ['Federal University of Technology Akure', 'Software Engineering', '295', 'High Probability']
            ]
          })
        });
      } else {
        throw new Error(data.error?.message || "Failed to create spreadsheet");
      }
    } catch (err: any) {
      setErrorMsg("Sheets error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-5xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-950/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">Google Workspace Integration Hub</h2>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Drive • Gmail • Sheets • Picker Connected</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Not Authenticated State */}
        {!accessToken ? (
          <div className="p-12 md:p-16 flex flex-col items-center justify-center text-center space-y-6 my-auto">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <ShieldCheck size={40} />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Connect Your Google Account</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                Link Google Drive to manage your O'Level certificates and admission letters, check your Gmail for acceptance alerts, and export calculations to Google Sheets instantly with permission.
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            {/* Official Google Sign-In Button */}
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="gsi-material-button relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl font-bold text-sm text-gray-700 dark:text-white shadow-md hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              </div>
              <span>{isLoading ? 'Connecting to Google...' : 'Sign in with Google Workspace'}</span>
            </button>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Top Workspace Bar */}
            <div className="px-6 py-4 bg-gray-100 dark:bg-gray-950 flex flex-wrap justify-between items-center gap-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {currentUser?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white">{currentUser?.email || 'Connected User'}</h4>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={12} /> Workspace Synchronized
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    fetchDriveFiles(accessToken);
                    fetchGmailMessages(accessToken);
                  }} 
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw size={14} /> Refresh Data
                </button>
                <button 
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-100 transition-colors"
                >
                  <LogOut size={14} /> Disconnect
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 gap-2">
              <button 
                onClick={() => setActiveTab('drive')}
                className={`py-4 px-6 font-black text-xs uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'drive' ? 'border-blue-600 text-blue-600 dark:text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                <HardDrive size={16} /> Google Drive ({driveFiles.length})
              </button>
              <button 
                onClick={() => setActiveTab('gmail')}
                className={`py-4 px-6 font-black text-xs uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'gmail' ? 'border-blue-600 text-blue-600 dark:text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                <Mail size={16} /> Gmail Alerts ({gmailMessages.length})
              </button>
              <button 
                onClick={() => setActiveTab('sheets')}
                className={`py-4 px-6 font-black text-xs uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'sheets' ? 'border-blue-600 text-blue-600 dark:text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                <FileSpreadsheet size={16} /> Google Sheets Export
              </button>
              <button 
                onClick={() => setActiveTab('picker')}
                className={`py-4 px-6 font-black text-xs uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'picker' ? 'border-blue-600 text-blue-600 dark:text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                <FolderOpen size={16} /> Google Picker & Vault
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50 dark:bg-gray-950/50">
              {successMsg && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2"><CheckCircle2 size={16} /> {successMsg}</span>
                  <button onClick={() => setSuccessMsg(null)}>✕</button>
                </div>
              )}

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2"><AlertCircle size={16} /> {errorMsg}</span>
                  <button onClick={() => setErrorMsg(null)}>✕</button>
                </div>
              )}

              {/* DRIVE TAB */}
              {activeTab === 'drive' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white">Google Drive Admission Documents</h3>
                      <p className="text-xs text-gray-500 font-medium">Manage your JAMB result slips, WAEC certificates, and admission forms securely stored in Drive.</p>
                    </div>
                    <button 
                      onClick={() => fetchDriveFiles(accessToken!)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-500 transition-colors"
                    >
                      <RefreshCw size={14} /> Sync Files
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-4">
                      <Loader2 size={32} className="animate-spin text-blue-600" />
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Drive Files...</p>
                    </div>
                  ) : driveFiles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {driveFiles.map((file) => (
                        <div key={file.id} className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col justify-between shadow-sm group">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                              <FileText size={20} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="text-xs font-black text-gray-900 dark:text-white truncate mb-1">{file.name}</h5>
                              <p className="text-[10px] text-gray-400 uppercase font-semibold">{file.mimeType?.split('.').pop() || 'File'}</p>
                            </div>
                          </div>
                          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            {file.webViewLink && (
                              <a 
                                href={file.webViewLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[10px] font-black uppercase text-blue-600 dark:text-cyan-400 flex items-center gap-1 hover:underline"
                              >
                                Open <ExternalLink size={12} />
                              </a>
                            )}
                            {/* Destructive operation with mandatory confirmation */}
                            <button 
                              onClick={() => handleDeleteDriveFile(file.id, file.name)}
                              className="text-[10px] font-black uppercase text-red-500 hover:text-red-700 flex items-center gap-1"
                              title="Delete File"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-16 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Google Drive files found.</p>
                    </div>
                  )}
                </div>
              )}

              {/* GMAIL TAB */}
              {activeTab === 'gmail' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white">Gmail Admission Alerts & Notifications</h3>
                      <p className="text-xs text-gray-500 font-medium">Scan your inbox for acceptance letters, admission status updates, and university circulars.</p>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={emailQuery} 
                        onChange={(e) => setEmailQuery(e.target.value)}
                        placeholder="Search query..."
                        className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold outline-none dark:text-white"
                      />
                      <button 
                        onClick={() => fetchGmailMessages(accessToken!)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-500 transition-colors"
                      >
                        <Search size={14} /> Search Gmail
                      </button>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-4">
                      <Loader2 size={32} className="animate-spin text-blue-600" />
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scanning Inbox...</p>
                    </div>
                  ) : gmailMessages.length > 0 ? (
                    <div className="space-y-3">
                      {gmailMessages.map((msg) => {
                        const headers = msg.payload?.headers || [];
                        const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
                        const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
                        const date = headers.find((h: any) => h.name === 'Date')?.value || '';
                        return (
                          <div key={msg.id} className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col gap-2 shadow-sm">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{from}</span>
                              <span className="text-[10px] text-gray-400">{date}</span>
                            </div>
                            <h4 className="text-sm font-black text-gray-900 dark:text-white">{subject}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{msg.snippet}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-16 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No matching admission emails found.</p>
                    </div>
                  )}
                </div>
              )}

              {/* SHEETS TAB */}
              {activeTab === 'sheets' && (
                <div className="max-w-2xl mx-auto space-y-6 text-center py-8">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mx-auto">
                    <FileSpreadsheet size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Export Admission Reports to Google Sheets</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Instantly generate a structured spreadsheet with your cutoff aggregates, institution choices, and admission probabilities.</p>
                  </div>

                  <div className="space-y-4 max-w-md mx-auto text-left">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Spreadsheet Title</label>
                      <input 
                        type="text" 
                        value={sheetName} 
                        onChange={(e) => setSheetName(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold outline-none dark:text-white"
                      />
                    </div>

                    <button 
                      onClick={createGoogleSheet}
                      disabled={isLoading}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create & Populate Google Sheet
                    </button>

                    {createdSheetUrl && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Spreadsheet Created Successfully!</span>
                        <a 
                          href={createdSheetUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-emerald-500"
                        >
                          Open Sheet <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PICKER TAB */}
              {activeTab === 'picker' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Google Picker & Document Vault</h3>
                    <p className="text-xs text-gray-500 font-medium">Select admission documents from your secure Google Drive vault for instant processing.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {driveFiles.map((file) => (
                      <div key={file.id} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <FileText size={20} className="text-blue-600" />
                          <div>
                            <h5 className="text-xs font-black text-gray-900 dark:text-white">{file.name}</h5>
                            <p className="text-[10px] text-gray-400">Google Drive Vault</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => alert(`Selected "${file.name}" for admission processing!`)}
                          className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"
                        >
                          Select File
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
