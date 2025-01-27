"use client";

import { useState } from "react";

const useCopy = () => {
	const [isCopied, setIsCopied] = useState(false);

	const copy = (text: string) => {
		navigator.clipboard.writeText(text);
		setIsCopied(true);
		setTimeout(() => {
			setIsCopied(false);
		}, 2000);
	};

	return { isCopied, copy };
};

export default useCopy;
