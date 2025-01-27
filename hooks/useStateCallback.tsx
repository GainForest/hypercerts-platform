import { useCallback, useEffect, useRef, useState } from "react";
import type { SetStateAction } from "react";

export type StateCallback<T> = (newState: T) => void;

export type SetStateCallbackGeneric<S> = (
	x: SetStateAction<S>,
	cb?: StateCallback<S>,
) => void;

const useStateCallback = <T,>(
	initialState: T,
): [T, SetStateCallbackGeneric<T>] => {
	const [state, setState] = useState<T>(initialState);
	const cbRef = useRef<StateCallback<T>>();

	const setStateCallback: SetStateCallbackGeneric<T> = useCallback(
		(newState: SetStateAction<T>, cb?: StateCallback<T>) => {
			cbRef.current = cb;
			setState(newState);
		},
		[],
	);

	useEffect(() => {
		cbRef?.current?.(state);
		cbRef.current = undefined;
	}, [state]);

	return [state, setStateCallback];
};

export default useStateCallback;
