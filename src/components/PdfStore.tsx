import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Upload, Download, Eye, Trash2, Search, Filter, 
  CheckCircle2, AlertCircle, FilePlus, Sparkles, BookOpen, 
  Share2, ShieldCheck, FolderDown, X, ExternalLink, RefreshCw,
  MessageSquare, MessageCircle, ThumbsUp, Send, UserCheck, Lightbulb,
  HelpCircle, Users, PlusCircle, MessageCirclePlus, LogIn, User as UserIcon, Lock,
  Bell, CheckCheck, Bot
} from 'lucide-react';
import SEO from './SEO';
import { db, auth } from '../services/firebaseConfig';
import { 
  collection, doc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, 
  onSnapshot, query, orderBy, serverTimestamp, arrayUnion, arrayRemove 
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { generateContent } from '../services/aiService';
import { savePdfBlobLocally, getPdfBlobLocally, generateClientStudyPdf } from '../utils/indexedDbVault';
import { uploadPdfToFirebaseStorage, deletePdfFromFirebaseStorage } from '../services/pdfStorageService';

export interface PdfStoreItem {
  id: string;
  title: string;
  category: 'JAMB Syllabus' | 'Past Questions' | 'Post-UTME Guide' | 'User Upload' | 'Result Slip' | 'General Notes';
  fileSize: string;
  uploadDate: string;
  description: string;
  author?: string;
  authorId?: string;
  institution?: string;
  downloadUrl?: string; // base64 or external blob/data link
  storagePath?: string; // Firebase Storage cloud path (e.g. pdfs/id.pdf)
  isUserUploaded?: boolean;
  pageCount?: number;
  createdAt?: any;
}

export interface DiscussionComment {
  id: string;
  author: string;
  authorId?: string;
  text: string;
  timestamp: string;
  isAi?: boolean;
  createdAt?: any;
}

export interface DiscussionPost {
  id: string;
  title: string;
  category: 'General Advice' | 'Subject Combination' | 'PDF Requests & Notes' | 'Post-UTME Prep' | 'CAPS & Clearance';
  author: string;
  authorId?: string;
  timestamp: string;
  content: string;
  upvotes: number;
  likedBy?: string[];
  userUpvoted?: boolean;
  comments: DiscussionComment[];
  targetSchool?: string;
  createdAt?: any;
}

export interface DiscussionNotification {
  id: string;
  recipientUid: string;
  senderName: string;
  discussionId: string;
  discussionTitle: string;
  text: string;
  createdAt: string;
  read: boolean;
}

interface PdfStoreProps {
  user?: any;
  onLoginRequest?: () => void;
}

const INITIAL_DISCUSSIONS: DiscussionPost[] = [];

const LOCAL_STORAGE_PDF_KEY = 'campusai_pdf_store_user_items_v2';
const LOCAL_STORAGE_DISCUSSIONS_KEY = 'campusai_pdf_store_discussions_v2';
const LOCAL_STORAGE_NOTIFS_KEY = 'campusai_user_notifications_v2';

export const PdfStore: React.FC<PdfStoreProps> = ({ user: propUser, onLoginRequest }) => {
  const [activeTab, setActiveTab] = useState<'store' | 'discussions'>('store');
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);

  // PDF Store States
  const [items, setItems] = useState<PdfStoreItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<PdfStoreItem['category']>('User Upload');
  const [uploadInstitution, setUploadInstitution] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // PDF Previewer modal
  const [previewingItem, setPreviewingItem] = useState<PdfStoreItem | null>(null);

  // Discussion Hub States
  const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);
  const [discussionSearch, setDiscussionSearch] = useState('');
  const [selectedDiscussionCategory, setSelectedDiscussionCategory] = useState<string>('All');
  const [isNewDiscussionModalOpen, setIsNewDiscussionModalOpen] = useState(false);
  
  // New Discussion Form
  const [discTitle, setDiscTitle] = useState('');
  const [discCategory, setDiscCategory] = useState<DiscussionPost['category']>('General Advice');
  const [discAuthor, setDiscAuthor] = useState('');
  const [discSchool, setDiscSchool] = useState('');
  const [discContent, setDiscContent] = useState('');
  const [discError, setDiscError] = useState('');

  // Active Discussion Thread View / Comments
  const [expandedDiscId, setExpandedDiscId] = useState<string | null>(null);
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyText, setReplyText] = useState('');

  // Notifications & AI Advisor States
  const [notifications, setNotifications] = useState<DiscussionNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [aiThinkingPostId, setAiThinkingPostId] = useState<string | null>(null);
  const [toastNotif, setToastNotif] = useState<DiscussionNotification | null>(null);

  // Delete Target Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'pdf' | 'discussion' | 'comment';
    id: string;
    discussionId?: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Download & Re-upload states
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [replaceTargetItem, setReplaceTargetItem] = useState<PdfStoreItem | null>(null);
  const [isReplacingFile, setIsReplacingFile] = useState<boolean>(false);
  const [previewTimestamp, setPreviewTimestamp] = useState<number>(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setAuthUser(usr);
    });
    return () => unsubscribe();
  }, []);

  // Compute active logged-in user info
  const activeUser = authUser || propUser;
  const isUserLoggedIn = !!activeUser;
  const loggedInUid = activeUser?.uid || 'guest-user';
  const defaultDisplayName = activeUser?.displayName || (activeUser?.email ? activeUser.email.split('@')[0] : '');

  // Keep author state auto-filled with logged-in user name
  useEffect(() => {
    if (defaultDisplayName) {
      if (!discAuthor) setDiscAuthor(defaultDisplayName);
      if (!replyAuthor) setReplyAuthor(defaultDisplayName);
    }
  }, [defaultDisplayName]);

  // Sync Discussions from Firestore + LocalStorage fallback
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    try {
      const q = collection(db, 'discussions');
      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const loadedPosts: DiscussionPost[] = snapshot.docs
            .map(docSnap => {
              const d = docSnap.data();
              const likedBy: string[] = d.likedBy || [];
              return {
                id: docSnap.id,
                title: d.title || 'Untitled Discussion',
                category: d.category || 'General Advice',
                author: d.author || 'Anonymous Student',
                authorId: d.authorId || '',
                timestamp: d.timestamp || 'Recently',
                content: d.content || '',
                upvotes: d.upvotes || 0,
                likedBy,
                userUpvoted: likedBy.includes(loggedInUid),
                comments: d.comments || [],
                targetSchool: d.targetSchool || '',
                createdAt: d.createdAt
              };
            })
            .filter(p => !p.authorId?.startsWith('system-demo') && p.id !== 'disc-1' && p.id !== 'disc-2' && p.id !== 'disc-3');

          // Memory sort descending by creation timestamp or document ID timestamp
          loadedPosts.sort((a, b) => {
            const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (parseInt(a.id.replace(/\D/g, '')) || 0);
            const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (parseInt(b.id.replace(/\D/g, '')) || 0);
            return timeB - timeA;
          });

          setDiscussions(loadedPosts);
          localStorage.setItem(LOCAL_STORAGE_DISCUSSIONS_KEY, JSON.stringify(loadedPosts));
        } else {
          loadStoredDiscussions();
        }
      }, (err) => {
        console.warn('Firestore discussions snapshot warning, falling back to local storage', err);
        loadStoredDiscussions();
      });
    } catch (e) {
      console.warn('Firestore not reachable, using local storage fallback', e);
      loadStoredDiscussions();
    }

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, [loggedInUid]);

  const loadStoredDiscussions = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_DISCUSSIONS_KEY);
      if (stored) {
        const parsed: DiscussionPost[] = JSON.parse(stored);
        const filtered = parsed.filter(d => !d.authorId?.startsWith('system-demo') && d.id !== 'disc-1' && d.id !== 'disc-2' && d.id !== 'disc-3');
        setDiscussions(filtered);
      } else {
        setDiscussions([]);
      }
    } catch (e) {
      setDiscussions([]);
    }
  };

  // Sync PDFs from Firestore + LocalStorage fallback
  useEffect(() => {
    let unsubscribeFirestorePdf: (() => void) | null = null;

    // Helper function to auto-sync local PDFs to cloud & server vault
    const syncLocalPdfsToCloud = async (localList: PdfStoreItem[], existingFirestoreIds: Set<string>) => {
      for (const item of localList) {
        if (!item.id) continue;
        let fileUrl = item.downloadUrl || `/api/pdf-store/file/${item.id}`;

        // If local item has dataUrl or needs vault registration
        if (item.downloadUrl && (item.downloadUrl.startsWith('data:') || item.downloadUrl.startsWith('blob:'))) {
          try {
            const res = await fetch('/api/pdf-store/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: item.id,
                title: item.title,
                category: item.category,
                fileSize: item.fileSize,
                uploadDate: item.uploadDate,
                description: item.description,
                author: item.author,
                authorId: item.authorId,
                institution: item.institution,
                pdfBase64: item.downloadUrl,
                pageCount: item.pageCount
              })
            });
            const data = await res.json();
            if (data.success && data.downloadUrl) {
              fileUrl = data.downloadUrl;
            }
          } catch (e) {
            console.warn('Backend PDF vault sync error:', e);
          }
        }

        // Push lightweight document metadata to Firestore so all devices see it
        try {
          await setDoc(doc(db, 'pdf_store', item.id), {
            id: item.id,
            title: item.title || 'Untitled PDF',
            category: item.category || 'User Upload',
            fileSize: item.fileSize || '1.0 MB',
            uploadDate: item.uploadDate || new Date().toISOString().split('T')[0],
            description: item.description || '',
            author: item.author || 'Candidate',
            authorId: item.authorId || '',
            institution: item.institution || '',
            downloadUrl: fileUrl,
            isUserUploaded: true,
            pageCount: item.pageCount || 1,
            createdAt: serverTimestamp()
          }, { merge: true });
        } catch (err) {
          console.warn('Firestore sync failed for item ' + item.id, err);
        }
      }
    };

    try {
      const q = collection(db, 'pdf_store');
      unsubscribeFirestorePdf = onSnapshot(q, (snapshot) => {
        const firestoreIds = new Set<string>();
        if (!snapshot.empty) {
          const loadedPdfs: PdfStoreItem[] = snapshot.docs.map(docSnap => {
            const d = docSnap.data();
            firestoreIds.add(docSnap.id);
            return {
              id: docSnap.id,
              title: d.title || 'Untitled PDF',
              category: d.category || 'User Upload',
              fileSize: d.fileSize || '1.0 MB',
              uploadDate: d.uploadDate || new Date().toISOString().split('T')[0],
              description: d.description || '',
              author: d.author || 'Candidate',
              authorId: d.authorId || '',
              institution: d.institution || '',
              downloadUrl: d.downloadUrl || `/api/pdf-store/file/${docSnap.id}`,
              isUserUploaded: true,
              pageCount: d.pageCount || 1,
              createdAt: d.createdAt
            };
          });

          // Memory sort descending by creation timestamp or document ID timestamp
          loadedPdfs.sort((a, b) => {
            const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (parseInt(a.id.replace(/\D/g, '')) || 0);
            const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (parseInt(b.id.replace(/\D/g, '')) || 0);
            return timeB - timeA;
          });

          setItems(loadedPdfs);
          localStorage.setItem(LOCAL_STORAGE_PDF_KEY, JSON.stringify(loadedPdfs));

          // Also check if any local items need to be published to Firestore
          const rawStored = localStorage.getItem(LOCAL_STORAGE_PDF_KEY);
          if (rawStored) {
            try {
              const localList: PdfStoreItem[] = JSON.parse(rawStored);
              const unSynced = localList.filter(it => !firestoreIds.has(it.id));
              if (unSynced.length > 0) {
                syncLocalPdfsToCloud(unSynced, firestoreIds);
              }
            } catch (e) {
              // ignore
            }
          }
        } else {
          loadStoredPdfs(syncLocalPdfsToCloud);
        }
      }, (err) => {
        console.warn('Firestore PDF snapshot warning, falling back to local storage', err);
        loadStoredPdfs(syncLocalPdfsToCloud);
      });
    } catch (e) {
      console.warn('Firestore PDF not reachable, using local storage fallback', e);
      loadStoredPdfs(syncLocalPdfsToCloud);
    }

    return () => {
      if (unsubscribeFirestorePdf) unsubscribeFirestorePdf();
    };
  }, []);

  const loadStoredPdfs = (syncFn?: (localList: PdfStoreItem[], ids: Set<string>) => void) => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PDF_KEY);
      if (stored) {
        const parsed: PdfStoreItem[] = JSON.parse(stored);
        setItems(parsed);
        if (syncFn && parsed.length > 0) {
          syncFn(parsed, new Set<string>());
        }
      } else {
        setItems([]);
      }
    } catch (e) {
      setItems([]);
    }
  };

  // Sync Notifications from Firestore + LocalStorage fallback
  useEffect(() => {
    let unsubscribeNotif: (() => void) | null = null;
    try {
      const q = collection(db, 'notifications');
      unsubscribeNotif = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const loaded: DiscussionNotification[] = snapshot.docs
            .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as DiscussionNotification))
            .filter(n => !n.recipientUid || n.recipientUid === loggedInUid || n.recipientUid === defaultDisplayName || n.recipientUid === 'all');

          loaded.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

          setNotifications(loaded);
          localStorage.setItem(LOCAL_STORAGE_NOTIFS_KEY, JSON.stringify(loaded));
        } else {
          loadStoredNotifications();
        }
      }, () => loadStoredNotifications());
    } catch {
      loadStoredNotifications();
    }
    return () => {
      if (unsubscribeNotif) unsubscribeNotif();
    };
  }, [loggedInUid, defaultDisplayName]);

  const loadStoredNotifications = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_NOTIFS_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    }
  };

  const saveNotification = async (notif: DiscussionNotification) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        recipientUid: notif.recipientUid,
        senderName: notif.senderName,
        discussionId: notif.discussionId,
        discussionTitle: notif.discussionTitle,
        text: notif.text,
        createdAt: notif.createdAt,
        read: false
      });
    } catch (err) {
      console.warn('Firestore notification add warning', err);
    }

    setNotifications(prev => {
      const updated = [notif, ...prev];
      localStorage.setItem(LOCAL_STORAGE_NOTIFS_KEY, JSON.stringify(updated));
      return updated;
    });

    setToastNotif(notif);
    setTimeout(() => setToastNotif(null), 5000);
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (e) {
      console.warn('Firestore notification mark read error', e);
    }
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem(LOCAL_STORAGE_NOTIFS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const markAllNotificationsAsRead = async () => {
    notifications.forEach(async (n) => {
      if (!n.read) {
        try {
          await updateDoc(doc(db, 'notifications', n.id), { read: true });
        } catch {}
      }
    });
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem(LOCAL_STORAGE_NOTIFS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Trigger @CampusAI Advisor AI Answer in Discussion Thread
  const triggerCampusAiAdvisor = async (postId: string, userQuery: string, discussionTitle: string, userAuthorName: string) => {
    setAiThinkingPostId(postId);
    try {
      const promptText = `A student named "${userAuthorName}" asked in discussion topic "${discussionTitle}":
"${userQuery}"

Provide a direct, intelligent, encouraging, and accurate answer as @CampusAI Advisor, the official Nigerian Higher Education & Admission AI Consultant. Focus on official guidelines (JAMB, CAPS, Post-UTME screening rules, aggregate calculation, subject combinations, cut-off marks, O'Level rules, or study materials). Keep formatting clear with bullet points if helpful. Keep it concise (2 to 4 paragraphs).`;

      const systemInstruction = `You are @CampusAI Advisor, the official resident AI Academic Consultant on CampusAI Nigeria. Provide authoritative, friendly, and concise advice.`;

      const result = await generateContent(promptText, [], systemInstruction);
      const aiText = result.text || "Hello! I am @CampusAI Advisor. How can I assist with your JAMB, Post-UTME preparation or admission strategy?";

      const aiComment: DiscussionComment = {
        id: `c-ai-${Date.now()}`,
        author: '@CampusAI Advisor',
        authorId: 'campusai-bot',
        text: aiText,
        timestamp: 'Just now',
        isAi: true,
        createdAt: new Date().toISOString()
      };

      // Update in Firestore & Local State
      setDiscussions(prevDiscussions => {
        const updatedPostList = prevDiscussions.map(p => {
          if (p.id === postId) {
            const newComments = [...(p.comments || []), aiComment];
            try {
              updateDoc(doc(db, 'discussions', postId), { comments: newComments });
            } catch (e) {
              console.warn('Firestore AI comment update warning', e);
            }
            return { ...p, comments: newComments };
          }
          return p;
        });
        saveAllDiscussionsLocally(updatedPostList);
        return updatedPostList;
      });

      // Send notification to user
      const aiNotif: DiscussionNotification = {
        id: `notif-ai-${Date.now()}`,
        recipientUid: loggedInUid,
        senderName: '@CampusAI Advisor 🤖',
        discussionId: postId,
        discussionTitle: discussionTitle,
        text: `@CampusAI Advisor answered your question in "${discussionTitle.slice(0, 30)}..."`,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      saveNotification(aiNotif);

    } catch (err) {
      console.error('Failed to generate @CampusAI Advisor response:', err);
    } finally {
      setAiThinkingPostId(null);
    }
  };

  const saveAllPdfItemsLocally = (newItemsList: PdfStoreItem[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PDF_KEY, JSON.stringify(newItemsList));
    } catch (e) {
      console.warn('LocalStorage quota warning', e);
    }
  };

  const saveAllDiscussionsLocally = (newDiscList: DiscussionPost[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_DISCUSSIONS_KEY, JSON.stringify(newDiscList));
    } catch (e) {
      console.warn('LocalStorage quota warning for discussions', e);
    }
  };

  // PDF Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        setUploadError('Please select a valid PDF file (.pdf)');
        return;
      }

      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.pdf$/i, ''));
      }

      setIsProcessingFile(true);
      const reader = new FileReader();
      reader.onload = () => {
        setFileDataUrl(reader.result as string);
        setIsProcessingFile(false);
      };
      reader.onerror = () => {
        setUploadError('Failed to read PDF file.');
        setIsProcessingFile(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !fileDataUrl) {
      setUploadError('Please select a PDF file to upload.');
      return;
    }
    if (!uploadTitle.trim()) {
      setUploadError('Please enter a document title.');
      return;
    }

    setIsProcessingFile(true);

    const sizeInMb = (selectedFile.size / (1024 * 1024)).toFixed(2);
    const pdfDocId = `pdf-${Date.now()}`;
    const authorName = defaultDisplayName || 'Student Candidate';

    let serverDownloadUrl = `/api/pdf-store/file/${pdfDocId}`;
    let firebaseStoragePath: string | undefined = undefined;

    // 1. Primary Cloud Storage: Upload directly to Firebase Cloud Storage bucket
    try {
      const storageRes = await uploadPdfToFirebaseStorage(pdfDocId, selectedFile, {
        title: uploadTitle.trim(),
        author: authorName,
        category: uploadCategory
      });
      if (storageRes.success && storageRes.downloadUrl) {
        serverDownloadUrl = storageRes.downloadUrl;
        firebaseStoragePath = storageRes.storagePath;
      }
    } catch (err) {
      console.warn('Firebase Storage upload warning, continuing with disk vault fallback:', err);
    }

    // 2. Client IndexedDB for instant offline access & local speed
    try {
      await savePdfBlobLocally(pdfDocId, fileDataUrl);
    } catch (err) {
      console.warn('IndexedDB save error:', err);
    }

    // 3. Redundant Server Disk Vault for persistent multi-device streaming
    try {
      const res = await fetch('/api/pdf-store/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: pdfDocId,
          title: uploadTitle.trim(),
          category: uploadCategory,
          fileSize: `${sizeInMb} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          description: uploadDescription.trim() || 'User uploaded study document for Post-UTME / JAMB preparation.',
          author: authorName,
          authorId: loggedInUid,
          institution: uploadInstitution.trim() || 'Custom Document',
          pdfBase64: fileDataUrl,
          pageCount: Math.max(1, Math.floor(selectedFile.size / 30000))
        })
      });
      const data = await res.json();
      if (data.success && data.downloadUrl && !firebaseStoragePath) {
        serverDownloadUrl = data.downloadUrl;
      }
    } catch (err) {
      console.warn('Server PDF vault upload warning, proceeding with direct URL', err);
    }

    const newItem: PdfStoreItem = {
      id: pdfDocId,
      title: uploadTitle.trim(),
      category: uploadCategory,
      fileSize: `${sizeInMb} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      description: uploadDescription.trim() || 'User uploaded study document for Post-UTME / JAMB preparation.',
      author: authorName,
      authorId: loggedInUid,
      institution: uploadInstitution.trim() || 'Custom Document',
      downloadUrl: serverDownloadUrl,
      storagePath: firebaseStoragePath,
      isUserUploaded: true,
      pageCount: Math.max(1, Math.floor(selectedFile.size / 30000))
    };

    // 3. Save lightweight record to Firestore so all devices see the new document
    try {
      await setDoc(doc(db, 'pdf_store', pdfDocId), {
        ...newItem,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore setDoc for PDF warning', err);
    }

    // Save locally
    const updatedList = [newItem, ...items];
    setItems(updatedList);
    saveAllPdfItemsLocally(updatedList);

    setIsProcessingFile(false);
    setUploadTitle('');
    setUploadCategory('User Upload');
    setUploadInstitution('');
    setUploadDescription('');
    setSelectedFile(null);
    setFileDataUrl(null);
    setUploadError('');
    setIsUploadModalOpen(false);
  };

  // Re-upload / Update File Handlers
  const handleTriggerReplaceFile = (item: PdfStoreItem) => {
    setReplaceTargetItem(item);
    replaceFileInputRef.current?.click();
  };

  const handleReplaceFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceTargetItem) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF file.');
      return;
    }

    setIsReplacingFile(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
        const targetId = replaceTargetItem.id;

        // 1. Save to local IndexedDB
        await savePdfBlobLocally(targetId, base64);

        let updatedUrl = `/api/pdf-store/file/${targetId}?v=${Date.now()}`;
        let storagePath = replaceTargetItem.storagePath;

        // 2. Primary: Upload replacement to Firebase Storage
        try {
          const storageRes = await uploadPdfToFirebaseStorage(targetId, file, {
            title: replaceTargetItem.title,
            author: replaceTargetItem.author,
            category: replaceTargetItem.category
          });
          if (storageRes.success && storageRes.downloadUrl) {
            updatedUrl = storageRes.downloadUrl;
            storagePath = storageRes.storagePath;
          }
        } catch (err) {
          console.warn('Firebase storage replacement warning:', err);
        }

        // 3. Post to server vault to permanently overwrite disk PDF
        try {
          const res = await fetch('/api/pdf-store/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: targetId,
              title: replaceTargetItem.title,
              category: replaceTargetItem.category,
              fileSize: `${sizeInMb} MB`,
              uploadDate: new Date().toISOString().split('T')[0],
              description: replaceTargetItem.description,
              author: replaceTargetItem.author,
              authorId: replaceTargetItem.authorId || loggedInUid,
              institution: replaceTargetItem.institution,
              pdfBase64: base64,
              pageCount: Math.max(1, Math.floor(file.size / 30000))
            })
          });
          const data = await res.json();
          if (data.downloadUrl && !storagePath) {
            updatedUrl = `${data.downloadUrl}?v=${Date.now()}`;
          }
        } catch (err) {
          console.warn('Server vault update error:', err);
        }

        // 4. Update Firestore
        try {
          await updateDoc(doc(db, 'pdf_store', targetId), {
            fileSize: `${sizeInMb} MB`,
            uploadDate: new Date().toISOString().split('T')[0],
            downloadUrl: updatedUrl,
            storagePath: storagePath || null,
            updatedAt: serverTimestamp()
          });
        } catch (err) {
          console.warn('Firestore update warning:', err);
        }

        // 5. Update local state
        const updatedItems = items.map(it => it.id === targetId ? {
          ...it,
          fileSize: `${sizeInMb} MB`,
          downloadUrl: updatedUrl,
          storagePath: storagePath,
          uploadDate: new Date().toISOString().split('T')[0]
        } : it);
        setItems(updatedItems);
        saveAllPdfItemsLocally(updatedItems);

        // 5. Update preview item if currently previewing
        if (previewingItem?.id === targetId) {
          setPreviewingItem({
            ...previewingItem,
            fileSize: `${sizeInMb} MB`,
            downloadUrl: updatedUrl
          });
          setPreviewTimestamp(Date.now());
        }

        alert(`Document "${replaceTargetItem.title}" file successfully updated in the vault!`);
      } catch (err) {
        console.error('Failed to replace file:', err);
        alert('Failed to replace file. Please try again.');
      } finally {
        setIsReplacingFile(false);
        setReplaceTargetItem(null);
        if (replaceFileInputRef.current) {
          replaceFileInputRef.current.value = '';
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Modal Opener Wrappers with Guest Auth Check
  const handleOpenUploadModal = () => {
    if (!isUserLoggedIn) {
      if (onLoginRequest) onLoginRequest();
      else alert('Please sign in or log in to upload PDF documents.');
      return;
    }
    setIsUploadModalOpen(true);
  };

  const handleOpenNewDiscussionModal = () => {
    if (!isUserLoggedIn) {
      if (onLoginRequest) onLoginRequest();
      else alert('Please sign in or log in to start a group discussion.');
      return;
    }
    setIsNewDiscussionModalOpen(true);
  };

  const handlePreviewPdf = (item: PdfStoreItem) => {
    if (!isUserLoggedIn) {
      if (onLoginRequest) onLoginRequest();
      else alert('Please sign in or log in to preview or open PDF files.');
      return;
    }
    setPreviewingItem(item);
  };

  const onRequestDeletePdf = (item: PdfStoreItem) => {
    if (!isUserLoggedIn) {
      if (onLoginRequest) onLoginRequest();
      return;
    }
    setDeleteTarget({
      type: 'pdf',
      id: item.id,
      title: item.title
    });
  };

  const handleDownload = async (item: PdfStoreItem) => {
    if (!isUserLoggedIn) {
      if (onLoginRequest) onLoginRequest();
      else alert('Please sign in or log in to download PDF files.');
      return;
    }

    setDownloadingId(item.id);
    const safeFilename = `${(item.title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    try {
      // 1. Check local IndexedDB first for instant local binary retrieval
      const localBase64 = await getPdfBlobLocally(item.id);
      if (localBase64) {
        const base64Content = localBase64.includes(',') ? localBase64.split(',')[1] : localBase64;
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = safeFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
        setDownloadingId(null);
        return;
      }

      // 2. Fetch binary stream directly from Firebase Storage or server vault
      let targetUrl = `/api/pdf-store/file/${item.id}?download=1&title=${encodeURIComponent(item.title)}`;
      if (item.downloadUrl) {
        if (item.downloadUrl.startsWith('http')) {
          targetUrl = item.downloadUrl;
        } else {
          targetUrl = item.downloadUrl.includes('?')
            ? `${item.downloadUrl}&download=1&title=${encodeURIComponent(item.title)}`
            : `${item.downloadUrl}?download=1&title=${encodeURIComponent(item.title)}`;
        }
      }

      const res = await fetch(targetUrl);
      if (res.ok) {
        const blob = await res.blob();
        if (blob.size > 100) {
          const objectUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = objectUrl;
          a.download = safeFilename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
          setDownloadingId(null);
          return;
        }
      }
    } catch (err) {
      console.warn('[PDF Download Error] Falling back to client generator:', err);
    }

    // 3. Fallback client generation: creates verified study guide blob instantly so download NEVER fails
    try {
      const fallbackBlob = generateClientStudyPdf(item.title, item.category, item.author);
      const objectUrl = URL.createObjectURL(fallbackBlob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = safeFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    } catch (e) {
      console.error('Final fallback error:', e);
    } finally {
      setDownloadingId(null);
    }
  };

  // Discussion Handlers
  const handleNewDiscussionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUserLoggedIn) {
      if (onLoginRequest) onLoginRequest();
      else alert('Please sign in or log in to post a new discussion topic.');
      return;
    }

    if (!discTitle.trim() || !discContent.trim()) {
      setDiscError('Please fill in both the discussion title and message content.');
      return;
    }

    const docId = `disc-${Date.now()}`;
    const authorName = discAuthor.trim() || defaultDisplayName || 'Candidate_Member';

    const newPost: DiscussionPost = {
      id: docId,
      title: discTitle.trim(),
      category: discCategory,
      author: authorName,
      authorId: loggedInUid,
      timestamp: 'Just now',
      content: discContent.trim(),
      upvotes: 1,
      likedBy: [loggedInUid],
      userUpvoted: true,
      comments: [],
      targetSchool: discSchool.trim() || undefined
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'discussions', docId), {
        ...newPost,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore setDoc discussion warning', err);
    }

    // Save locally
    const updated = [newPost, ...discussions];
    setDiscussions(updated);
    saveAllDiscussionsLocally(updated);

    const checkAi = (discContent + ' ' + discTitle).toLowerCase();
    const isTaggingAi = checkAi.includes('@campusai') || checkAi.includes('@ai');

    setDiscTitle('');
    setDiscCategory('General Advice');
    setDiscAuthor(defaultDisplayName || '');
    setDiscSchool('');
    setDiscContent('');
    setDiscError('');
    setIsNewDiscussionModalOpen(false);
    setExpandedDiscId(newPost.id);

    if (isTaggingAi) {
      triggerCampusAiAdvisor(docId, newPost.content, newPost.title, authorName);
    }
  };

  const handleToggleUpvote = async (postId: string) => {
    if (!isUserLoggedIn) {
      if (onLoginRequest) onLoginRequest();
      else alert('Please sign in or log in to like discussions.');
      return;
    }

    const post = discussions.find(p => p.id === postId);
    if (!post) return;

    const likedBy = post.likedBy || [];
    const isUpvoted = likedBy.includes(loggedInUid) || post.userUpvoted;
    const newUpvotes = isUpvoted ? Math.max(0, post.upvotes - 1) : post.upvotes + 1;
    const newLikedBy = isUpvoted ? likedBy.filter(id => id !== loggedInUid) : [...likedBy, loggedInUid];

    // Firestore update
    try {
      await updateDoc(doc(db, 'discussions', postId), {
        upvotes: newUpvotes,
        likedBy: isUpvoted ? arrayRemove(loggedInUid) : arrayUnion(loggedInUid)
      });
    } catch (err) {
      console.warn('Firestore updateDoc upvote warning', err);
    }

    // Local update
    const updated = discussions.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          upvotes: newUpvotes,
          likedBy: newLikedBy,
          userUpvoted: !isUpvoted
        };
      }
      return p;
    });
    setDiscussions(updated);
    saveAllDiscussionsLocally(updated);
  };

  const handleAddComment = async (postId: string) => {
    if (!isUserLoggedIn) {
      if (onLoginRequest) onLoginRequest();
      else alert('Please sign in or log in to reply to discussions.');
      return;
    }

    if (!replyText.trim()) return;

    const authorName = replyAuthor.trim() || defaultDisplayName || 'Scholar_Guest';
    const commentBody = replyText.trim();
    const newComment: DiscussionComment = {
      id: `comment-${Date.now()}`,
      author: authorName,
      authorId: loggedInUid,
      text: commentBody,
      timestamp: 'Just now',
      createdAt: new Date().toISOString()
    };

    const targetPost = discussions.find(p => p.id === postId);
    if (!targetPost) return;

    const updatedComments = [...(targetPost.comments || []), newComment];

    // Firestore update
    try {
      await updateDoc(doc(db, 'discussions', postId), {
        comments: updatedComments
      });
    } catch (err) {
      console.warn('Firestore updateDoc comment warning', err);
    }

    // Local update
    const updated = discussions.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: updatedComments
        };
      }
      return p;
    });

    setDiscussions(updated);
    saveAllDiscussionsLocally(updated);
    setReplyText('');

    // Send Notification to Thread Author
    if (targetPost.authorId !== loggedInUid && targetPost.author !== authorName) {
      const replyNotif: DiscussionNotification = {
        id: `notif-rep-${Date.now()}`,
        recipientUid: targetPost.authorId || targetPost.author,
        senderName: authorName,
        discussionId: targetPost.id,
        discussionTitle: targetPost.title,
        text: `${authorName} replied: "${commentBody.slice(0, 45)}..."`,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      saveNotification(replyNotif);
    }

    // Check if reply tagged @campusai or @ai
    const checkAi = commentBody.toLowerCase();
    const isTaggingAi = checkAi.includes('@campusai') || checkAi.includes('@ai');

    if (isTaggingAi) {
      triggerCampusAiAdvisor(postId, commentBody, targetPost.title, authorName);
    }
  };

  const onRequestDeleteDiscussion = (post: DiscussionPost) => {
    if (!isUserLoggedIn) {
      if (onLoginRequest) onLoginRequest();
      return;
    }
    setDeleteTarget({
      type: 'discussion',
      id: post.id,
      title: post.title
    });
  };

  const onRequestDeleteComment = (postId: string, comment: DiscussionComment) => {
    if (!isUserLoggedIn) {
      if (onLoginRequest) onLoginRequest();
      return;
    }
    setDeleteTarget({
      type: 'comment',
      id: comment.id,
      discussionId: postId,
      title: `reply by @${comment.author}`
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.type === 'pdf') {
        const pdfId = deleteTarget.id;

        // Delete from Firebase Storage if present
        try {
          await deletePdfFromFirebaseStorage(pdfId);
        } catch (err) {
          console.warn('Firebase Storage delete warning:', err);
        }

        try {
          await deleteDoc(doc(db, 'pdf_store', pdfId));
        } catch (err) {
          console.warn('Firestore deleteDoc for PDF warning', err);
        }

        setItems(prevItems => {
          const updatedList = prevItems.filter(item => item.id !== pdfId);
          saveAllPdfItemsLocally(updatedList);
          return updatedList;
        });

        if (previewingItem?.id === pdfId) {
          setPreviewingItem(null);
        }
      } else if (deleteTarget.type === 'discussion') {
        const postId = deleteTarget.id;
        try {
          await deleteDoc(doc(db, 'discussions', postId));
        } catch (err) {
          console.warn('Firestore deleteDoc discussion warning', err);
        }

        setDiscussions(prevDisc => {
          const updated = prevDisc.filter(d => d.id !== postId);
          saveAllDiscussionsLocally(updated);
          return updated;
        });

        if (expandedDiscId === postId) {
          setExpandedDiscId(null);
        }
      } else if (deleteTarget.type === 'comment' && deleteTarget.discussionId) {
        const postId = deleteTarget.discussionId;
        const commentId = deleteTarget.id;

        const targetPost = discussions.find(d => d.id === postId);
        if (targetPost) {
          const updatedComments = (targetPost.comments || []).filter(c => c.id !== commentId);
          try {
            await updateDoc(doc(db, 'discussions', postId), { comments: updatedComments });
          } catch (err) {
            console.warn('Firestore comment delete warning', err);
          }

          setDiscussions(prevDisc => {
            const updated = prevDisc.map(d => d.id === postId ? { ...d, comments: updatedComments } : d);
            saveAllDiscussionsLocally(updated);
            return updated;
          });
        }
      }
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // PDF Categories
  const pdfCategories = ['All', 'JAMB Syllabus', 'Past Questions', 'Post-UTME Guide', 'User Upload', 'Result Slip', 'General Notes'];

  const filteredPdfItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.institution && item.institution.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.author && item.author.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Discussion Categories
  const discussionCategories = ['All', 'General Advice', 'Subject Combination', 'PDF Requests & Notes', 'Post-UTME Prep', 'CAPS & Clearance'];

  const filteredDiscussions = discussions.filter(disc => {
    const matchesCat = selectedDiscussionCategory === 'All' || disc.category === selectedDiscussionCategory;
    const matchesSearch = 
      disc.title.toLowerCase().includes(discussionSearch.toLowerCase()) ||
      disc.content.toLowerCase().includes(discussionSearch.toLowerCase()) ||
      disc.author.toLowerCase().includes(discussionSearch.toLowerCase()) ||
      (disc.targetSchool && disc.targetSchool.toLowerCase().includes(discussionSearch.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="PDF Store & Student Discussion Hub | CampusAI Nigeria"
        description="Upload, preview, store, and download PDF study guides, and join student group discussions, ask questions, and share admission advice."
        canonical="/pdf-store"
      />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
                <FolderDown size={14} />
                <span>Academic Repository & Group Hub</span>
              </div>

              {/* Logged in User Badge */}
              {activeUser ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-300/30 text-emerald-200 text-xs font-bold">
                  <UserCheck size={14} className="text-emerald-400" />
                  <span>Logged in: {defaultDisplayName || activeUser.email}</span>
                </div>
              ) : (
                <button
                  onClick={onLoginRequest}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/30 hover:bg-amber-500/50 border border-amber-300/30 text-amber-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <LogIn size={13} />
                  <span>Sign In to Sync Account</span>
                </button>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              CampusAI PDF Vault & Discussion Hub
            </h1>
            <p className="text-sm sm:text-base text-emerald-100 font-medium leading-relaxed">
              Upload and manage your PDF study materials, or join the candidate discussion group to ask questions, share admission advice, and collaborate with scholars. All chats and discussions are saved continuously.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setActiveTab('store');
                  handleOpenUploadModal();
                }}
                className="px-5 py-2.5 rounded-2xl bg-white text-emerald-800 font-extrabold text-xs hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Upload size={16} />
                <span>Upload PDF File</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('discussions');
                  handleOpenNewDiscussionModal();
                }}
                className="px-5 py-2.5 rounded-2xl bg-emerald-900/60 hover:bg-emerald-900/80 text-white font-extrabold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer border border-emerald-400/30"
              >
                <MessageCirclePlus size={16} />
                <span>Start Group Discussion</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'store'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
            }`}
          >
            <FolderDown size={16} />
            <span>PDF Store & Vault ({items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('discussions')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'discussions'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
            }`}
          >
            <Users size={16} />
            <span>Discussion Hub & Community ({discussions.length})</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative ml-auto px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 shadow-sm shrink-0"
            title="Discussion Activity Notifications"
          >
            <Bell size={16} className={notifications.filter(n => !n.read).length > 0 ? "text-amber-500 animate-bounce" : "text-gray-500"} />
            <span className="hidden sm:inline">Notifications</span>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px]">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: PDF STORE */}
        {activeTab === 'store' && (
          <div className="space-y-6">
            {/* Search & Filter Controls */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search PDF by title, subject, or university..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/80 text-sm outline-none focus:border-emerald-500 transition-colors"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleOpenUploadModal}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <FilePlus size={16} />
                  <span>Add PDF File</span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 no-scrollbar">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                  <Filter size={12} /> Filter:
                </span>
                {pdfCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* PDF Store Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="text-emerald-600 dark:text-emerald-400" size={20} />
                  <span>Available PDF Documents ({filteredPdfItems.length})</span>
                </h2>
              </div>

              {filteredPdfItems.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-800 rounded-3xl p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <FileText size={32} />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">Your PDF Store is Empty</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Upload your WAEC/NECO slips, Post-UTME papers, or study notes to store them securely.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenUploadModal}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>Upload First PDF Document</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPdfItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            item.category === 'JAMB Syllabus' 
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : item.category === 'Past Questions'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                              : item.category === 'User Upload'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}>
                            {item.category}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            {isUserLoggedIn && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTriggerReplaceFile(item);
                                }}
                                title="Re-upload or update PDF file"
                                className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                              >
                                <Upload size={14} />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRequestDeletePdf(item);
                              }}
                              title="Delete PDF document"
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {item.title}
                        </h3>

                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                          <span>Author: {item.author || 'Candidate'}</span>
                          <span>Size: {item.fileSize}</span>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                        <button
                          onClick={() => handlePreviewPdf(item)}
                          className="flex-1 py-2 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {isUserLoggedIn ? <Eye size={14} /> : <Lock size={13} className="text-amber-500" />}
                          <span>{isUserLoggedIn ? 'Preview' : 'Login to View'}</span>
                        </button>

                        <button
                          onClick={() => handleDownload(item)}
                          disabled={downloadingId === item.id}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-75"
                        >
                          {downloadingId === item.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : isUserLoggedIn ? (
                            <Download size={14} />
                          ) : (
                            <Lock size={13} className="text-emerald-200" />
                          )}
                          <span>{downloadingId === item.id ? 'Downloading...' : isUserLoggedIn ? 'Download' : 'Login to Download'}</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DISCUSSION HUB & GROUP */}
        {activeTab === 'discussions' && (
          <div className="space-y-6">
            {/* Search & New Discussion Header Controls */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search discussion topics, questions, or school advice..."
                    value={discussionSearch}
                    onChange={(e) => setDiscussionSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/80 text-sm outline-none focus:border-emerald-500 transition-colors"
                  />
                  {discussionSearch && (
                    <button 
                      onClick={() => setDiscussionSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleOpenNewDiscussionModal}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <PlusCircle size={16} />
                  <span>Ask Question / Suggest Topic</span>
                </button>
              </div>

              {/* Discussion Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 no-scrollbar">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                  <Filter size={12} /> Topics:
                </span>
                {discussionCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedDiscussionCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedDiscussionCategory === cat
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Discussions List */}
            <div className="space-y-4">
              {filteredDiscussions.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-800 rounded-3xl p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <MessageSquare size={32} />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">No discussions found</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Be the first candidate to start a discussion thread or ask for Post-UTME advice!
                    </p>
                  </div>
                  <button
                    onClick={handleOpenNewDiscussionModal}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle size={14} />
                    <span>Start First Group Discussion</span>
                  </button>
                </div>
              ) : (
                filteredDiscussions.map((post) => {
                  const isExpanded = expandedDiscId === post.id;
                  const isLikedByMe = (post.likedBy || []).includes(loggedInUid) || post.userUpvoted;

                  return (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4 transition-all"
                    >
                      {/* Post Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                            {post.category}
                          </span>
                          {post.targetSchool && (
                            <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-bold">
                              🏫 {post.targetSchool}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                          <span className="font-bold text-gray-700 dark:text-gray-300">@{post.author}</span>
                          <span>•</span>
                          <span>{post.timestamp}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRequestDeleteDiscussion(post);
                            }}
                            title="Remove discussion post"
                            className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors ml-1 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Body */}
                      <div className="space-y-2">
                        <h3 
                          onClick={() => setExpandedDiscId(isExpanded ? null : post.id)}
                          className="font-black text-base text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors leading-snug"
                        >
                          {post.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          {post.content}
                        </p>
                      </div>

                      {/* Upvote & Comment Bar */}
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 text-xs font-bold">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleUpvote(post.id)}
                            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                              isLikedByMe
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {isUserLoggedIn ? <ThumbsUp size={14} /> : <Lock size={13} className="text-amber-500" />}
                            <span>{post.upvotes} Helpful</span>
                          </button>

                          <button
                            onClick={() => setExpandedDiscId(isExpanded ? null : post.id)}
                            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <MessageCircle size={14} />
                            <span>{(post.comments || []).length} Replies</span>
                          </button>
                        </div>

                        <button
                          onClick={() => setExpandedDiscId(isExpanded ? null : post.id)}
                          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          {isExpanded ? 'Hide Replies ↑' : 'View Thread →'}
                        </button>
                      </div>

                      {/* Expanded Comments Thread */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4"
                          >
                            {/* Existing Replies List */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                                Member Replies ({(post.comments || []).length})
                              </h4>

                              {(post.comments || []).length === 0 && aiThinkingPostId !== post.id ? (
                                <p className="text-xs text-gray-400 italic">No replies yet. Be the first to share your advice or ask @CampusAI Advisor!</p>
                              ) : (
                                post.comments.map((comment) => {
                                  const isAiBot = comment.isAi || comment.author.includes('@CampusAI') || comment.authorId === 'campusai-bot';
                                  
                                  if (isAiBot) {
                                    return (
                                      <div
                                        key={comment.id}
                                        className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 space-y-2 text-xs shadow-sm"
                                      >
                                        <div className="flex items-center justify-between text-[11px]">
                                          <div className="flex items-center gap-1.5 font-extrabold text-emerald-700 dark:text-emerald-300">
                                            <div className="p-1 rounded-lg bg-emerald-600 text-white">
                                              <Bot size={14} />
                                            </div>
                                            <span>@CampusAI Advisor</span>
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider">
                                              Official AI
                                            </span>
                                          </div>
                                          <span className="text-gray-400">{comment.timestamp}</span>
                                        </div>
                                        <div className="text-gray-800 dark:text-gray-100 font-medium leading-relaxed whitespace-pre-line pl-1">
                                          {comment.text}
                                        </div>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div
                                      key={comment.id}
                                      className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1 text-xs"
                                    >
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                          @{comment.author}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-400">{comment.timestamp}</span>
                                          <button
                                            onClick={() => onRequestDeleteComment(post.id, comment)}
                                            title="Delete reply"
                                            className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      </div>
                                      <p className="text-gray-700 dark:text-gray-200 font-medium leading-relaxed">
                                        {comment.text}
                                      </p>
                                    </div>
                                  );
                                })
                              )}

                              {/* AI Thinking Animation */}
                              {aiThinkingPostId === post.id && (
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-700 dark:text-emerald-300 animate-pulse font-bold">
                                  <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400 animate-spin" />
                                  <span>@CampusAI Advisor is analyzing your question and drafting an answer...</span>
                                </div>
                              )}
                            </div>

                            {/* Reply Input Box or Guest Login Notice */}
                            {!isUserLoggedIn ? (
                              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-center space-y-2.5">
                                <div className="inline-flex items-center justify-center p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300">
                                  <Lock size={16} />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-black text-gray-900 dark:text-white">
                                    Log in required to reply or like discussions
                                  </p>
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                    Guests can view group discussions. To join the conversation, reply, or upvote topics, please sign in.
                                  </p>
                                </div>
                                <button
                                  onClick={onLoginRequest}
                                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                                >
                                  <LogIn size={14} />
                                  <span>Sign In to Reply</span>
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between gap-2 pb-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!replyText.toLowerCase().includes('@campusai')) {
                                        setReplyText(prev => prev ? `${prev} @campusai ` : '@campusai ');
                                      }
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[11px] font-bold cursor-pointer transition-all border border-emerald-300/50"
                                    title="Tag @CampusAI Advisor for instant AI response"
                                  >
                                    <Bot size={13} className="text-emerald-600 dark:text-emerald-400" />
                                    <span>✨ Mention @CampusAI for instant answer</span>
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Your Display Name"
                                    value={replyAuthor}
                                    onChange={(e) => setReplyAuthor(e.target.value)}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs font-bold outline-none focus:border-emerald-500"
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Write a reply or tag @campusai..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleAddComment(post.id);
                                    }}
                                    className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs outline-none focus:border-emerald-500 font-medium"
                                  />
                                  <button
                                    onClick={() => handleAddComment(post.id)}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                                  >
                                    <Send size={14} />
                                    <span>Reply</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload PDF Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Upload size={20} />
                  </div>
                  <h3 className="font-black text-lg text-gray-900 dark:text-white">Upload PDF to Store</h3>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-medium">
                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 flex items-center gap-2 text-xs">
                    <AlertCircle size={14} />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                    Select PDF File (.pdf) *
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center hover:border-emerald-500 dark:hover:border-emerald-500 bg-gray-50 dark:bg-gray-800/50 cursor-pointer transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="space-y-1">
                        <CheckCircle2 className="mx-auto text-emerald-500" size={28} />
                        <p className="font-bold text-gray-900 dark:text-white truncate max-w-xs mx-auto">
                          {selectedFile.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="mx-auto text-gray-400" size={28} />
                        <p className="font-bold text-gray-700 dark:text-gray-300">
                          Click to browse or drag & drop PDF here
                        </p>
                        <p className="text-[10px] text-gray-400">Maximum recommended file size: 25MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UNILAG 2025 Post-UTME Past Questions"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:border-emerald-500 text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                      Category
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:border-emerald-500 text-xs font-bold"
                    >
                      <option value="User Upload">User Upload</option>
                      <option value="JAMB Syllabus">JAMB Syllabus</option>
                      <option value="Past Questions">Past Questions</option>
                      <option value="Post-UTME Guide">Post-UTME Guide</option>
                      <option value="Result Slip">Result Slip</option>
                      <option value="General Notes">General Notes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                      Target Institution / Course
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UNILAG / Use of English"
                      value={uploadInstitution}
                      onChange={(e) => setUploadInstitution(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:border-emerald-500 text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                    Description / Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the PDF content..."
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingFile}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Upload size={14} />
                    <span>Upload PDF</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Discussion Modal */}
      <AnimatePresence>
        {isNewDiscussionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <MessageCirclePlus size={20} />
                  </div>
                  <h3 className="font-black text-lg text-gray-900 dark:text-white">Start New Discussion</h3>
                </div>
                <button
                  onClick={() => setIsNewDiscussionModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleNewDiscussionSubmit} className="space-y-4 text-xs font-medium">
                {discError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 flex items-center gap-2 text-xs">
                    <AlertCircle size={14} />
                    <span>{discError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                    Discussion Title / Question *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. What is the cut-off mark for UNILAG Law this year?"
                    value={discTitle}
                    onChange={(e) => setDiscTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:border-emerald-500 text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                      Topic Category
                    </label>
                    <select
                      value={discCategory}
                      onChange={(e) => setDiscCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:border-emerald-500 text-xs font-bold"
                    >
                      <option value="General Advice">General Advice</option>
                      <option value="Subject Combination">Subject Combination</option>
                      <option value="PDF Requests & Notes">PDF Requests & Notes</option>
                      <option value="Post-UTME Prep">Post-UTME Prep</option>
                      <option value="CAPS & Clearance">CAPS & Clearance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                      Target Institution (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UNILAG, OAU, UI"
                      value={discSchool}
                      onChange={(e) => setDiscSchool(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:border-emerald-500 text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your Display Name"
                    value={discAuthor}
                    onChange={(e) => setDiscAuthor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:border-emerald-500 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                    Discussion Details / Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write details about your question, advice, or PDF request..."
                    value={discContent}
                    onChange={(e) => setDiscContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:border-emerald-500 text-xs font-medium"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewDiscussionModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <Send size={14} />
                    <span>Publish Topic</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF Document Preview Modal */}
      <AnimatePresence>
        {previewingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="text-emerald-600 dark:text-emerald-400" size={24} />
                  <div>
                    <h3 className="font-black text-base text-gray-900 dark:text-white line-clamp-1">
                      {previewingItem.title}
                    </h3>
                    <span className="text-xs text-gray-400">Category: {previewingItem.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewingItem(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Embedded Document / Base64 Viewer */}
              <div className="space-y-4">
                {previewingItem.downloadUrl ? (
                  <div className="w-full h-96 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 relative">
                    <iframe
                      src={
                        previewingItem.downloadUrl.includes('?')
                          ? `${previewingItem.downloadUrl}&t=${previewTimestamp}&title=${encodeURIComponent(previewingItem.title)}`
                          : `${previewingItem.downloadUrl}?t=${previewTimestamp}&title=${encodeURIComponent(previewingItem.title)}`
                      }
                      title={previewingItem.title}
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-6 text-center space-y-3">
                    <ShieldCheck className="mx-auto text-emerald-600 dark:text-emerald-400" size={36} />
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Document Information</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                      {previewingItem.description}
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs font-bold text-gray-500">
                      <span>Author: {previewingItem.author}</span>
                      <span>•</span>
                      <span>Size: {previewingItem.fileSize}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const url = previewingItem.downloadUrl
                        ? (previewingItem.downloadUrl.includes('?')
                            ? `${previewingItem.downloadUrl}&title=${encodeURIComponent(previewingItem.title)}`
                            : `${previewingItem.downloadUrl}?title=${encodeURIComponent(previewingItem.title)}`)
                        : `/api/pdf-store/file/${previewingItem.id}?title=${encodeURIComponent(previewingItem.title)}`;
                      window.open(url, '_blank');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Open full PDF viewer in new tab"
                  >
                    <ExternalLink size={13} />
                    <span>Fullscreen / Tab</span>
                  </button>

                  {isUserLoggedIn && (
                    <button
                      onClick={() => handleTriggerReplaceFile(previewingItem)}
                      disabled={isReplacingFile}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-500/20 disabled:opacity-50"
                      title="Re-upload or update this PDF document file"
                    >
                      {isReplacingFile ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
                      <span>{isReplacingFile ? 'Updating...' : 'Re-upload File'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewingItem(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    Close Preview
                  </button>
                  <button
                    onClick={() => handleDownload(previewingItem)}
                    disabled={downloadingId === previewingItem.id}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-75"
                  >
                    {downloadingId === previewingItem.id ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    <span>{downloadingId === previewingItem.id ? 'Downloading...' : 'Download PDF Document'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden File Input for PDF Replacement */}
      <input
        type="file"
        ref={replaceFileInputRef}
        onChange={handleReplaceFileSelected}
        accept="application/pdf"
        className="hidden"
      />

      {/* Notifications Drawer / Modal */}
      <AnimatePresence>
        {isNotifOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-gray-900 dark:text-white">Discussion Activity Notifications</h3>
                    <p className="text-[11px] text-gray-500">Replies & @CampusAI Advisor responses</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {notifications.some(n => !n.read) && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck size={14} />
                      <span>Mark all read</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotifOpen(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center space-y-2 text-gray-400">
                    <Bell className="mx-auto text-gray-300 dark:text-gray-700" size={32} />
                    <p className="text-xs font-bold">No notifications yet</p>
                    <p className="text-[11px]">You will be notified when members reply to your group discussions or when @CampusAI Advisor responds.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.discussionId) {
                          setActiveTab('discussions');
                          setExpandedDiscId(notif.discussionId);
                          setIsNotifOpen(false);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs space-y-1 ${
                        notif.read
                          ? 'bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 opacity-80'
                          : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          {notif.senderName.includes('CampusAI') && <Bot size={13} className="text-emerald-600" />}
                          <span>{notif.senderName}</span>
                        </span>
                        <span className="text-gray-400">{notif.createdAt}</span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 font-medium leading-snug">
                        {notif.text}
                      </p>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        Topic: "{notif.discussionTitle}" →
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-center">
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 font-bold text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer w-full"
                >
                  Close Notifications
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Banner for New Replies / AI Advisor Answers */}
      <AnimatePresence>
        {toastNotif && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-gray-900 text-white rounded-2xl p-4 shadow-2xl border border-emerald-500/40 flex items-start gap-3"
          >
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
              {toastNotif.senderName.includes('CampusAI') ? <Bot size={20} /> : <Bell size={20} />}
            </div>
            <div className="flex-1 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-emerald-400">{toastNotif.senderName}</span>
                <span className="text-[10px] text-gray-400">{toastNotif.createdAt}</span>
              </div>
              <p className="text-gray-200 font-medium leading-snug line-clamp-2">
                {toastNotif.text}
              </p>
              <button
                onClick={() => {
                  setActiveTab('discussions');
                  setExpandedDiscId(toastNotif.discussionId);
                  setToastNotif(null);
                }}
                className="text-[11px] font-bold text-emerald-300 hover:underline inline-block pt-1 cursor-pointer"
              >
                View Discussion Thread →
              </button>
            </div>
            <button
              onClick={() => setToastNotif(null)}
              className="text-gray-400 hover:text-white p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 shrink-0">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="font-black text-base text-gray-900 dark:text-white">
                    Confirm Deletion
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {deleteTarget.type === 'pdf'
                      ? 'Delete PDF Document'
                      : deleteTarget.type === 'discussion'
                      ? 'Remove Discussion Topic'
                      : 'Delete Reply'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
                Are you sure you want to permanently delete <strong className="text-gray-900 dark:text-white">"{deleteTarget.title}"</strong>? This item will be removed from your store and database.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isDeleting ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
