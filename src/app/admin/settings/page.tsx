"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Save, User, CreditCard, Eye, EyeOff, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUpload from "@/components/ImageUpload";
import { useGlobalSettings, useUpdateAdminSettings, useUpdateAdminProfile } from "@/hooks/useApi";
import { PasswordInput } from "@/components/ui/password-input";

export default function AdminSettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { data: settingsData, isLoading: settingsLoading } = useGlobalSettings();
  const updateSettingsMutation = useUpdateAdminSettings();
  const updateProfileMutation = useUpdateAdminProfile();
  const [localSettings, setLocalSettings] = useState<any>(null);
  const [adminProfile, setAdminProfile] = useState({ name: "", email: "", image: "", password: "" });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    } else if (session?.user?.role !== "admin") {
      router.push("/");
    } else if (session?.user) {
      setAdminProfile({
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || ""
      });
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (settingsData?.settings) {
      setLocalSettings(settingsData.settings);
    }
  }, [settingsData]);

  const handleSave = (category: string, updatedSettings: any) => {
    updateSettingsMutation.mutate({ category, settings: updatedSettings });
  };

  const handleSaveAdminProfile = () => {
    updateProfileMutation.mutate(adminProfile, {
      onSuccess: () => {
        setAdminProfile(prev => ({ ...prev, password: "" }));
      }
    });
  };

  const toggleShowSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (isPending || settingsLoading) {
    return <div className="container mx-auto px-4 py-8"><Skeleton className="h-8 w-64 mb-8" /></div>;
  }

  if (!session?.user || session.user.role !== "admin") return null;

  const content = (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Platform Settings</h1>
        <p className="text-muted-foreground">Configure platform-wide settings and preferences</p>
      </div>
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Admin Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={adminProfile.name} onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })} />
              </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={adminProfile.email} onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <PasswordInput 
                    value={adminProfile.password} 
                    onChange={(e) => setAdminProfile({ ...adminProfile, password: e.target.value })} 
                    placeholder="Leave blank to keep current"
                  />
                </div>
                <Button onClick={handleSaveAdminProfile} className="gradient-bg" disabled={updateProfileMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="general">
          <Card>
            <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Site Name</Label><Input value={localSettings?.general?.siteName || ""} onChange={(e) => setLocalSettings({...localSettings, general: {...localSettings?.general, siteName: e.target.value}})} /></div>
              <div className="space-y-2"><Label>Site Email</Label><Input value={localSettings?.general?.siteEmail || ""} onChange={(e) => setLocalSettings({...localSettings, general: {...localSettings?.general, siteEmail: e.target.value}})} /></div>
              <Button onClick={() => handleSave("general", localSettings?.general)} className="gradient-bg"><Save className="h-4 w-4 mr-2" />Save</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payments">
          <div className="space-y-6">
            <Card>
              <CardHeader><div className="flex justify-between"><div><CardTitle>Stripe</CardTitle><CardDescription>Credit/Debit card payments</CardDescription></div><Switch checked={localSettings?.paymentMethods?.stripe?.enabled ?? true} onCheckedChange={(c) => setLocalSettings({...localSettings, paymentMethods: {...localSettings?.paymentMethods, stripe: {...localSettings?.paymentMethods?.stripe, enabled: c}}})} /></div></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Publishable Key</Label><Input value={localSettings?.paymentMethods?.stripe?.publishableKey || ""} onChange={(e) => setLocalSettings({...localSettings, paymentMethods: {...localSettings?.paymentMethods, stripe: {...localSettings?.paymentMethods?.stripe, publishableKey: e.target.value}}})} placeholder="pk_test_..." /></div>
                <div className="space-y-2"><Label>Secret Key</Label><Input type="password" value={localSettings?.paymentMethods?.stripe?.secretKey || ""} onChange={(e) => setLocalSettings({...localSettings, paymentMethods: {...localSettings?.paymentMethods, stripe: {...localSettings?.paymentMethods?.stripe, secretKey: e.target.value}}})} placeholder="sk_test_..." /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><div className="flex justify-between"><div><CardTitle>JazzCash</CardTitle><CardDescription>Mobile wallet payments</CardDescription></div><Switch checked={localSettings?.paymentMethods?.jazzcash?.enabled ?? true} onCheckedChange={(c) => setLocalSettings({...localSettings, paymentMethods: {...localSettings?.paymentMethods, jazzcash: {...localSettings?.paymentMethods?.jazzcash, enabled: c}}})} /></div></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Merchant ID</Label><Input value={localSettings?.paymentMethods?.jazzcash?.merchantId || ""} onChange={(e) => setLocalSettings({...localSettings, paymentMethods: {...localSettings?.paymentMethods, jazzcash: {...localSettings?.paymentMethods?.jazzcash, merchantId: e.target.value}}})} /></div>
                <div className="space-y-2"><Label>Account Number</Label><Input value={localSettings?.paymentMethods?.jazzcash?.accountNumber || ""} onChange={(e) => setLocalSettings({...localSettings, paymentMethods: {...localSettings?.paymentMethods, jazzcash: {...localSettings?.paymentMethods?.jazzcash, accountNumber: e.target.value}}})} placeholder="03XX-XXXXXXX" /></div>
                <div className="space-y-2"><Label>Password</Label><Input type="password" value={localSettings?.paymentMethods?.jazzcash?.password || ""} onChange={(e) => setLocalSettings({...localSettings, paymentMethods: {...localSettings?.paymentMethods, jazzcash: {...localSettings?.paymentMethods?.jazzcash, password: e.target.value}}})} /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><div className="flex justify-between"><div><CardTitle>Easypaisa</CardTitle><CardDescription>Mobile wallet payments</CardDescription></div><Switch checked={localSettings?.paymentMethods?.easypaisa?.enabled ?? true} onCheckedChange={(c) => setLocalSettings({...localSettings, paymentMethods: {...localSettings?.paymentMethods, easypaisa: {...localSettings?.paymentMethods?.easypaisa, enabled: c}}})} /></div></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Store ID</Label><Input value={localSettings?.paymentMethods?.easypaisa?.storeId || ""} onChange={(e) => setLocalSettings({...localSettings, paymentMethods: {...localSettings?.paymentMethods, easypaisa: {...localSettings?.paymentMethods?.easypaisa, storeId: e.target.value}}})} /></div>
                <div className="space-y-2"><Label>Account Number</Label><Input value={localSettings?.paymentMethods?.easypaisa?.accountNumber || ""} onChange={(e) => setLocalSettings({...localSettings, paymentMethods: {...localSettings?.paymentMethods, easypaisa: {...localSettings?.paymentMethods?.easypaisa, accountNumber: e.target.value}}})} placeholder="03XX-XXXXXXX" /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><div className="flex justify-between"><div><CardTitle>NayaPay</CardTitle><CardDescription>Digital wallet payments</CardDescription></div><Switch checked={localSettings?.paymentMethods?.nayapay?.enabled ?? true} onCheckedChange={(c) => setLocalSettings({...localSettings, paymentMethods: {...localSettings?.paymentMethods, nayapay: {...localSettings?.paymentMethods?.nayapay, enabled: c}}})} /></div></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Account Number</Label><Input value={localSettings?.paymentMethods?.nayapay?.accountNumber || ""} onChange={(e) => setLocalSettings({...localSettings, paymentMethods: {...localSettings?.paymentMethods, nayapay: {...localSettings?.paymentMethods?.nayapay, accountNumber: e.target.value}}})} placeholder="03XX-XXXXXXX" /></div>
                <div className="space-y-2"><Label>API Key</Label><Input type="password" value={localSettings?.paymentMethods?.nayapay?.apiKey || ""} onChange={(e) => setLocalSettings({...localSettings, paymentMethods: {...localSettings?.paymentMethods, nayapay: {...localSettings?.paymentMethods?.nayapay, apiKey: e.target.value}}})} /></div>
              </CardContent>
            </Card>
            <Button onClick={() => handleSave("paymentMethods", localSettings?.paymentMethods)} className="gradient-bg"><Save className="h-4 w-4 mr-2" />Save Payment Settings</Button>
          </div>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between"><div><Label>Maintenance Mode</Label><p className="text-sm text-muted-foreground">Disable public access</p></div><Switch checked={localSettings?.security?.maintenanceMode || false} onCheckedChange={(c) => setLocalSettings({...localSettings, security: {...localSettings?.security, maintenanceMode: c}})} /></div>
              <div className="flex justify-between"><div><Label>Auto-Approve Products</Label><p className="text-sm text-muted-foreground">Automatically approve new products</p></div><Switch checked={localSettings?.security?.autoApproveProducts || false} onCheckedChange={(c) => setLocalSettings({...localSettings, security: {...localSettings?.security, autoApproveProducts: c}})} /></div>
              <Button onClick={() => handleSave("security", localSettings?.security)} className="gradient-bg"><Save className="h-4 w-4 mr-2" />Save</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  return content;
}
