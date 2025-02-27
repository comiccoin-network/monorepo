// monorepo/native/mobile/comiccoin-publicfaucet/components/CoinIcon.tsx
import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

interface CoinIconProps {
  size?: number;
  color?: string;
}

const CoinIcon: React.FC<CoinIconProps> = ({
  size = 24,
  color = "#FFD700",
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} opacity="0.8" />
      <Circle cx="12" cy="12" r="8" fill={color} />
      <Path
        d="M12 6V18"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M16 10H8"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M15 14H9"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default CoinIcon;
