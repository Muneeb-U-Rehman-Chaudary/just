"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, User, Store, CreditCard, Save, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";
import { useVendorProfileUpdate } from "@/hooks/useApi";
import { PasswordInput } from "@/components/ui/password-input";

export default function VendorSettingsPage() {
  const { data: session, refetch } = useSession();
  const updateProfile = useVendorProfileUpdate();
  
  const [profile, setProfile] = useState({ name: "", email: "", bio: "", image: "", password: "" });
  const [store, setStore] = useState({ storeName: "", storeDescription: "" });
  const [payment, setPayment] = useState({ bankDetails: "" });

  useEffect(() => {
    if (session?.user) {
      setProfile({ 
        name: session.user.name || "", 
        email: session.user.email || "", 
        bio: session.user.bio || "",
        image: session.user.image || "",
        password: ""
      });
      setStore({ storeName: session.user.storeName || "", storeDescription: session.user.storeDescription || "" });
      setPayment({ bankDetails: session.user.bankDetails || "" });
    }
  }, [session]);

  const handleSaveProfile = () => {
    updateProfile.mutate(profile, {
      onSuccess: () => {
        refetch();
        setProfile(prev => ({ ...prev, password: "" }));
      }
    });
  };

  const handleSaveStore = () => {
    updateProfile.mutate(store, {
      onSuccess: () => refetch()
    });
  };

  const handleSavePayment = () => {
    updateProfile.mutate(payment, {
      onSuccess: () => refetch()
    });
  };

  const isLoading = !session?.user;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile, store, and payment settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="store"><Store className="mr-2 h-4 w-4" /> Store</TabsTrigger>
          <TabsTrigger value="payment"><CreditCard className="mr-2 h-4 w-4" /> Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and profile image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <Label>Profile Image</Label>
                  <div className="w-32">
                    <ImageUpload
                      value={profile.image}
                      onChange={(url) => setProfile({ ...profile, image: url })}
                      onRemove={() => setProfile({ ...profile, image: "" })}
                      placeholder="Upload Photo"
                      aspect="square"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <PasswordInput 
                        id="password" 
                        value={profile.password} 
                        onChange={(e) => setProfile({ ...profile, password: e.target.value })} 
                        placeholder="Leave blank to keep current"
                      />
                    </div>
                  </div>
                </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell customers about yourself..." rows={4} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
              </div>
              <Button onClick={handleSaveProfile} disabled={updateProfile.isPending} className="gradient-bg">
                <Save className="mr-2 h-4 w-4" /> {updateProfile.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>Customize your store appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input id="storeName" placeholder="Your Store Name" value={store.storeName} onChange={(e) => setStore({ ...store, storeName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea id="storeDescription" placeholder="Describe your store and what you sell..." rows={4} value={store.storeDescription} onChange={(e) => setStore({ ...store, storeDescription: e.target.value })} />
              </div>
              <Button onClick={handleSaveStore} disabled={updateProfile.isPending} className="gradient-bg">
                <Save className="mr-2 h-4 w-4" /> {updateProfile.isPending ? "Saving..." : "Save Store Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure your payment details for withdrawals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankDetails">Bank/Payment Details</Label>
                <Textarea id="bankDetails" placeholder="Enter your PayPal email, bank account number, or other payment details..." rows={4} value={payment.bankDetails} onChange={(e) => setPayment({ ...payment, bankDetails: e.target.value })} />
                <p className="text-xs text-muted-foreground">This information will be used for withdrawals</p>
              </div>
              <Button onClick={handleSavePayment} disabled={updateProfile.isPending} className="gradient-bg">
                <Save className="mr-2 h-4 w-4" /> {updateProfile.isPending ? "Saving..." : "Save Payment Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
