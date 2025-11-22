import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

interface GameCreator {
  id: number;
  name: string;
}

interface GameDetails {
  id: number;
  name: string;
  description: string;
  creator?: GameCreator;
  [key: string]: unknown;
}

interface GameInfo {
  thumbnail?: string | null;
  details?: GameDetails | null;
}

const WORKER_BASE = "https://roblox-proxy.proxy-roblox.workers.dev";

const DiscordMeta: React.FC<{ placeId: string }> = ({ placeId }) => {
  const [gameInfo, setGameInfo] = useState<GameInfo>({});

  useEffect(() => {
    const fetchData = async () => {
      const url = `${WORKER_BASE}/api/gameInfo?placeId=${encodeURIComponent(placeId)}`;
      try {
        const res = await fetch(url);
        const data: GameInfo = await res.json();
        setGameInfo(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [placeId]);

  const title = gameInfo.details?.name ?? "Unknown Game";
  const description = gameInfo.details?.description ?? "Roblox game";
  const image = gameInfo.thumbnail ?? "";

  return (
    <Helmet>
      <title>{title}</title>
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default DiscordMeta;
