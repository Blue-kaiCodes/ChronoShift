import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { auth, db as dbInstance } from "./firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, onSnapshot, getDoc, setDoc, query, collection, where, deleteDoc, getDocs } from "firebase/firestore";

// Helper to save DB to local storage if needed as a fallback/cache
export function saveDB() {
  // Deprecated in favor of real Firestore, kept for compatibility
}

export function getStoredDB() {
  return { users: [], workspaces: [], notifications: [] };
}

// Global hook to access state easily and trigger reactivity across pages
export function useSaaSStore() {
  const [currentUser, setCurrentUser] = useState(null);
  const [db, setDb] = useState({ users: [], workspaces: [], notifications: [] });
  const [currentWorkspace, setCurrentWorkspace] = useState(null);

  // Bind real-time Firebase Auth state and Firestore collections
  useEffect(() => {
    let activeUnsubscribers = [];

    const cleanupActiveListeners = () => {
      activeUnsubscribers.forEach(unsub => {
        if (typeof unsub === "function") unsub();
      });
      activeUnsubscribers = [];
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      cleanupActiveListeners();

      if (!firebaseUser) {
        setCurrentUser(null);
        setDb({ users: [], workspaces: [], notifications: [] });
        setCurrentWorkspace(null);
        return;
      }

      try {
        const userDocRef = doc(dbInstance, "users", firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
          const colors = ["#3b82f6", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];
          const defaultProfile = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
            photoURL: firebaseUser.photoURL || "",
            onboardingCompleted: false,
            avatarColor: colors[Math.floor(Math.random() * colors.length)],
            bio: "Timezone explorer",
            country: "United States",
            city: "New York",
            timezone: "America/New_York",
            workStart: 9,
            workEnd: 17,
            lunchStart: 12,
            lunchEnd: 13,
            weekendDays: [6, 0],
            preferredMeetingLength: 30,
            preferredLanguage: "English",
            calendarProvider: "Google Calendar",
            clockFormat: "12h",
            allowCalendarSync: true,
            allowEmailNotifications: true,
            allowTeamInvites: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await setDoc(userDocRef, defaultProfile);

          // Auto-instantiate their first default team workspace
          const wsId = `workspace-${Date.now()}`;
          const defaultWorkspace = {
            id: wsId,
            name: `${defaultProfile.displayName}'s Team`,
            type: "Personal",
            ownerId: firebaseUser.uid,
            members: [
              { userId: firebaseUser.uid, role: "Owner", title: "Product Lead" }
            ],
            memberIds: [firebaseUser.uid],
            pinnedCities: ["London", "New York", "Tokyo"],
            savedSchedules: [],
            meetingHistory: [],
            invitations: []
          };
          await setDoc(doc(dbInstance, "workspaces", wsId), defaultWorkspace);
        }

        // 1. Subscribe to the logged-in user profile document
        const unsubUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setCurrentUser(docSnap.data());
          }
        });
        activeUnsubscribers.push(unsubUser);

        // 2. Subscribe to ALL users (to resolve team member profiles dynamically)
        const unsubAllUsers = onSnapshot(collection(dbInstance, "users"), (colSnap) => {
          const userList = [];
          colSnap.forEach(d => {
            const u = d.data();
            userList.push({ id: d.id, uid: d.id, ...u });
          });
          setDb(prev => ({ ...prev, users: userList }));
        });
        activeUnsubscribers.push(unsubAllUsers);

        // 3. Subscribe to Workspaces where the user is listed in memberIds
        const qWorkspaces = query(
          collection(dbInstance, "workspaces"),
          where("memberIds", "array-contains", firebaseUser.uid)
        );
        const unsubWorkspaces = onSnapshot(qWorkspaces, (colSnap) => {
          const workspaceList = [];
          colSnap.forEach(d => {
            workspaceList.push({ id: d.id, ...d.data() });
          });
          setDb(prev => ({ ...prev, workspaces: workspaceList }));
        });
        activeUnsubscribers.push(unsubWorkspaces);

        // 4. Subscribe to Notifications assigned to this user
        const qNotifications = query(
          collection(dbInstance, "notifications"),
          where("userId", "==", firebaseUser.uid)
        );
        const unsubNotifications = onSnapshot(qNotifications, (colSnap) => {
          const notificationList = [];
          colSnap.forEach(d => {
            notificationList.push({ id: d.id, ...d.data() });
          });
          setDb(prev => ({ ...prev, notifications: notificationList }));
        });
        activeUnsubscribers.push(unsubNotifications);

      } catch (err) {
        console.error("Firestore initialization error:", err);
      }
    });

    return () => {
      unsubscribeAuth();
      cleanupActiveListeners();
    };
  }, []);

  // Sync active current workspace reactive state
  useEffect(() => {
    if (currentUser && db.workspaces.length > 0) {
      if (!currentWorkspace || !db.workspaces.find(w => w.id === currentWorkspace.id)) {
        setCurrentWorkspace(db.workspaces[0]);
      } else {
        const updated = db.workspaces.find(w => w.id === currentWorkspace.id);
        if (updated) {
          setCurrentWorkspace(updated);
        }
      }
    } else {
      setCurrentWorkspace(null);
    }
  }, [currentUser, db.workspaces]);

  // Auth Operations
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Google Authentication failed");
      throw error;
    }
  };

  const registerUser = async () => {
    // Deprecated for direct Google Auth Flow
    return loginWithGoogle();
  };

  const loginUser = async () => {
    // Deprecated for direct Google Auth Flow
    return loginWithGoogle();
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
      setCurrentWorkspace(null);
      toast.success("Successfully logged out.");
    } catch (error) {
      toast.error("Failed to log out.");
    }
  };

  const updateProfile = async (fields) => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(dbInstance, "users", currentUser.uid);
      await setDoc(userDocRef, { ...currentUser, ...fields, updatedAt: new Date().toISOString() }, { merge: true });
      toast.success("Profile updated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update profile.");
    }
  };

  // Workspace Operations
  const createWorkspace = async (name, type) => {
    if (!currentUser) return;
    const wsId = `workspace-${Date.now()}`;
    const newWorkspace = {
      id: wsId,
      name: name.trim() || "New Workspace",
      type,
      ownerId: currentUser.uid,
      members: [
        { userId: currentUser.uid, role: "Owner", title: "Product Lead" }
      ],
      memberIds: [currentUser.uid],
      pinnedCities: ["London", "New York"],
      savedSchedules: [],
      meetingHistory: [],
      invitations: []
    };
    try {
      await setDoc(doc(dbInstance, "workspaces", wsId), newWorkspace);
      setCurrentWorkspace(newWorkspace);
      toast.success(`Workspace "${newWorkspace.name}" created!`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to create workspace.");
    }
  };

  const deleteWorkspace = async (workspaceId) => {
    if (!currentUser) return;
    const ws = db.workspaces.find(w => w.id === workspaceId);
    if (!ws) return;
    if (ws.ownerId !== currentUser.uid) {
      toast.error("Only workspace owners can dissolve workspaces!");
      return;
    }
    try {
      await deleteDoc(doc(dbInstance, "workspaces", workspaceId));
      toast.success("Workspace dissolved.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to dissolve workspace.");
    }
  };

  // Teammate & Member Operations
  const inviteMemberByEmail = async (email, role, title = "Teammate") => {
    if (!currentWorkspace || !currentUser) return;
    const normEmail = email.toLowerCase().trim();

    // Check if already member
    const existingUser = db.users.find(u => u.email.toLowerCase() === normEmail);
    if (existingUser && currentWorkspace.members.some(m => m.userId === existingUser.id)) {
      toast.error("This user is already a member of this workspace!");
      return;
    }

    // Check if already invited
    if (currentWorkspace.invitations?.some(i => i.email.toLowerCase() === normEmail && i.status === "Pending")) {
      toast.error("An invitation is already pending for this email!");
      return;
    }

    const newInvite = {
      id: `inv-${Date.now()}`,
      email: normEmail,
      role,
      title,
      status: "Pending",
      timestamp: new Date().toISOString()
    };

    try {
      const wsDocRef = doc(dbInstance, "workspaces", currentWorkspace.id);
      const updatedInvitations = [...(currentWorkspace.invitations || []), newInvite];
      await setDoc(wsDocRef, { invitations: updatedInvitations }, { merge: true });

      if (existingUser) {
        const notifId = `notif-${Date.now()}`;
        const notif = {
          id: notifId,
          userId: existingUser.uid,
          title: `Invited to ${currentWorkspace.name}`,
          message: `${currentUser.displayName} has invited you to join their team workspace.`,
          read: false,
          inviteId: newInvite.id,
          workspaceId: currentWorkspace.id,
          role,
          titleName: title,
          timestamp: new Date().toISOString()
        };
        await setDoc(doc(dbInstance, "notifications", notifId), notif);
      }

      toast.success(`Invitation dispatched to ${normEmail}!`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to dispatch invitation.");
    }
  };

  const removeMember = async (userId) => {
    if (!currentWorkspace || !currentUser) return;
    if (currentWorkspace.ownerId === userId) {
      toast.error("The owner cannot be removed! Transfer ownership first.");
      return;
    }

    const updatedMembers = currentWorkspace.members.filter(m => m.userId !== userId);
    const updatedMemberIds = currentWorkspace.memberIds.filter(id => id !== userId);

    try {
      const wsDocRef = doc(dbInstance, "workspaces", currentWorkspace.id);
      await setDoc(wsDocRef, { members: updatedMembers, memberIds: updatedMemberIds }, { merge: true });
      toast.success("Teammate removed from workspace.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove teammate.");
    }
  };

  const updateMemberRoleAndTitle = async (userId, role, title) => {
    if (!currentWorkspace) return;
    const updatedMembers = currentWorkspace.members.map(m => {
      if (m.userId === userId) {
        return { ...m, role, title };
      }
      return m;
    });
    try {
      const wsDocRef = doc(dbInstance, "workspaces", currentWorkspace.id);
      await setDoc(wsDocRef, { members: updatedMembers }, { merge: true });
      toast.success("Teammate permissions updated.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update permissions.");
    }
  };

  const acceptInvitation = async (inviteId, workspaceId, userId, role, title) => {
    try {
      const wsDocRef = doc(dbInstance, "workspaces", workspaceId);
      const wsSnap = await getDoc(wsDocRef);
      if (wsSnap.exists()) {
        const wsData = wsSnap.data();
        const updatedInvitations = (wsData.invitations || []).map(inv => {
          if (inv.id === inviteId) return { ...inv, status: "Accepted" };
          return inv;
        });
        const updatedMembers = [...(wsData.members || []), { userId, role, title }];
        const updatedMemberIds = [...(wsData.memberIds || []), userId];

        await setDoc(wsDocRef, {
          invitations: updatedInvitations,
          members: updatedMembers,
          memberIds: updatedMemberIds
        }, { merge: true });
      }

      // Mark notification as read and accepted
      const qNotif = query(collection(dbInstance, "notifications"), where("inviteId", "==", inviteId));
      const colSnap = await getDocs(qNotif);
      colSnap.forEach(async (d) => {
        await setDoc(doc(dbInstance, "notifications", d.id), { read: true, accepted: true }, { merge: true });
      });

      toast.success("Joined workspace!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to join workspace.");
    }
  };

  // Schedule/Meeting History Operations
  const logMeeting = async (title, date, hour, duration, participantUserIds) => {
    if (!currentWorkspace) return;
    const newMeeting = {
      id: `meet-${Date.now()}`,
      title: title.trim() || "Quick Sync Session",
      date,
      hour,
      duration,
      participants: participantUserIds
    };
    const updatedMeetings = [newMeeting, ...(currentWorkspace.meetingHistory || [])];
    try {
      const wsDocRef = doc(dbInstance, "workspaces", currentWorkspace.id);
      await setDoc(wsDocRef, { meetingHistory: updatedMeetings }, { merge: true });
      toast.success("Meeting schedule captured!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to log meeting.");
    }
  };

  // Notification Operations
  const markNotificationRead = async (notifId) => {
    try {
      await setDoc(doc(dbInstance, "notifications", notifId), { read: true }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  const clearAllNotifications = async () => {
    if (!currentUser) return;
    try {
      const q = query(collection(dbInstance, "notifications"), where("userId", "==", currentUser.uid));
      const colSnap = await getDocs(q);
      colSnap.forEach(async (d) => {
        await deleteDoc(doc(dbInstance, "notifications", d.id));
      });
      toast.success("All notifications cleared.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to clear notifications.");
    }
  };

  // Custom city pinning per workspace
  const togglePinCity = async (cityName) => {
    if (!currentWorkspace) return;
    const alreadyPinned = currentWorkspace.pinnedCities.includes(cityName);
    const pinnedCities = alreadyPinned
      ? currentWorkspace.pinnedCities.filter(c => c !== cityName)
      : [...currentWorkspace.pinnedCities, cityName];
    try {
      const wsDocRef = doc(dbInstance, "workspaces", currentWorkspace.id);
      await setDoc(wsDocRef, { pinnedCities }, { merge: true });
    } catch (e) {
      console.error(e);
      toast.error("Failed to update pinned cities.");
    }
  };

  // Resolved lists of users for the active workspace
  const workspaceUsers = useMemo(() => {
    if (!currentWorkspace) return [];
    return (currentWorkspace.members || []).map(m => {
      const userObj = db.users.find(u => u.uid === m.userId || u.id === m.userId);
      return userObj ? { ...userObj, workspaceRole: m.role, workspaceTitle: m.title } : null;
    }).filter(Boolean);
  }, [currentWorkspace, db.users]);

  return {
    db,
    currentUser,
    currentWorkspace,
    workspaceUsers,
    setCurrentWorkspace,
    loginWithGoogle,
    registerUser,
    loginUser,
    logoutUser,
    updateProfile,
    createWorkspace,
    deleteWorkspace,
    inviteMemberByEmail,
    removeMember,
    updateMemberRoleAndTitle,
    acceptInvitation,
    logMeeting,
    markNotificationRead,
    clearAllNotifications,
    togglePinCity
  };
}
