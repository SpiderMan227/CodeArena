import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './BounceCards.css';

interface BounceCardsProps {
  className?: string;
  images?: string[];
  containerWidth?: number;
  containerHeight?: number;
  animationDelay?: number;
  animationStagger?: number;
  easeType?: string;
  transformStyles?: string[];
  enableHover?: boolean;
}

export default function BounceCards({
  className = '',
  images = [],
  containerWidth = 400,
  containerHeight = 400,
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = 'elastic.out(1, 0.8)',
  transformStyles = [
    'rotate(10deg) translate(-170px)',
    'rotate(5deg) translate(-85px)',
    'rotate(-3deg)',
    'rotate(-10deg) translate(85px)',
    'rotate(2deg) translate(170px)'
  ],
  enableHover = true
}: BounceCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Initial bounce-in animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.bounce-card',
        { scale: 0 },
        {
          scale: 1,
          stagger: animationStagger,
          ease: easeType,
          delay: animationDelay
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [animationStagger, easeType, animationDelay]);

  // Handle active enlarged card states
  useEffect(() => {
    if (!containerRef.current) return;
    const q = gsap.utils.selector(containerRef);

    if (activeIdx === null) {
      // No card is enlarged, restore default stacking and transforms
      images.forEach((_, i) => {
        const target = q(`.bounce-card-${i}`);
        gsap.killTweensOf(target);
        const baseTransform = transformStyles[i] || 'none';
        gsap.to(target, {
          transform: baseTransform,
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: 'back.out(1.4)',
          overwrite: 'auto'
        });
        gsap.set(target, { zIndex: images.length - i });
      });
    } else {
      // A card is active/enlarged
      images.forEach((_, i) => {
        const target = q(`.bounce-card-${i}`);
        gsap.killTweensOf(target);
        const baseTransform = transformStyles[i] || 'none';

        if (i === activeIdx) {
          // Straighten and scale up the active card, bring to front
          const noRotationTransform = getNoRotationTransform(baseTransform);
          gsap.to(target, {
            transform: noRotationTransform,
            scale: 1.35,
            opacity: 1,
            duration: 0.4,
            ease: 'back.out(1.2)',
            overwrite: 'auto'
          });
          gsap.set(target, { zIndex: 200 });
        } else {
          // Push away and dim sibling cards
          const offsetX = i < activeIdx ? -220 : 220;
          const pushedTransform = getPushedTransform(baseTransform, offsetX);
          gsap.to(target, {
            transform: pushedTransform,
            scale: 0.8,
            opacity: 0.3,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto'
          });
          gsap.set(target, { zIndex: images.length - i });
        }
      });
    }
  }, [activeIdx, images, transformStyles]);

  const getNoRotationTransform = (transformStr: string) => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);
    if (hasRotate) {
      return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
    } else if (transformStr === 'none') {
      return 'rotate(0deg)';
    } else {
      return `${transformStr} rotate(0deg)`;
    }
  };

  const getPushedTransform = (baseTransform: string, offsetX: number) => {
    const translateRegex = /translate\(([-0-9.]+)px\)/;
    const match = baseTransform.match(translateRegex);
    if (match) {
      const currentX = parseFloat(match[1]);
      const newX = currentX + offsetX;
      return baseTransform.replace(translateRegex, `translate(${newX}px)`);
    } else {
      return baseTransform === 'none' ? `translate(${offsetX}px)` : `${baseTransform} translate(${offsetX}px)`;
    }
  };

  const pushSiblings = (hoveredIdx: number) => {
    if (!enableHover || !containerRef.current || activeIdx !== null) return;

    const q = gsap.utils.selector(containerRef);

    images.forEach((_, i) => {
      const target = q(`.bounce-card-${i}`);
      gsap.killTweensOf(target);

      const baseTransform = transformStyles[i] || 'none';

      if (i === hoveredIdx) {
        const noRotationTransform = getNoRotationTransform(baseTransform);
        gsap.to(target, {
          transform: noRotationTransform,
          duration: 0.4,
          ease: 'back.out(1.4)',
          overwrite: 'auto'
        });
        gsap.set(target, { zIndex: images.length + 10 });
      } else {
        const offsetX = i < hoveredIdx ? -160 : 160;
        const pushedTransform = getPushedTransform(baseTransform, offsetX);

        const distance = Math.abs(hoveredIdx - i);
        const delay = distance * 0.05;

        gsap.to(target, {
          transform: pushedTransform,
          duration: 0.4,
          ease: 'back.out(1.4)',
          delay,
          overwrite: 'auto'
        });
        gsap.set(target, { zIndex: images.length - i });
      }
    });
  };

  const resetSiblings = () => {
    if (!enableHover || !containerRef.current || activeIdx !== null) return;

    const q = gsap.utils.selector(containerRef);

    images.forEach((_, i) => {
      const target = q(`.bounce-card-${i}`);
      gsap.killTweensOf(target);
      const baseTransform = transformStyles[i] || 'none';
      gsap.to(target, {
        transform: baseTransform,
        duration: 0.4,
        ease: 'back.out(1.4)',
        overwrite: 'auto'
      });
      gsap.set(target, { zIndex: images.length - i });
    });
  };

  const handleCardClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    if (activeIdx === idx) {
      setActiveIdx(null);
    } else {
      setActiveIdx(idx);
    }
  };

  return (
    <div
      className={`bounceCardsContainer ${className}`}
      ref={containerRef}
      style={{
        position: 'relative',
        width: containerWidth,
        height: containerHeight
      }}
      onClick={() => setActiveIdx(null)}
    >
      {images.map((src, idx) => (
        <div
          key={idx}
          className={`bounce-card bounce-card-${idx}`}
          style={{
            transform: transformStyles[idx] ?? 'none',
            zIndex: images.length - idx
          }}
          onMouseEnter={() => pushSiblings(idx)}
          onMouseLeave={resetSiblings}
          onClick={(e) => handleCardClick(e, idx)}
        >
          <img className="bounce-card-image" src={src} alt={`card-${idx}`} />
        </div>
      ))}
    </div>
  );
}
