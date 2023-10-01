import React, { useRef, useEffect } from "react";

export default function AnimatedCanvas<T>(
	props: {
		draw: (ctx: CanvasRenderingContext2D, data: T, time: number) => void;
		data: T;
		isEnabled: boolean;
		onResize: (canvas: HTMLCanvasElement) => void;
	} & Omit<React.CanvasHTMLAttributes<HTMLCanvasElement>, "onResize">
) {
	const { draw, data, isEnabled, style: canvasStyle, onResize: onCanvasResize, ...canvasProps } = props;
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!isEnabled || !draw) return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		const context = canvas.getContext("2d");
		if (!context) return;

		let requestId = 0;
		const wrapper = (time: number) => {
			draw(context, data, time);
			requestId = requestAnimationFrame(wrapper);
		};

		requestId = requestAnimationFrame(wrapper);
		return () => {
			if (requestId) cancelAnimationFrame(requestId);
		};
	}, [draw, data, isEnabled]);

	useEffect(() => {
		if (!canvasRef.current) return;

		const resizeObserver = new ResizeObserver(() => {
			if (canvasRef.current) onCanvasResize(canvasRef.current);
		});

		resizeObserver.observe(canvasRef.current);
		return () => resizeObserver.disconnect();
	}, [onCanvasResize]);

	return <canvas ref={canvasRef} style={canvasStyle} {...canvasProps} />;
}
