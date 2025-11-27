import { 
  SiSolana, 
  SiEthereum, 
  SiPolygon 
} from "react-icons/si";
import { Circle, Hexagon, Triangle, Diamond, Zap } from "lucide-react";

type ChainIconProps = {
  chain: string;
  className?: string;
  size?: number;
};

const chainIconColors: Record<string, string> = {
  solana: "#9945FF",
  "solana-devnet": "#14F195",
  eclipse: "#E8590C",
  ethereum: "#627EEA",
  polygon: "#8247E5",
  base: "#0052FF",
  arbitrum: "#28A0F0",
  optimism: "#FF0420",
  avalanche: "#E84142",
};

export function ChainIcon({ chain, className = "", size = 16 }: ChainIconProps) {
  const color = chainIconColors[chain] || "#888888";
  const iconProps = { 
    className, 
    size,
    style: { color }
  };

  switch (chain) {
    case "solana":
    case "solana-devnet":
      return <SiSolana {...iconProps} />;
    case "ethereum":
      return <SiEthereum {...iconProps} />;
    case "polygon":
      return <SiPolygon {...iconProps} />;
    case "eclipse":
      return <Zap {...iconProps} style={{ color }} />;
    case "base":
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill={color}
          className={className}
        >
          <circle cx="12" cy="12" r="10" fill={color} />
          <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.97 0 5.43-2.16 5.9-5H14c-.45 1.72-2 3-3.9 3-2.21 0-4-1.79-4-4s1.79-4 4-4c1.9 0 3.45 1.28 3.9 3h3.9c-.47-2.84-2.93-5-5.9-5z" fill="white"/>
        </svg>
      );
    case "arbitrum":
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          className={className}
        >
          <circle cx="12" cy="12" r="10" fill={color} />
          <path d="M12 4L6 14h4l2 6 2-6h4L12 4z" fill="white" />
        </svg>
      );
    case "optimism":
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          className={className}
        >
          <circle cx="12" cy="12" r="10" fill={color} />
          <circle cx="12" cy="12" r="5" fill="white" />
        </svg>
      );
    case "avalanche":
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          className={className}
        >
          <circle cx="12" cy="12" r="10" fill={color} />
          <path d="M12 6l-6 10h4l2-3.5 2 3.5h4l-6-10z" fill="white" />
        </svg>
      );
    default:
      return <Circle size={size} className={className} style={{ color }} />;
  }
}

export { chainIconColors };
