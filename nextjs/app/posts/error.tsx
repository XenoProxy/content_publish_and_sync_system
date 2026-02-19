"use client";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const isRateLimit = error.message.includes("429");

  return (
    <div style={{ padding: 40 }}>
      {isRateLimit ? (
        <>
          <h2>Too many requests</h2>
          <p>Please try again in a minute.</p>
        </>
      ) : (
        <>
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
        </>
      )}
    </div>
  );
}
