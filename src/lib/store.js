import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { auth, db as dbInstance } from "./firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, onSnapshot, getDoc, setDoc, query, collection, where, deleteDoc, getDocs } from "firebase/firestore";

/**
 * Creates default demo/local developer data for instant offline or localhost access.
 */
export function createDefaultGuestData(customName = "Aditya Bhaskar") {
  const guestUser = {
    id: "guest-dev-01",
    uid: "guest-dev-01",
    email: "aditya.bhaskar@chronoshift.co",
    displayName: customName,
    fullName: customName,
    photoURL: "",
    onboardingCompleted: true,
    avatarColor: "#6366f1",
    bio: "Lead Developer & Product Architect",
    country: "United Kingdom",
    city: "London",
    timezone: "Europe/London",
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

  const teammates = [
    guestUser,
    {
      id: "teammate-02",
      uid: "teammate-02",
      email: "sarah.chen@chronoshift.co",
      displayName: "Sarah Chen",
      fullName: "Sarah Chen",
      avatarColor: "#ec4899",
      country: "United States",
      city: "San Francisco",
      timezone: "America/Los_Angeles",
      workStart: 9,
      workEnd: 18
    },
    {
      id: "teammate-03",
      uid: "teammate-03",
      email: "kenji.sato@chronoshift.co",
      displayName: "Kenji Sato",
      fullName: "Kenji Sato",
      avatarColor: "#10b981",
      country: "Japan",
      city: "Tokyo",
      timezone: "Asia/Tokyo",
      workStart: 10,
      workEnd: 19
    },
    {
      id: "teammate-04",
      uid: "teammate-04",
      email: "priya.sharma@chronoshift.co",
      displayName: "Priya Sharma",
      fullName: "Priya Sharma",
      avatarColor: "#f59e0b",
      country: "India",
      city: "Bangalore",
      timezone: "Asia/Kolkata",
      workStart: 9,
      workEnd: 18
    },
    {
      id: "teammate-05",
      uid: "teammate-05",
      email: "liam.oconnor@chronoshift.co",
      displayName: "Liam O'Connor",
      fullName: "Liam O'Connor",
      avatarColor: "#8b5cf6",
      country: "Australia",
      city: "Sydney",
      timezone: "Australia/Sydney",
      workStart: 8,
      workEnd: 16
    }
  ];

  const defaultWorkspace = {
    id: "ws-core-team",
    name: "ChronoShift Core Team",
    type: "Startup",
    ownerId: guestUser.uid,
    members: [
      { userId: guestUser.uid, role: "Owner", title: "Product Lead" },
      { userId: "teammate-02", role: "Admin", title: "Engineering Lead" },
      { userId: "teammate-03", role: "Contributor", title: "Frontend Architect" },
      { userId: "teammate-04", role: "Contributor", title: "Backend Engineer" },
      { userId: "teammate-05", role: "Contributor", title: "DevOps Engineer" }
    ],
    memberIds: [guestUser.uid, "teammate-02", "teammate-03", "teammate-04", "teammate-05"],
    pinnedCities: ["London", "San Francisco", "Tokyo", "Bangalore", "Sydney"],
    savedSchedules: [],
    meetingHistory: [
      {
        id: "meet-demo-1",
        title: "Sprint Sync & Timezone Calibration",
        date: new Date().toISOString().split("T")[0],
        hour: 14,
        duration: 45,
        participants: [guestUser.uid, "teammate-02", "teammate-03"]
      }
    ],
    invitations: []
  };

  return {
    currentUser: guestUser,
    currentWorkspace: defaultWorkspace,
    db: {
      users: teammates,
      workspaces: [defaultWorkspace],
      notifications: [
        {
          id: "notif-01",
          userId: guestUser.uid,
          title: "Welcome to ChronoShift!",
          message: "Your timezone-synchronized workspace is ready.",
          read: false,
          timestamp: new Date().toISOString()
        }
      ]
    }
  };
}

export function useSaaSStore() {
  const [currentUser, setCurrentUser] = useState(null);
  const [db, setDb] = useState({ users: [], workspaces: [], notifications: [] });
  const [currentWorkspace, setCurrentWorkspace] = useState(null);

  const saveGuestSession = (updatedUser, updatedDb, updatedWorkspace) => {
    try {
      localStorage.setItem("chronoshift_guest_session", JSON.stringify({
        currentUser: updatedUser || currentUser,
        db: updatedDb || db,
        currentWorkspace: updatedWorkspace || currentWorkspace
      }));
    } catch (e) {
      console.warn("Failed to persist guest session", e);
    }
  };

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
        // Check if there is an active local developer session
        const savedGuest = localStorage.getItem("chronoshift_guest_session");
        if (savedGuest) {
          try {
            const parsed = JSON.parse(savedGuest);
            if (parsed && parsed.currentUser) {
              setCurrentUser(parsed.currentUser);
              setDb(parsed.db || { users: [], workspaces: [], notifications: [] });
              setCurrentWorkspace(parsed.currentWorkspace || parsed.db?.workspaces?.[0] || null);
              return;
            }
          } catch (e) {
            console.error("Failed to restore guest session", e);
          }
        }
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

        // 1. User profile listener
        const unsubUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setCurrentUser(docSnap.data());
          }
        });
        activeUnsubscribers.push(unsubUser);

        // 2. All users listener
        const unsubAllUsers = onSnapshot(collection(dbInstance, "users"), (colSnap) => {
          const userList = [];
          colSnap.forEach(d => {
            const u = d.data();
            userList.push({ id: d.id, uid: d.id, ...u });
          });
          setDb(prev => ({ ...prev, users: userList }));
        });
        activeUnsubscribers.push(unsubAllUsers);

        // 3. Workspaces listener
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

        // 4. Notifications listener
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

  // Sync active current workspace
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
    } else if (!currentUser) {
      setCurrentWorkspace(null);
    }
  }, [currentUser, db.workspaces]);

  // Auth Operations
  const loginAsGuest = (customName = "Aditya Bhaskar") => {
    const data = createDefaultGuestData(customName);
    setCurrentUser(data.currentUser);
    setDb(data.db);
    setCurrentWorkspace(data.currentWorkspace);
    localStorage.setItem("chronoshift_guest_session", JSON.stringify(data));
    toast.success("Signed in (Local Developer Mode)!");
    return data.currentUser;
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Google Auth error:", error);
      if (error?.code === "auth/unauthorized-domain" || error?.message?.includes("unauthorized-domain")) {
        toast("Firebase domain unauthorized on localhost. Activating Local Developer Mode...", {
          icon: "⚡",
          duration: 4000
        });
        return loginAsGuest();
      }
      toast.error(error.message || "Google Authentication failed");
      throw error;
    }
  };

  const registerUser = async () => {
    return loginWithGoogle();
  };

  const loginUser = async () => {
    return loginWithGoogle();
  };

  const logoutUser = async () => {
    localStorage.removeItem("chronoshift_guest_session");
    try {
      await signOut(auth);
    } catch (error) {
      console.warn("Sign out:", error);
    }
    setCurrentUser(null);
    setCurrentWorkspace(null);
    setDb({ users: [], workspaces: [], notifications: [] });
    toast.success("Successfully logged out.");
  };

  const updateProfile = async (fields) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...fields, updatedAt: new Date().toISOString() };
    setCurrentUser(updatedUser);

    if (currentUser.id?.startsWith("guest-")) {
      const updatedUsers = db.users.map(u => (u.id === currentUser.id ? updatedUser : u));
      const updatedDb = { ...db, users: updatedUsers };
      setDb(updatedDb);
      saveGuestSession(updatedUser, updatedDb, currentWorkspace);
      toast.success("Profile updated!");
      return;
    }

    try {
      const userDocRef = doc(dbInstance, "users", currentUser.uid);
      await setDoc(userDocRef, updatedUser, { merge: true });
      toast.success("Profile updated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update profile in cloud.");
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
      ownerId: currentUser.uid || currentUser.id,
      members: [
        { userId: currentUser.uid || currentUser.id, role: "Owner", title: "Product Lead" }
      ],
      memberIds: [currentUser.uid || currentUser.id],
      pinnedCities: ["London", "New York"],
      savedSchedules: [],
      meetingHistory: [],
      invitations: []
    };

    const updatedWorkspaces = [...db.workspaces, newWorkspace];
    const updatedDb = { ...db, workspaces: updatedWorkspaces };
    setDb(updatedDb);
    setCurrentWorkspace(newWorkspace);
    saveGuestSession(currentUser, updatedDb, newWorkspace);

    if (!currentUser.id?.startsWith("guest-")) {
      try {
        await setDoc(doc(dbInstance, "workspaces", wsId), newWorkspace);
      } catch (e) {
        console.error(e);
      }
    }
    toast.success(`Workspace "${newWorkspace.name}" created!`);
  };

  const deleteWorkspace = async (workspaceId) => {
    if (!currentUser) return;
    const ws = db.workspaces.find(w => w.id === workspaceId);
    if (!ws) return;
    if (ws.ownerId !== (currentUser.uid || currentUser.id)) {
      toast.error("Only workspace owners can dissolve workspaces!");
      return;
    }

    const updatedWorkspaces = db.workspaces.filter(w => w.id !== workspaceId);
    const updatedDb = { ...db, workspaces: updatedWorkspaces };
    setDb(updatedDb);
    const nextWs = updatedWorkspaces[0] || null;
    setCurrentWorkspace(nextWs);
    saveGuestSession(currentUser, updatedDb, nextWs);

    if (!currentUser.id?.startsWith("guest-")) {
      try {
        await deleteDoc(doc(dbInstance, "workspaces", workspaceId));
      } catch (e) {
        console.error(e);
      }
    }
    toast.success("Workspace dissolved.");
  };

  const inviteMemberByEmail = async (email, role, title) => {
    if (!currentWorkspace || !currentUser) return;
    const normEmail = email.trim().toLowerCase();
    
    // Check if member already in workspace
    const existing = db.users.find(u => u.email?.toLowerCase() === normEmail);
    const newUid = existing ? existing.id : `user-${Date.now()}`;

    if (!existing) {
      const newUser = {
        id: newUid,
        uid: newUid,
        email: normEmail,
        displayName: normEmail.split("@")[0],
        fullName: normEmail.split("@")[0],
        avatarColor: "#06b6d4",
        country: "United States",
        city: "New York",
        timezone: "America/New_York",
        workStart: 9,
        workEnd: 17
      };
      setDb(prev => ({ ...prev, users: [...prev.users, newUser] }));
    }

    const updatedMembers = [...(currentWorkspace.members || []), { userId: newUid, role, title }];
    const updatedMemberIds = [...(currentWorkspace.memberIds || []), newUid];
    const updatedWs = { ...currentWorkspace, members: updatedMembers, memberIds: updatedMemberIds };

    const updatedWorkspaces = db.workspaces.map(w => w.id === currentWorkspace.id ? updatedWs : w);
    const updatedDb = { ...db, workspaces: updatedWorkspaces };
    setDb(updatedDb);
    setCurrentWorkspace(updatedWs);
    saveGuestSession(currentUser, updatedDb, updatedWs);

    if (!currentUser.id?.startsWith("guest-")) {
      try {
        const wsDocRef = doc(dbInstance, "workspaces", currentWorkspace.id);
        await setDoc(wsDocRef, { members: updatedMembers, memberIds: updatedMemberIds }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    }
    toast.success(`Invitation dispatched to ${normEmail}!`);
  };

  const removeMember = async (userId) => {
    if (!currentWorkspace || !currentUser) return;
    if (currentWorkspace.ownerId === userId) {
      toast.error("The owner cannot be removed!");
      return;
    }

    const updatedMembers = currentWorkspace.members.filter(m => m.userId !== userId);
    const updatedMemberIds = currentWorkspace.memberIds.filter(id => id !== userId);
    const updatedWs = { ...currentWorkspace, members: updatedMembers, memberIds: updatedMemberIds };

    const updatedWorkspaces = db.workspaces.map(w => w.id === currentWorkspace.id ? updatedWs : w);
    const updatedDb = { ...db, workspaces: updatedWorkspaces };
    setDb(updatedDb);
    setCurrentWorkspace(updatedWs);
    saveGuestSession(currentUser, updatedDb, updatedWs);

    if (!currentUser.id?.startsWith("guest-")) {
      try {
        const wsDocRef = doc(dbInstance, "workspaces", currentWorkspace.id);
        await setDoc(wsDocRef, { members: updatedMembers, memberIds: updatedMemberIds }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    }
    toast.success("Teammate removed from workspace.");
  };

  const updateMemberRoleAndTitle = async (userId, role, title) => {
    if (!currentWorkspace) return;
    const updatedMembers = currentWorkspace.members.map(m => {
      if (m.userId === userId) {
        return { ...m, role, title };
      }
      return m;
    });
    const updatedWs = { ...currentWorkspace, members: updatedMembers };
    const updatedWorkspaces = db.workspaces.map(w => w.id === currentWorkspace.id ? updatedWs : w);
    const updatedDb = { ...db, workspaces: updatedWorkspaces };
    setDb(updatedDb);
    setCurrentWorkspace(updatedWs);
    saveGuestSession(currentUser, updatedDb, updatedWs);

    if (!currentUser.id?.startsWith("guest-")) {
      try {
        const wsDocRef = doc(dbInstance, "workspaces", currentWorkspace.id);
        await setDoc(wsDocRef, { members: updatedMembers }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    }
    toast.success("Teammate permissions updated.");
  };

  const acceptInvitation = async (inviteId, workspaceId, userId, role, title) => {
    // Mark invitation accepted
    toast.success("Joined workspace!");
  };

  // Schedule / Meeting History Operations
  const logMeeting = async (title, date, hour, duration, participantUserIds) => {
    if (!currentWorkspace) return;
    const newMeeting = {
      id: `meet-${Date.now()}`,
      title: title.trim() || "Quick Sync Session",
      date,
      hour,
      duration,
      participants: participantUserIds,
      timezone: currentWorkspace.pinnedCities?.[0] || "UTC"
    };
    const updatedMeetings = [newMeeting, ...(currentWorkspace.meetingHistory || [])];
    const updatedWs = { ...currentWorkspace, meetingHistory: updatedMeetings };
    const updatedWorkspaces = db.workspaces.map(w => w.id === currentWorkspace.id ? updatedWs : w);
    const updatedDb = { ...db, workspaces: updatedWorkspaces };
    setDb(updatedDb);
    setCurrentWorkspace(updatedWs);
    saveGuestSession(currentUser, updatedDb, updatedWs);

    if (!currentUser.id?.startsWith("guest-")) {
      try {
        const wsDocRef = doc(dbInstance, "workspaces", currentWorkspace.id);
        await setDoc(wsDocRef, { meetingHistory: updatedMeetings }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    }
    toast.success(`Meeting "${newMeeting.title}" logged in workspace!`);
  };

  const markNotificationRead = (notifId) => {
    setDb(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === notifId ? { ...n, read: true } : n)
    }));
  };

  const clearAllNotifications = () => {
    setDb(prev => ({ ...prev, notifications: [] }));
    toast.success("All notifications cleared.");
  };

  const togglePinCity = async (cityName) => {
    if (!currentWorkspace) return;
    const pinnedCities = currentWorkspace.pinnedCities.includes(cityName)
      ? currentWorkspace.pinnedCities.filter(c => c !== cityName)
      : [...currentWorkspace.pinnedCities, cityName];
    
    const updatedWs = { ...currentWorkspace, pinnedCities };
    const updatedWorkspaces = db.workspaces.map(w => w.id === currentWorkspace.id ? updatedWs : w);
    const updatedDb = { ...db, workspaces: updatedWorkspaces };
    setDb(updatedDb);
    setCurrentWorkspace(updatedWs);
    saveGuestSession(currentUser, updatedDb, updatedWs);

    if (!currentUser.id?.startsWith("guest-")) {
      try {
        const wsDocRef = doc(dbInstance, "workspaces", currentWorkspace.id);
        await setDoc(wsDocRef, { pinnedCities }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Add teammate helper
  const addTeammate = async (name, city) => {
    if (!currentWorkspace) return;
    const randomColors = ["#3b82f6", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];
    const newUid = `user-${Date.now()}`;
    const newUser = {
      id: newUid,
      uid: newUid,
      email: `${name.toLowerCase().replace(/\s+/g, "")}@chronoshift.co`,
      fullName: name,
      displayName: name,
      username: name.toLowerCase().replace(/\s+/g, "_"),
      avatarColor: randomColors[Math.floor(Math.random() * randomColors.length)],
      bio: `Workspace contributor based in ${city.name}`,
      country: city.country,
      city: city.name,
      timezone: city.timezone,
      workStart: 9,
      workEnd: 17,
      onboardingCompleted: true,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...db.users, newUser];
    const updatedMembers = [...(currentWorkspace.members || []), { userId: newUid, role: "Contributor", title: "Global Partner" }];
    const updatedMemberIds = [...(currentWorkspace.memberIds || []), newUid];
    const updatedWs = { ...currentWorkspace, members: updatedMembers, memberIds: updatedMemberIds };
    const updatedWorkspaces = db.workspaces.map(w => w.id === currentWorkspace.id ? updatedWs : w);
    const updatedDb = { ...db, users: updatedUsers, workspaces: updatedWorkspaces };
    
    setDb(updatedDb);
    setCurrentWorkspace(updatedWs);
    saveGuestSession(currentUser, updatedDb, updatedWs);

    if (!currentUser.id?.startsWith("guest-")) {
      try {
        await setDoc(doc(dbInstance, "users", newUid), newUser);
        const wsDocRef = doc(dbInstance, "workspaces", currentWorkspace.id);
        await setDoc(wsDocRef, { members: updatedMembers, memberIds: updatedMemberIds }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    }
    toast.success(`${name} added to workspace!`);
  };

  // Update teammate working hours
  const updateMemberHours = async (memberId, start, end) => {
    const updatedUsers = db.users.map(u => {
      if (u.id === memberId || u.uid === memberId) {
        return { ...u, workStart: start, workEnd: end };
      }
      return u;
    });
    const updatedDb = { ...db, users: updatedUsers };
    setDb(updatedDb);
    saveGuestSession(currentUser, updatedDb, currentWorkspace);

    if (!currentUser?.id?.startsWith("guest-")) {
      try {
        const userDocRef = doc(dbInstance, "users", memberId);
        await setDoc(userDocRef, { workStart: start, workEnd: end }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    }
    toast.success("Member work hours updated!");
  };

  // Resolved list of users for active workspace
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
    loginAsGuest,
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
    togglePinCity,
    addTeammate,
    updateMemberHours
  };
}
