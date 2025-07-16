"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { User as UserIcon, LogIn } from "lucide-react";
import Link from "next/link";

export default function TestLogoutPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const supabase = createClient();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        addLog(`Initial session: ${session?.user?.email || "No user"}`);
        setLoading(false);
      } catch (error) {
        addLog(`Error getting session: ${error}`);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        addLog(`Auth state changed: ${event} - ${session?.user?.email || "No user"}`);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-teal mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Logout Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Current Auth State:</h3>
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">Logged in as: {user.email}</span>
                </div>
                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LogIn className="h-5 w-5 text-red-600" />
                  <span className="text-red-600 font-medium">Not logged in</span>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/auth/login">Sign in</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/auth/sign-up">Sign up</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Test Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>If not logged in, click "Sign in" and login with your credentials</li>
              <li>Come back to this page and you should see your email and logout button</li>
              <li>Click the "Logout" button</li>
              <li>You should immediately see "Not logged in" and the login/signup buttons</li>
              <li>Check the header - it should also show login/signup buttons</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Expected Behavior:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>✅ After logout, this page shows "Not logged in" and login buttons</li>
              <li>✅ Header immediately shows login/signup buttons</li>
              <li>✅ No page redirect (stays on current page)</li>
              <li>✅ Console logs show "SIGNED_OUT" event</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auth Event Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center">No events yet...</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="font-mono text-sm">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button 
            onClick={() => setLogs([])} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Clear Log
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}