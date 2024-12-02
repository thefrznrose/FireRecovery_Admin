import type { NextApiRequest, NextApiResponse } from "next";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { token } = req.body;
    console.log("vaer")
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      console.log("User verified:", payload);
      res.status(200).json({ message: "User authenticated", user: payload });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
