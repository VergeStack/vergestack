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

    let isPendingChecked = false;

    act(() => {
      result.current.execute({ test: 'data' }).then(() => {
        isPendingChecked = true;
      });
    });

    await waitFor(() => {
      if (!isPendingChecked) {
        expect(result.current.isPending).toBe(true);
        isPendingChecked = true;
      }
    });

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

  it('should call callbacks in correct order: onStart, onSuccess, onComplete', async () => {
    const successResponse: ApiResponse<string> = {
      data: 'Success',
      status: StatusCodes.OK
    };
    mockActionHandler.mockResolvedValue(successResponse);

    const callOrder: string[] = [];
    const mockOnStart = jest.fn(() => callOrder.push('onStart'));
    const mockOnSuccess = jest.fn(() => callOrder.push('onSuccess'));
    const mockOnComplete = jest.fn(() => callOrder.push('onComplete'));

    const { result } = renderHook(() =>
      useAction(mockActionHandler, {
        onStart: mockOnStart,
        onSuccess: mockOnSuccess,
        onComplete: mockOnComplete
      })
    );

    await act(async () => {
      await result.current.execute({ test: 'data' });
    });

    expect(callOrder).toEqual(['onStart', 'onSuccess', 'onComplete']);
  });

  it('should call callbacks in correct order: onStart, onError, onComplete', async () => {
    const errorResponse: ApiResponse<null> = {
      status: StatusCodes.BAD_REQUEST,
      errors: [
        { message: 'Name is required', reason: 'name' },
        { message: 'Age must be a number', reason: 'age' }
      ]
    };
    mockActionHandler.mockResolvedValue(errorResponse);

    const callOrder: string[] = [];
    const mockOnStart = jest.fn(() => callOrder.push('onStart'));
    const mockOnError = jest.fn(() => callOrder.push('onError'));
    const mockOnComplete = jest.fn(() => callOrder.push('onComplete'));

    const { result } = renderHook(() =>
      useAction(mockActionHandler, {
        onStart: mockOnStart,
        onError: mockOnError,
        onComplete: mockOnComplete
      })
    );

    await act(async () => {
      await result.current.execute({ test: 'data' });
    });

    expect(callOrder).toEqual(['onStart', 'onError', 'onComplete']);
  });
});
