"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings } from "lucide-react";

export function ProfileTab() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Your personal information from your Clerk account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar and Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || "Profile"}
                className="h-20 w-20 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl gradient-primary text-2xl font-bold text-white">
                {user?.firstName?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-lg">{user?.fullName}</p>
            <p className="text-sm text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => openUserProfile()}
            >
              <Settings className="h-4 w-4" />
              Manage Account
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Profile information is managed through your Clerk account.
            Click "Manage Account" to update your name, email, or profile picture.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}