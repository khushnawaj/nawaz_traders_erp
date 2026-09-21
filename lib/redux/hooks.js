import { useDispatch, useSelector } from 'react-redux';

/**
 * Custom hook to dispatch Redux actions.
 */
export const useAppDispatch = () => useDispatch();

/**
 * Custom hook to select Redux state slice.
 */
export const useAppSelector = (selector) => useSelector(selector);
