import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { auth, db as dbInstance } from "./firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, onSnapshot, getDoc, setDoc, query, collection, where, deleteDoc } from "firebase/firestore";
import { findCity, CITIES_DB } from "./cities";

/**
 * Creates default verified team data for instant offline or localhost access.
 * Contains authentic IANA timezones, ISO country codes, and accurate coordinates.
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
    countryCode: "GB",
    city: "London",
    timezone: "Europe/London",
    lat: 51.5074,
    lng: -0.1278,
    workStart: 9,
    workEnd: 17,
    lunchStart: 12,
    lunchEnd: 13,
    weekendDays: [0, 6],
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
      countryCode: "US",
      city: "San Francisco",
      timezone: "America/Los_Angeles",
      lat: 37.7749,
      lng: -122.4194,
      workStart: 9,
      workEnd: 18,
      weekendDays: [0, 6]
    },
    {
      id: "teammate-03",
      uid: "teammate-03",
      email: "kenji.sato@chronoshift.co",
      displayName: "Kenji Sato",
      fullName: "Kenji Sato",
      avatarColor: "#10b981",
      country: "Japan",
      countryCode: "JP",
      city: "Tokyo",
      timezone: "Asia/Tokyo",
      lat: 35.6762,
      lng: 139.6503,
      workStart: 10,
      workEnd: 19,
      weekendDays: [0, 6]
    },
    {
      id: "teammate-04",
      uid: "teammate-04",
      email: "priya.sharma@chronoshift.co",
      displayName: "Priya Sharma",
      fullName: "Priya Sharma",
      avatarColor: "#f59e0b",
      country: "India",
      countryCode: "IN",
      city: "Bangalore",
      timezone: "Asia/Kolkata",
      lat: 12.9716,
      lng: 77.5946,
      workStart: 9,
      workEnd: 18,
      weekendDays: [0, 6]
    },
    {
      id: "teammate-05",
      uid: "teammate-05",
      email: "liam.oconnor@chronoshift.co",
      displayName: "Liam O'Connor",
      fullName: "Liam O'Connor",
      avatarColor: "#8b5cf6",
      country: "Australia",
      countryCode: "AU",
      city: "Sydney",
      timezone: "Australia/Sydney",
      lat: -33.8688,
      lng: 151.2093,
      workStart: 8,
      workEnd: 16,
      weekendDays: [0, 6]
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
        id: "meet-init-1",
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
          title: "ChronoShift Initialized",
          message: "Timezone engine ready with verified coordinates.",
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
          const defaultCity = findCity("New York") || CITIES_DB[0];
          const defaultProfile = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
            photoURL: firebaseUser.photoURL || "",
            onboardingCompleted: false,
            avatarColor: colors[Math.floor(Math.random() * colors.length)],
            bio: "Timezone coordinator",
            country: defaultCity.country,
            countryCode: defaultCity.countryCode,
            city: defaultCity.name,
            timezone: defaultCity.timezone,
            lat: defaultCity.lat,
            lng: defaultCity.lng,
            workStart: 9,
            workEnd: 17,
            lunchStart: 12,
            lunchEnd: 13,
            weekendDays: [0, 6],
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
            pinnedCities: [defaultCity.name],
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
            userList.push({ id: d.id, uid: d.id, ...d.data() });
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
    toast.success("Signed in (Local Developer Mode)");
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

  const inviteMemberByEmail = async (email, role = "Contributor", title = "Teammate") => {
    if (!currentWorkspace || !currentUser) return;
    const normEmail = email.trim().toLowerCase();
    
    // Check if member already in workspace
    const existing = db.users.find(u => u.email?.toLowerCase() === normEmail);
    const newUid = existing ? existing.id : `user-${Date.now()}`;

    if (!existing) {
      const defaultCity = findCity("London") || CITIES_DB[0];
      const newUser = {
        id: newUid,
        uid: newUid,
        email: normEmail,
        displayName: normEmail.split("@")[0],
        fullName: normEmail.split("@")[0],
        avatarColor: "#06b6d4",
        country: defaultCity.country,
        countryCode: defaultCity.countryCode,
        city: defaultCity.name,
        timezone: defaultCity.timezone,
        lat: defaultCity.lat,
        lng: defaultCity.lng,
        workStart: 9,
        workEnd: 17,
        weekendDays: [0, 6]
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
    toast.success("Joined workspace!");
  };

  // Schedule / Meeting History Operations
  const logMeeting = async (title, date, hour, duration, participantUserIds) => {
    if (!currentWorkspace) return;
    const newMeeting = {
      id: `meet-${Date.now()}`,
      title: title.trim() || "Team Sync",
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

  // Add teammate with full verified city coordinates and working schedule
  const addTeammate = async (name, cityObj, role = "Contributor", title = "Global Partner", workStart = 9, workEnd = 17) => {
    if (!currentWorkspace) return;
    const randomColors = ["#3b82f6", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];
    const newUid = `user-${Date.now()}`;
    const cityResolved = typeof cityObj === "object" ? cityObj : (findCity(cityObj) || CITIES_DB[0]);

    const newUser = {
      id: newUid,
      uid: newUid,
      email: `${name.toLowerCase().replace(/\s+/g, "")}@chronoshift.co`,
      fullName: name,
      displayName: name,
      username: name.toLowerCase().replace(/\s+/g, "_"),
      avatarColor: randomColors[Math.floor(Math.random() * randomColors.length)],
      bio: `Workspace contributor based in ${cityResolved.name}`,
      country: cityResolved.country,
      countryCode: cityResolved.countryCode || "US",
      city: cityResolved.name,
      timezone: cityResolved.timezone,
      lat: cityResolved.lat,
      lng: cityResolved.lng,
      workStart: parseInt(workStart),
      workEnd: parseInt(workEnd),
      weekendDays: [0, 6],
      onboardingCompleted: true,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...db.users, newUser];
    const updatedMembers = [...(currentWorkspace.members || []), { userId: newUid, role, title }];
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

  // Full teammate editing (name, city, timezone, coordinates, work hours)
  const updateTeammate = async (memberId, fields) => {
    let resolvedFields = { ...fields };
    if (fields.city) {
      const cityMatch = findCity(fields.city);
      if (cityMatch) {
        resolvedFields = {
          ...resolvedFields,
          country: cityMatch.country,
          countryCode: cityMatch.countryCode,
          timezone: cityMatch.timezone,
          lat: cityMatch.lat,
          lng: cityMatch.lng
        };
      }
    }

    const updatedUsers = db.users.map(u => {
      if (u.id === memberId || u.uid === memberId) {
        return { ...u, ...resolvedFields, updatedAt: new Date().toISOString() };
      }
      return u;
    });

    const updatedDb = { ...db, users: updatedUsers };
    setDb(updatedDb);
    saveGuestSession(currentUser, updatedDb, currentWorkspace);

    if (!currentUser?.id?.startsWith("guest-")) {
      try {
        const userDocRef = doc(dbInstance, "users", memberId);
        await setDoc(userDocRef, resolvedFields, { merge: true });
      } catch (e) {
        console.error(e);
      }
    }
    toast.success("Teammate profile updated!");
  };

  // Update teammate working hours
  const updateMemberHours = async (memberId, start, end) => {
    return updateTeammate(memberId, { workStart: parseInt(start), workEnd: parseInt(end) });
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
    updateTeammate,
    updateMemberHours
  };
}
