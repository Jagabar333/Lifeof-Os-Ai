"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { User, Settings2, Bell, Shield, Moon, Sun, Monitor, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  id: string;
  email: string;
  name: string;
}

export default function SettingsPage() {
  const [profileName, setProfileName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const { data: user, isLoading } = useQuery<UserProfile>({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const res = await apiClient.get<any>("/api/auth/me");
      return res.data;
    }
  });

  useEffect(() => {
    if (user?.name) setProfileName(user.name);
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          Settings & Profile
        </h1>
        <p className="text-muted-foreground mt-0.5 text-lg">Manage your account and preferences.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-4 space-y-2">
          <Button variant="secondary" className="w-full justify-start font-semibold">
            <User className="mr-2 h-4 w-4" /> Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <Settings2 className="mr-2 h-4 w-4" /> Preferences
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <Bell className="mr-2 h-4 w-4" /> Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <Shield className="mr-2 h-4 w-4" /> Security
          </Button>
        </div>

        <div className="md:col-span-8 space-y-6">
          <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Full Name</label>
                    <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Email Address</label>
                    <Input defaultValue={user?.email} disabled className="bg-background/50 opacity-60" />
                  </div>
                  <Button
                    className="mt-4 shadow-md bg-primary"
                    disabled={isSaving}
                    onClick={async () => {
                      setIsSaving(true);
                      setSaveMsg(null);
                      try {
                        await apiClient.patch("/api/auth/me", { name: profileName });
                        setSaveMsg("Profile updated!");
                      } catch (err: any) {
                        setSaveMsg(err.message || "Failed to save");
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                  {saveMsg && <p className="text-sm text-muted-foreground mt-2">{saveMsg}</p>}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how LifeOS looks on your device.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-24 flex flex-col gap-2">
                  <Sun className="h-6 w-6" />
                  Light
                </Button>
                <Button variant="outline" className="flex-1 h-24 flex flex-col gap-2 border-primary bg-primary/5">
                  <Moon className="h-6 w-6 text-primary" />
                  Dark
                </Button>
                <Button variant="outline" className="flex-1 h-24 flex flex-col gap-2">
                  <Monitor className="h-6 w-6" />
                  System
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md ring-1 ring-rose-500/10 dark:ring-rose-500/20 bg-rose-500/5">
            <CardHeader>
              <CardTitle className="text-rose-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">Delete Account</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
