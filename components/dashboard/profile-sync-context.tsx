"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface ProfileSyncValue {
  fullName: string;
  avatarUrl: string;
  setProfile: (data: { fullName?: string; avatarUrl?: string }) => void;
}

const ProfileSyncContext = createContext<ProfileSyncValue | null>(null);

export function ProfileSyncProvider({
  initialFullName,
  initialAvatarUrl,
  children,
}: {
  initialFullName: string;
  initialAvatarUrl: string;
  children: ReactNode;
}) {
  const [fullName, setFullName] = useState(initialFullName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  function setProfile(data: { fullName?: string; avatarUrl?: string }) {
    if (data.fullName !== undefined) setFullName(data.fullName);
    if (data.avatarUrl !== undefined) setAvatarUrl(data.avatarUrl);
  }

  return (
    <ProfileSyncContext.Provider value={{ fullName, avatarUrl, setProfile }}>
      {children}
    </ProfileSyncContext.Provider>
  );
}

export function useProfileSync() {
  const ctx = useContext(ProfileSyncContext);
  if (!ctx) {
    throw new Error("useProfileSync must be used within ProfileSyncProvider");
  }
  return ctx;
}
