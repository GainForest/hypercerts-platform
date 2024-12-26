"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const INTRINSIC_CARD_WIDTH = 200;
const SECTION_HEIGHT = 420;

const HeroSection = () => {
  const [totalWidth, setTotalWidth] = useState(0);
  const [cardCount, setCardCount] = useState(6);
  const cardWidth = totalWidth / cardCount;

  const thisRef = useRef<HTMLElement>(null);
  const [xPercentage, setXPercentage] = useState<number | undefined>(undefined);

  const getPercentageDifference = useCallback(
    (index: number, xPercentage: number) => {
      const meanPositionPercentage =
        ((index * cardWidth + cardWidth / 2) * 100) / totalWidth;
      const percentageDifference = xPercentage - meanPositionPercentage;
      return percentageDifference;
    },
    [cardWidth, totalWidth]
  );

  const hoveredIndex = useMemo(() => {
    if (xPercentage === undefined) return undefined;
    const unitCardPercentage = 100 / cardCount;
    const hoveredIndex = Math.floor(xPercentage / unitCardPercentage);
    return hoveredIndex;
  }, [xPercentage, cardCount]);

  const getScaling = useCallback(
    (index: number) => {
      if (xPercentage === undefined) return 1;
      const percentageDifference = Math.abs(
        getPercentageDifference(index, xPercentage)
      );
      return Math.max(1, 1.1 - (0.1 * percentageDifference * 2) / 100);
    },
    [xPercentage, getPercentageDifference]
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setXPercentage(Math.round(percentage));
  };

  const handleMouseLeave = (): void => {
    setXPercentage(undefined);
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0].borderBoxSize[0].inlineSize;
      setTotalWidth(width);
      setCardCount(Math.floor(width / INTRINSIC_CARD_WIDTH) + 1);
    });
    if (!thisRef.current) return;
    resizeObserver.observe(thisRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <motion.section
      className="w-full max-w-5xl flex items-center justify-center"
      style={{
        height: `${SECTION_HEIGHT}px`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={thisRef}
    >
      {Array(cardCount)
        .fill(0)
        .map((_, i) => (
          <motion.div
            className="relative flex-1 h-full"
            initial={{ opacity: 0, filter: "blur(10px)", y: 100 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ delay: 0.15 * i, duration: 0.6 }}
            key={i}
          >
            <motion.div
              className="absolute top-[50%] left-[50%]"
              animate={{
                transform: `translate(${
                  hoveredIndex === i ? "-60" : "-50"
                }%, -50%)`,
                filter: `blur(${
                  hoveredIndex === undefined ? 0 : i !== hoveredIndex ? 5 : 0
                }px) brightness(${
                  hoveredIndex === undefined ? 1 : i === hoveredIndex ? 1 : 0.7
                })`,
                opacity:
                  hoveredIndex === undefined ? 1 : i === hoveredIndex ? 1 : 0.8,
              }}
            >
              <Image
                src={`/hero-images/HeroCover${i + 1}.webp`}
                alt={`Hero Cover ${i + 1}`}
                width={200}
                height={200}
                className="w-[200px] h-auto max-w-[200px] object-center object-cover rounded-2xl shadow-lg"
                style={{
                  scale: getScaling(i),
                }}
              />
            </motion.div>
          </motion.div>
        ))}
    </motion.section>
  );
};

export default HeroSection;