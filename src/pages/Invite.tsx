import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

const buildRobloxUri = (
  placeId?: string | null,
  gameInstanceId?: string | null,
) => {
  if (!placeId) return null;
  const params = new URLSearchParams();
  params.set("placeId", placeId);
  if (gameInstanceId) params.set("gameInstanceId", gameInstanceId);
  return `roblox://experiences/start?${params.toString()}`;
};

const buildWebFallbackUrl = (placeId?: string | null) => {
  if (!placeId) return null;
  return `https://www.roblox.com/games/${encodeURIComponent(placeId)}`;
};

const Invite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const placeId = searchParams.get("placeId");
  const gameInstanceId = searchParams.get("gameInstanceId");
  const [triedRedirect, setTriedRedirect] = useState(false);

  const robloxUri = useMemo(
    () => buildRobloxUri(placeId, gameInstanceId),
    [placeId, gameInstanceId],
  );
  const webFallback = useMemo(() => buildWebFallbackUrl(placeId), [placeId]);

  useEffect(() => {
    if (!robloxUri) return;

    const timer = window.setTimeout(() => {
      window.location.href = robloxUri;
      setTriedRedirect(true);
    }, 100);

    return () => window.clearTimeout(timer);
  }, [robloxUri]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-xl mb-3">Joining game...</h1>

        {!placeId ? (
          <div>
            <p className="mb-3">
              Missing required parameter <code>placeId</code>. Make sure the
              invite link includes a<code>?placeId=...</code> query parameter.
            </p>
          </div>
        ) : (
          <div>
            <p className="mb-3">
              We're attempting to open Roblox for place{" "}
              <strong>{placeId}</strong>
              {gameInstanceId ? (
                <>
                  {" "}
                  in instance <strong>{gameInstanceId}</strong>.
                </>
              ) : (
                "."
              )}
            </p>

            <p className="mb-2">
              If your browser doesn't open Roblox automatically, use one of the
              links below.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {robloxUri && (
                <a
                  href={robloxUri}
                  className="inline-block px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                >
                  Open in Roblox
                </a>
              )}

              {webFallback && (
                <a
                  href={webFallback}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 border border-gray-200 rounded-md text-gray-900 bg-white hover:bg-gray-50 transition-colors"
                >
                  Open on Roblox Website
                </a>
              )}
            </div>

            {triedRedirect && (
              <p className="mt-3 text-gray-500 text-sm">
                If nothing happened after a moment, try clicking "Open in
                Roblox" above or check your browser's popup / external
                application settings.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Invite;
