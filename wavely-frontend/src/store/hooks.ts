import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './index';

// typed hooks — always use these instead of plain useDispatch/useSelector
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
