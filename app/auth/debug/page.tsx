"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function DebugPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testPasswordReset = async () => {
    if (!email) {
      addResult("❌ Please enter an email address");
      return;
    }

    setIsLoading(true);
    addResult("🔄 Starting password reset test...");

    try {
      const origin = window.location.origin;
      const redirectUrl = `${origin}/auth/confirm?next=${encodeURIComponent('/auth/update-password')}`;
      
      addResult(`📧 Sending reset email to: ${email}`);
      addResult(`🔗 Redirect URL: ${redirectUrl}`);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        addResult(`❌ Error: ${error.message}`);
      } else {
        addResult("✅ Password reset email sent successfully!");
        addResult("📬 Check your email for the reset link");
      }
    } catch (error) {
      addResult(`❌ Unexpected error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSession = async () => {
    addResult("🔄 Checking current session...");
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        addResult(`❌ Session error: ${error.message}`);
      } else if (session) {
        addResult(`✅ Valid session found for: ${session.user.email}`);
        addResult(`🕒 Session expires: ${new Date(session.expires_at! * 1000).toLocaleString()}`);
      } else {
        addResult("ℹ️ No active session");
      }
    } catch (error) {
      addResult(`❌ Session check error: ${error}`);
    }
  };

  const testPasswordUpdate = async () => {
    if (!password) {
      addResult("❌ Please enter a new password");
      return;
    }

    setIsLoading(true);
    addResult("🔄 Testing password update...");

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        addResult(`❌ Password update error: ${error.message}`);
      } else {
        addResult("✅ Password updated successfully!");
      }
    } catch (error) {
      addResult(`❌ Unexpected error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSignOut = async () => {
    addResult("🔄 Signing out...");
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        addResult(`❌ Sign out error: ${error.message}`);
      } else {
        addResult("✅ Signed out successfully");
      }
    } catch (error) {
      addResult(`❌ Sign out error: ${error}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Password Reset Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is a debug tool to help test password reset functionality. 
              Use this to troubleshoot issues with the password reset flow.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">New Password (for update test)</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="newpassword123"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={testPasswordReset} 
                disabled={isLoading}
                className="w-full"
              >
                1. Test Password Reset Email
              </Button>
              
              <Button 
                onClick={testSession} 
                variant="outline"
                className="w-full"
              >
                2. Check Current Session
              </Button>
              
              <Button 
                onClick={testPasswordUpdate} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                3. Test Password Update
              </Button>
              
              <Button 
                onClick={testSignOut} 
                variant="destructive"
                className="w-full"
              >
                4. Sign Out
              </Button>
              
              <Button 
                onClick={clearResults} 
                variant="ghost"
                className="w-full"
              >
                Clear Results
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-500 text-center">No test results yet. Run a test to see results here.</p>
            ) : (
              <div className="space-y-1">
                {results.map((result, index) => (
                  <div key={index} className="font-mono text-sm">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium">Complete Flow Test:</h4>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Enter your email address above</li>
                <li>Click "Test Password Reset Email"</li>
                <li>Check your email for the reset link</li>
                <li>Click the reset link in your email</li>
                <li>You should be redirected to the update password page</li>
                <li>Enter a new password and submit</li>
                <li>You should be redirected to login</li>
                <li>Try logging in with your new password</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium">Session Test:</h4>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>After clicking a reset link, come back to this page</li>
                <li>Click "Check Current Session"</li>
                <li>You should see a valid session</li>
                <li>Try "Test Password Update" to update your password</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium">Common Issues:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>If no email is received, check spam folder</li>
                <li>If reset link doesn't work, check browser console for errors</li>
                <li>If session is invalid, the reset link may have expired</li>
                <li>If password update fails, check the error message</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}