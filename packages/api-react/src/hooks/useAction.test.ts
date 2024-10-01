import { renderHook, waitFor } from '@testing-library/react';
import { ApiResponse } from '@vergestack/api';
import { StatusCodes } from 'http-status-codes';
import { act } from 'react';
import { useAction } from './useAction';

describe('useAction', () => {
  const mockActionHandler = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAction(mockActionHandler));

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.errors).toEqual([]);
    expect(result.current.data).toBeUndefined();
    expect(result.current.status).toBeUndefined();
  });

  it('should handle successful action execution', async () => {
    const successResponse: ApiResponse<string> = {
      data: 'Success',
      status: StatusCodes.OK
    };
    mockActionHandler.mockResolvedValue(successResponse);

    const { result } = renderHook(() => useAction(mockActionHandler));

    act(() => {
      result.current.execute({ test: 'data' });
    });

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBe('Success');
    expect(result.current.status).toBe(StatusCodes.OK);
    expect(result.current.errors).toEqual([]);
  });

  it('should handle action execution with errors', async () => {
    const errorResponse: ApiResponse<null> = {
      status: StatusCodes.BAD_REQUEST,
      errors: [{ message: 'Invalid input', reason: 'test' }]
    };
    mockActionHandler.mockResolvedValue(errorResponse);

    const { result } = renderHook(() => useAction(mockActionHandler));

    act(() => {
      result.current.execute({ test: 'data' });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.status).toBe(StatusCodes.BAD_REQUEST);
    expect(result.current.errors).toEqual([
      { message: 'Invalid input', reason: 'test', isReasonRegistered: false }
    ]);
  });

  it('should handle form data execution', async () => {
    const successResponse: ApiResponse<string> = {
      data: 'Form Success',
      status: StatusCodes.OK
    };
    mockActionHandler.mockResolvedValue(successResponse);

    const { result } = renderHook(() => useAction(mockActionHandler));

    const formData = new FormData();
    formData.append('name', 'John');
    formData.append('age', '30');

    act(() => {
      result.current.executeForm(formData);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mockActionHandler).toHaveBeenCalledWith({ name: 'John', age: '30' });
    expect(result.current.data).toBe('Form Success');
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.errors).toEqual([]);
    expect(result.current.status).toBe(StatusCodes.OK);
  });

  it('should handle getFormError correctly', async () => {
    const errorResponse: ApiResponse<null> = {
      status: StatusCodes.BAD_REQUEST,
      errors: [
        { message: 'Name is required', reason: 'name' },
        { message: 'Age must be a number', reason: 'age' }
      ]
    };
    mockActionHandler.mockResolvedValue(errorResponse);

    const { result } = renderHook(() => useAction(mockActionHandler));

    act(() => {
      result.current.execute({ name: '', age: 'invalid' });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.getFormError('name')).toBe('Name is required');
    expect(result.current.getFormError('age')).toBe('Age must be a number');
    expect(result.current.getFormError('email')).toBeUndefined();
  });
});
