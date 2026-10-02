import Ably from "ably";

export async function GET() {
  try {
    const apiKey = process.env.ABLY_API_KEY;

    console.log("ABLY_API_KEY exists:", Boolean(apiKey));

    if (!apiKey) {
      return Response.json(
        {
          error: "ABLY_API_KEY is not configured.",
        },
        { status: 500 },
      );
    }

    const client = new Ably.Rest({
      key: apiKey,
    });

    const tokenRequest = await client.auth.createTokenRequest({
      clientId: "restaurant-client",
    });

    return Response.json(tokenRequest);
  } catch (error) {
    console.error("Ably token error:", error);

    return Response.json(
      {
        error: "Unable to create Ably token.",
      },
      { status: 500 },
    );
  }
}
