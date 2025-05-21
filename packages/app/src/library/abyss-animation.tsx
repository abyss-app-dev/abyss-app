import { useCallback, useEffect, useRef, useState } from 'react';

type Star = {
    x: number;
    y: number;
    size: number;
    opacity: number;
    dx: number;
    dy: number;
    fadeOut: boolean;
    id: number;
    connections: Map<number, number>; // Map of connected star ID to line opacity
    isStatic: boolean;
    accelerationFactor: number; // Added: unique acceleration for each star
};

interface AbyssAnimationProps {
    initialStaticStars?: number;
    initialDynamicStars?: number;
}

export function AbyssAnimation({ initialStaticStars = 30, initialDynamicStars = 100 }: AbyssAnimationProps) {
    // --- Parameter Tuning ---
    const FRICTION = 0.99; // Increased friction further to slow them down more gently
    const BASE_ACCELERATION = 0.0008; // Renamed to BASE_ACCELERATION
    const MAX_LINE_DISTANCE = 70; // Increased: stars need to be fairly close to connect
    const MAX_CONNECTIONS_PER_DOT = 4; // Slightly reduced, can help performance and clarity
    const FADE_SPEED = 0.035; // Line fade in/out speed
    const MIN_LINE_OPACITY = 0.0;
    const MAX_LINE_OPACITY = 0.1; // Max opacity for lines (slightly reduced for subtlety)
    const RECOMPUTE_INTERVAL = 20;
    const STAR_FADE_OUT_SPEED = 0.03;
    const RESPAWN_OPACITY_THRESHOLD = 0.01;
    const MIN_STAR_OPACITY_AT_EDGE = 0.2;
    const MAX_STAR_OPACITY_AT_EDGE = 0.7; // Reduced max initial opacity

    const containerRef = useRef<HTMLDivElement>(null);
    const frameCountRef = useRef(0);
    const starsRef = useRef<Star[]>([]);
    const [starsForRender, setStarsForRender] = useState<Star[]>([]);
    const nextIdRef = useRef(0);

    const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    const createStar = (isStaticOverride?: boolean, idToUse?: number): Star => {
        const isStatic = isStaticOverride !== undefined ? isStaticOverride : false; // Default to dynamic for this simplified call path
        const id = idToUse !== undefined ? idToUse : nextIdRef.current++;

        let starX = Math.random() * 100;
        let starY = Math.random() * 100;

        if (!isStatic) {
            const angle = Math.random() * Math.PI * 2;
            // Spawn in a wider, more dispersed outer ring to reduce "waves"
            const radius = 35 + Math.random() * 30;
            starX = 50 + radius * Math.cos(angle);
            starY = 50 + radius * Math.sin(angle);
            starX = Math.max(0.1, Math.min(99.9, starX)); // Keep slightly away from exact edge
            starY = Math.max(0.1, Math.min(99.9, starY));
        }

        return {
            id,
            x: starX,
            y: starY,
            size: isStatic ? 1.5 + Math.random() * 1 : 1 + Math.random() * 1.2, // Slightly smaller dynamic
            opacity: isStatic
                ? 0.7 + Math.random() * 0.3
                : MIN_STAR_OPACITY_AT_EDGE + Math.random() * (MAX_STAR_OPACITY_AT_EDGE - MIN_STAR_OPACITY_AT_EDGE),
            dx: 0,
            dy: 0,
            fadeOut: false,
            connections: new Map<number, number>(),
            isStatic,
            accelerationFactor: isStatic ? 0 : 0.5 + Math.random() * 4.5, // Assign a random acceleration factor for dynamic stars
        };
    };

    const findNearestNeighbors = (star: Star, allStars: Star[], n: number): Star[] => {
        return allStars
            .filter(s => s.id !== star.id && !s.fadeOut)
            .map(s => ({
                star: s,
                distance: calculateDistance(star.x, star.y, s.x, s.y),
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, n)
            .map(n => n.star);
    };

    useEffect(() => {
        starsRef.current = [];
        nextIdRef.current = 0;
        const initialStarsList: Star[] = [];
        for (let i = 0; i < initialStaticStars; i++) {
            initialStarsList.push(createStar(true));
        }
        for (let i = 0; i < initialDynamicStars; i++) {
            initialStarsList.push(createStar(false));
        }
        starsRef.current = initialStarsList;
        setStarsForRender(initialStarsList);
    }, [initialDynamicStars, initialStaticStars]);

    useEffect(() => {
        let animationFrameId: number;
        const animate = () => {
            const targetX = 50;
            const targetY = 50;
            frameCountRef.current++;

            let currentStars = starsRef.current.map(star => ({ ...star, connections: new Map(star.connections) }));

            currentStars = currentStars.map(star => {
                if (star.isStatic) return star;

                if (star.opacity <= RESPAWN_OPACITY_THRESHOLD && star.fadeOut) {
                    const respawnedStar = createStar(false, star.id);
                    respawnedStar.connections = new Map();
                    return respawnedStar;
                }

                if (star.fadeOut) {
                    star.opacity = Math.max(0, star.opacity - STAR_FADE_OUT_SPEED);
                    return star;
                }

                const distX = targetX - star.x;
                const distY = targetY - star.y;
                const distanceToTarget = Math.sqrt(distX * distX + distY * distY);

                // Adjusted acceleration factor: less aggressive, smoother pull
                // Use BASE_ACCELERATION and multiply by star.accelerationFactor
                const accelerationMagnitude = BASE_ACCELERATION * star.accelerationFactor * (distanceToTarget / 50 + 0.1);

                star.dx += (distX * accelerationMagnitude) / (distanceToTarget || 1); // Normalized direction
                star.dy += (distY * accelerationMagnitude) / (distanceToTarget || 1);

                star.dx *= FRICTION;
                star.dy *= FRICTION;

                star.x += star.dx;
                star.y += star.dy;

                if (distanceToTarget < 2) {
                    star.fadeOut = true;
                }

                star.opacity = Math.max(0.05, Math.min(MAX_STAR_OPACITY_AT_EDGE, distanceToTarget / 80 + 0.05));

                const updatedStarConnections = new Map<number, number>();
                for (const [connectedId, currentLineOpacity] of star.connections.entries()) {
                    const connectedStar = starsRef.current.find(s => s.id === connectedId); // Use starsRef for stable state
                    if (connectedStar && !connectedStar.fadeOut) {
                        const distBetweenStars = calculateDistance(star.x, star.y, connectedStar.x, connectedStar.y);
                        let newLineOpacity = currentLineOpacity;

                        if (distBetweenStars > MAX_LINE_DISTANCE || connectedStar.fadeOut) {
                            newLineOpacity = Math.max(MIN_LINE_OPACITY, currentLineOpacity - FADE_SPEED);
                        } else {
                            newLineOpacity = Math.min(MAX_LINE_OPACITY, currentLineOpacity + FADE_SPEED);
                        }

                        if (newLineOpacity > MIN_LINE_OPACITY) {
                            updatedStarConnections.set(connectedId, newLineOpacity);
                        }
                    }
                }
                star.connections = updatedStarConnections;
                return star;
            });

            if (frameCountRef.current % RECOMPUTE_INTERVAL === 0) {
                // Pass 1: Each star determines its preferred connections
                currentStars.forEach(star1 => {
                    if (star1.isStatic || star1.fadeOut) return;

                    const preferredConnections = new Map<number, number>();
                    const neighbors = findNearestNeighbors(star1, currentStars, MAX_CONNECTIONS_PER_DOT);

                    neighbors.forEach(neighbor => {
                        if (calculateDistance(star1.x, star1.y, neighbor.x, neighbor.y) <= MAX_LINE_DISTANCE) {
                            const existingOpacity = star1.connections.get(neighbor.id) ?? MIN_LINE_OPACITY;
                            preferredConnections.set(neighbor.id, Math.max(MIN_LINE_OPACITY, existingOpacity)); // Ensure not negative
                        }
                    });
                    star1.connections = preferredConnections;
                });

                // Pass 2: Enforce symmetry and finalize connections for this interval
                currentStars.forEach(star1 => {
                    if (star1.isStatic || star1.fadeOut) return;

                    const finalStar1Connections = new Map<number, number>();
                    for (const [star2Id, opacity1] of star1.connections) {
                        const star2 = currentStars.find(s => s.id === star2Id);
                        // Check if star2 exists, is active, and also wants to connect to star1
                        if (star2 && !star2.fadeOut && star2.connections.has(star1.id)) {
                            const opacity2 = star2.connections.get(star1.id)!;
                            // Use the lower of the two opacities (or an average) for a synchronized appearance
                            // Or simply let each manage its half, and rely on per-frame update.
                            // Here, we ensure the connection is mutual, opacity will be handled by per-frame updates.
                            finalStar1Connections.set(star2Id, opacity1); // Keep star1's preferred opacity for now
                        }
                    }
                    star1.connections = finalStar1Connections;
                });
            }

            starsRef.current = currentStars;
            setStarsForRender(currentStars);
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [initialDynamicStars, initialStaticStars]);

    return (
        <div className="w-full h-full relative " ref={containerRef}>
            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                <svg
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                    aria-label="Star connections"
                >
                    <title>Star connection network visualization</title>
                    {starsForRender.map(star1 =>
                        Array.from(star1.connections.entries()).map(([star2Id, lineOpacity]) => {
                            const star2 = starsForRender.find(s => s.id === star2Id);
                            if (!star2 || star1.id === star2.id) return null;
                            if (star1.id >= star2.id) return null; // Draw each line once

                            // Only render line if opacity is high enough to be visible
                            if (lineOpacity < 0.01) return null;

                            return (
                                <line
                                    key={`${star1.id}-${star2.id}`} // Corrected key to use star2.id
                                    x1={`${star1.x}%`}
                                    y1={`${star1.y}%`}
                                    x2={`${star2.x}%`}
                                    y2={`${star2.y}%`}
                                    stroke="white"
                                    strokeWidth="0.5"
                                    opacity={lineOpacity} // Reverted to using the opacity attribute
                                />
                            );
                        })
                    )}
                </svg>
                {starsForRender.map(s => (
                    <div
                        key={s.id}
                        style={{
                            position: 'absolute',
                            width: `${s.size}px`,
                            height: `${s.size}px`,
                            backgroundColor: 'white',
                            opacity: s.opacity,
                            borderRadius: '50%',
                            top: `${s.y}%`,
                            left: `${s.x}%`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1,
                            transition: s.fadeOut ? `opacity ${STAR_FADE_OUT_SPEED * 20}s ease-out` : 'none',
                        }}
                        role="img"
                        aria-label={`Star ${s.id}`}
                    />
                ))}
            </div>
        </div>
    );
}
