exports.handler = async (event) => {
  const symbol = event.queryStringParameters?.symbol?.toUpperCase();

  if (!symbol) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing symbol parameter" }),
    };
  }

  const key = process.env.FINNHUB_KEY;
  if (!key) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured" }),
    };
  }

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`,
    );

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `Finnhub error: ${res.status}` }),
      };
    }

    const data = await res.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
