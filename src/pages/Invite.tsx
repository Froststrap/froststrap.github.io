import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import DiscordMeta from "../components/DiscordMeta";

const WORKER_BASE = "https://roblox-proxy.proxy-roblox.workers.dev";

const formatCompactNumber = (num?: number) => {
  if (num === undefined || num === null) return "-";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
};

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

interface GameCreator {
  id: number;
  name: string;
}

interface GameDetails {
  id: number;
  rootPlaceId: number;
  name: string;
  description: string;
  creator?: GameCreator;
  playing?: number;
  visits?: number;
  maxPlayers?: number;
  [key: string]: unknown;
}

interface GameInfo {
  thumbnail?: string | null;
  details?: GameDetails | null;
}

const Invite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const placeId = searchParams.get("placeId");
  const gameInstanceId = searchParams.get("gameInstanceId");

  const [triedRedirect, setTriedRedirect] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [gameName, setGameName] = useState<string>("Unknown");
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);

  const robloxUri = useMemo(
    () => buildRobloxUri(placeId, gameInstanceId),
    [placeId, gameInstanceId],
  );

  const webFallback = useMemo(() => buildWebFallbackUrl(placeId), [placeId]);

  // Fetch game info from worker
  useEffect(() => {
    if (!placeId) return;

    const url = `${WORKER_BASE}/api/gameInfo?placeId=${encodeURIComponent(placeId)}`;

    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Worker returned a non-200 status");

        const json: GameInfo = await res.json();
        setThumbnailUrl(json.thumbnail ?? null);
        setGameName(json.details?.name ?? "Unknown");
        setGameDetails(json.details ?? null);
      } catch (err) {
        console.error(err);
        setThumbnailUrl(null);
        setGameName("Unknown");
        setGameDetails(null);
      }
    })();
  }, [placeId]);

  // Auto-open Roblox
  useEffect(() => {
    if (!robloxUri) return;

    const timer = window.setTimeout(() => {
      window.location.href = robloxUri;
      setTriedRedirect(true);
    }, 100);

    return () => window.clearTimeout(timer);
  }, [robloxUri]);

  return (
    <HelmetProvider>
      {/* Discord Meta Tags */}
      {placeId && <DiscordMeta placeId={placeId} />}

      <main className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-3xl w-full flex gap-6 items-start">
          {/* Thumbnail + Game Info */}
          <div className="w-48 flex-shrink-0">
            <div className="w-48 h-48 rounded-md overflow-hidden bg-gray-200 relative">
              {!thumbnailUrl ? (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No thumbnail
                </div>
              ) : (
                <img
                  src={thumbnailUrl}
                  alt="Game Thumbnail"
                  className="w-full h-full object-cover"
                  onError={() => setThumbnailUrl(null)}
                />
              )}
            </div>

            <div className="mt-2 text-center font-bold text-lg">{gameName}</div>

            {gameDetails?.creator?.name && (
              <div className="text-center text-sm text-gray-500 mt-1">
                by {gameDetails.creator.name}
              </div>
            )}
          </div>

          {/* Right Side Content */}
          <div className="flex-1 text-left">
            <h1 className="text-xl mb-3 font-medium">Joining game...</h1>

            {!placeId ? (
              <p className="mb-3">
                Missing parameter <code>placeId</code>.
              </p>
            ) : (
              <>
                <p className="mb-3">
                  Place ID: <strong>{placeId}</strong>
                </p>

                <p className="mb-3">
                  Instance ID: <strong>{gameInstanceId}</strong>
                </p>

                {/* Buttons */}
                <div className="flex gap-3 flex-wrap mb-6">
                  {robloxUri && (
                    <a
                      href={robloxUri}
                      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
                    >
                      Join Game
                    </a>
                  )}

                  {webFallback && (
                    <a
                      href={webFallback}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-gray-200 rounded-md text-gray-900 bg-white hover:bg-gray-50 transition"
                    >
                      View Game on Roblox Website
                    </a>
                  )}

                  {triedRedirect && (
                    <p className="mt-4 text-gray-500 text-sm">
                      If nothing opened, click “Open in Roblox”.
                    </p>
                  )}
                </div>

                {/* Game Stats Tab */}
                {gameDetails && (
                  <div className="border-t border-gray-600 pt-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Game Stats
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {/* Active / Playing */}
                      <div className="bg-transparent p-3 rounded-lg text-center border border-gray-600">
                        <div className="text-xs text-gray-300 mb-1">Active</div>
                        <div className=" text-white text-lg">
                          {formatCompactNumber(gameDetails.playing)}
                        </div>
                      </div>

                      {/* Visits */}
                      <div className="bg-transparent p-3 rounded-lg text-center border border-gray-600">
                        <div className="text-xs text-gray-300 mb-1">Visits</div>
                        <div className=" text-white text-lg">
                          {formatCompactNumber(gameDetails.visits)}
                        </div>
                      </div>

                      {/* Max Players */}
                      <div className="bg-transparent p-3 rounded-lg text-center border border-gray-600">
                        <div className="text-xs text-gray-300 mb-1">
                          Server Size
                        </div>
                        <div className=" text-white text-lg">
                          {gameDetails.maxPlayers}
                        </div>
                      </div>
                    </div>
                    {gameDetails.description && (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Description
                        </h3>
                        <div className="bg-transparent p-3 rounded-lg border border-gray-600 text-sm text-white whitespace-pre-wrap">
                          {gameDetails.description}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </HelmetProvider>
  );
};

export default Invite;
