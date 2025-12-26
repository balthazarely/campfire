"use client";

import { useState } from "react";
import supabase from "../../utils/supabaseClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AuthForm() {
  const [isNewUser, setIsNewUser] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  let signInMessage = "Sign In";

  if (isSigningIn) {
    signInMessage = "Signing In";
  } else if (isNewUser) {
    signInMessage = "Sign Up";
  }

  const signUpMessage = (
    <p className="text-xs text-center text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
      Email sent! Check your email to confirm sign up.
    </p>
  );

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setErrorMessage("Unable to sign up. Please try again.");
    } else {
      setIsSigningUp(true);
    }
    console.log(error, data);
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsSigningIn(true);
    setErrorMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log({ error, data });

    if (!error) {
      window.location.assign("/my-campsites"); // hard reload
      return;
    }
    // Failed login
    setIsSigningIn(false);
    if (
      (error as any)?.status === 400 ||
      (error as any)?.code === "invalid_credentials"
    ) {
      setErrorMessage("Invalid email or password.");
    } else {
      setErrorMessage("Unable to sign in. Please try again.");
    }
  }
  // async function handleLogin(e: React.FormEvent) {
  //   e.preventDefault();
  //   setIsSigningIn(true);
  //   const { data, error } = await supabase.auth.signInWithPassword({
  //     email,
  //     password,
  //   });
  //   console.log({ error, data });
  //   if (!error) {
  //     router.push("/my-campsites");
  //     router.refresh();
  //   } else {
  //     setIsSigningIn(false);
  //   }
  // }

  return (
    <div className="max-w-md mx-auto px-4 text-left">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isNewUser ? "Create your account" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-sm">
            {isNewUser
              ? "Sign up to start saving and tracking your campsites."
              : "Sign in to view and manage your campsites."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={isNewUser ? handleSignUp : handleLogin}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-center text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {errorMessage}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSigningIn}>
              {signInMessage}
            </Button>

            <div className="pt-1 text-center text-sm text-muted-foreground">
              {isNewUser ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewUser(false);
                      setErrorMessage(null);
                    }}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewUser(true);
                      setErrorMessage(null);
                    }}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {isSigningUp && signUpMessage}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
