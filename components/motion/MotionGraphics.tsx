'use client';

import React, { useEffect, useState } from 'react';
import { m, useScroll, useSpring, useMotionValue, useTransform } from 'framer-motion';

export const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <m.div
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-blue-900 z-[100] origin-left"
            style={{ scaleX }}
        />
    );
};

export const MouseFollower = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <m.div
            className="pointer-events-none fixed inset-0 z-[60] opacity-30 mix-blend-soft-light hidden lg:block"
            style={{
                background: useTransform(
                    [mouseX, mouseY],
                    ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(249, 115, 22, 0.15), transparent 80%)`
                )
            }}
        />
    );
};

export const FloatingShapes = () => {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-20 dark:opacity-10">
            {[...Array(5)].map((_, i) => (
                <m.div
                    key={i}
                    className="absolute rounded-full filter blur-3xl"
                    style={{
                        width: Math.random() * 400 + 200,
                        height: Math.random() * 400 + 200,
                        backgroundColor: i % 2 === 0 ? '#fb923c' : '#1e3a8a',
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        x: [0, Math.random() * 100 - 50, 0],
                        y: [0, Math.random() * 100 - 50, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

export const Magnet = ({ children, distance = 40 }: { children: React.ReactNode, distance?: number }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
    const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

    function handleMouseMove(e: React.MouseEvent) {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = (e.clientX - centerX) / (rect.width / 2);
        const y = (e.clientY - centerY) / (rect.height / 2);
        mouseX.set(x * distance);
        mouseY.set(y * distance);
    }

    function handleMouseLeave() {
        mouseX.set(0);
        mouseY.set(0);
    }

    return (
        <m.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
        >
            {children}
        </m.div>
    );
};

export const PerspectiveCard = ({ children }: { children: React.ReactNode }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <m.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateY,
                rotateX,
                transformStyle: "preserve-3d",
            }}
            className="transition-transform duration-200"
        >
            <div
                style={{
                    transform: "translateZ(50px)",
                    transformStyle: "preserve-3d",
                }}
            >
                {children}
            </div>
        </m.div>
    );
};

export default function MotionGraphics() {
    return (
        <>
            <ScrollProgress />
            <MouseFollower />
            <FloatingShapes />
        </>
    );
}
