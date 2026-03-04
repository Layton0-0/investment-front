import { useState, useEffect } from "react";
import { useAccountType } from "@/hooks/useAccountType";
import { Settings } from "@/components/System";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SETTINGS_PROFILE_STORAGE_KEY = "settingsProfileMode";

export type SettingsProfileMode = "beginner" | "intermediate" | "advanced";

function loadProfileMode(): SettingsProfileMode {
  if (typeof window === "undefined") return "beginner";
  const raw = window.localStorage.getItem(SETTINGS_PROFILE_STORAGE_KEY);
  if (raw === "intermediate" || raw === "advanced") return raw;
  return "beginner";
}

function saveProfileMode(mode: SettingsProfileMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_PROFILE_STORAGE_KEY, mode);
}

export default function SettingsPage() {
  const { serverTypeNumeric } = useAccountType();
  const [profileMode, setProfileModeState] = useState<SettingsProfileMode>(loadProfileMode);

  useEffect(() => {
    saveProfileMode(profileMode);
  }, [profileMode]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#191f28]">설정</h1>
        <p className="text-sm text-[#8b95a1] mt-1">
          계좌·API·거래 설정·자동투자 ON/OFF
        </p>
      </div>

      <Tabs
        value={profileMode}
        onValueChange={(v) => setProfileModeState(v as SettingsProfileMode)}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="beginner">초보자</TabsTrigger>
          <TabsTrigger value="intermediate">중급자</TabsTrigger>
          <TabsTrigger value="advanced">고급</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <Settings serverType={serverTypeNumeric} settingsProfileMode={profileMode} />
        </div>
      </Tabs>
    </div>
  );
}
