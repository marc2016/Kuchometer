import { Router } from "express";
import crypto from "crypto";
import { parseCookies, signSession, verifySession } from "../utils/auth.js";

const router = Router();

const AUTH_ENABLED = process.env.AUTH_ENABLED === "true";
const DEX_EXTERNAL_URL = process.env.DEX_EXTERNAL_URL || "http://localhost:5556/dex";
const DEX_INTERNAL_URL = process.env.DEX_INTERNAL_URL || "http://localhost:5556/dex";
const CLIENT_ID = process.env.DEX_CLIENT_ID || "kuchometer-app";
const CLIENT_SECRET = process.env.DEX_CLIENT_SECRET || "kuchometer-secret";

router.get("/login", (req, res) => {
  if (!AUTH_ENABLED) {
    res.redirect("/");
    return;
  }

  const state = crypto.randomBytes(16).toString("hex");

  res.cookie("auth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000, // 10 minutes
  });

  const host = req.get("host") || "localhost:5173";
  const protocol = req.protocol || "http";
  const redirectUri = `${protocol}://${host}/api/auth/callback`;

  const authUrl = `${DEX_EXTERNAL_URL}/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=openid+profile+email&state=${state}`;

  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  if (!AUTH_ENABLED) {
    res.redirect("/");
    return;
  }

  const { code, state } = req.query;
  const cookies = parseCookies(req.headers.cookie);
  const savedState = cookies["auth_state"];

  if (!code || !state || state !== savedState) {
    res.status(400).send("Invalid state or authorization code");
    return;
  }

  res.clearCookie("auth_state");

  const host = req.get("host") || "localhost:5173";
  const protocol = req.protocol || "http";
  const redirectUri = `${protocol}://${host}/api/auth/callback`;

  try {
    const tokenResponse = await fetch(`${DEX_INTERNAL_URL}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: String(code),
        redirect_uri: redirectUri,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Dex token exchange failed:", errorText);
      res.status(500).send("Token exchange failed");
      return;
    }

    const tokens = (await tokenResponse.json()) as { access_token: string };

    const userinfoResponse = await fetch(`${DEX_INTERNAL_URL}/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userinfoResponse.ok) {
      console.error("Dex userinfo request failed");
      res.status(500).send("Userinfo request failed");
      return;
    }

    const userinfo = (await userinfoResponse.json()) as { name?: string; email?: string; sub: string };

    const name = userinfo.name || userinfo.email?.split("@")[0] || "User";

    const sessionToken = signSession({
      sub: userinfo.sub,
      name,
      email: userinfo.email,
    });

    res.cookie("kuchometer_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect("/");
  } catch (err) {
    console.error("Auth callback handler failed:", err);
    res.status(500).send("Authentication failed");
  }
});

router.get("/me", (req, res) => {
  if (!AUTH_ENABLED) {
    res.json({ user: null, authEnabled: false });
    return;
  }

  const cookies = parseCookies(req.headers.cookie);
  const sessionToken = cookies["kuchometer_session"];

  if (!sessionToken) {
    res.json({ user: null, authEnabled: true });
    return;
  }

  const user = verifySession(sessionToken);
  if (!user) {
    res.clearCookie("kuchometer_session");
    res.json({ user: null, authEnabled: true });
    return;
  }

  res.json({ user, authEnabled: true });
});

router.post("/logout", (req, res) => {
  res.clearCookie("kuchometer_session");
  res.json({ success: true });
});

export default router;
