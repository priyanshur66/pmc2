"use client";

import React, { ReactNode } from "react";
import { useSwipeable, SwipeableHandlers } from "react-swipeable";
import { useRouter } from "next/navigation";

// Define prop types for SwipeNavigator
interface SwipeNavigatorProps {
  children: ReactNode;
  currentPage: "swap" | "de-fi" | "game-fi" | "socials";
}

const SwipeNavigator: React.FC<SwipeNavigatorProps> = ({ children, currentPage }) => {
  const router = useRouter();

  const handleNavigation = (direction: "left" | "right") => {
    switch (currentPage) {
      case "swap":
        if (direction === "left") router.push("/Dapps/DE-Fi");
        break;
      case "de-fi":
        if (direction === "left") router.push("/Dapps/Game-Fi");
        else if (direction === "right") router.push("/Dapps");
        break;
      case "game-fi":
        if (direction === "left") router.push("/Dapps/Socials");
        else if (direction === "right") router.push("/Dapps/DE-Fi");
        break;
      case "socials":
        if (direction === "right") router.push("/Dapps/Game-Fi");
        break;
      default:
        break;
    }
  };

  const handlers: SwipeableHandlers = useSwipeable({
    onSwipedLeft: () => handleNavigation("left"),
    onSwipedRight: () => handleNavigation("right"),
    preventScrollOnSwipe: true, // Prevents scroll on swipe
    trackMouse: true, // Also enables swipe functionality with a mouse
  });

  return (
    <div {...handlers} className="h-full w-full">
      {children}
    </div>
  );
};

export default SwipeNavigator;