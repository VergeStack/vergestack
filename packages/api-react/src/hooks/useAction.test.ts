import { act, renderHook } from '@testing-library/react-hooks';
import { ApiResponse } from '@vergestack/api';
import { StatusCodes } from 'http-status-codes';
import { useAction } from './useAction';

describe('useAction', () => {
  const mockActionHandler = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAction(mockActionHandler));

    expect(result.current.loading).toBe(false);
    expect(result.current.errors).toEqual([]);
    expect(result.current.data).toBeNull();
    expect(result.current.status).toBeNull();
    expect(result.current.ok).toBe(false);
  });

  it('should handle successful action execution', async () => {
    const successResponse: ApiResponse<string> = {
      data: 'Success',
      status: StatusCodes.OK
    };
    mockActionHandler.mockResolvedValue(successResponse);

    const { result, waitForNextUpdate } = renderHook(() =>
      useAction(mockActionHandler)
    );

    act(() => {
      result.current.execute({ test: 'data' });
    });

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe('Success');
    expect(result.current.status).toBe(StatusCodes.OK);
    expect(result.current.ok).toBe(true);
    expect(result.current.errors).toEqual([]);
  });

  it('should handle action execution with errors', async () => {
    const errorResponse: ApiResponse<null> = {
      status: StatusCodes.BAD_REQUEST,
      errors: [{ message: 'Invalid input', path: 'test' }]
    };
    mockActionHandler.mockResolvedValue(errorResponse);

    const { result, waitForNextUpdate } = renderHook(() =>
      useAction(mockActionHandler)
    );

    act(() => {
      result.current.execute({ test: 'data' });
    });

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.status).toBe(StatusCodes.BAD_REQUEST);
    expect(result.current.ok).toBe(false);
    expect(result.current.errors).toEqual([
      { message: 'Invalid input', path: 'test' }
    ]);
  });

  it('should handle form data execution', async () => {
    const successResponse: ApiResponse<string> = {
      data: 'Form Success',
      status: StatusCodes.OK
    };
    mockActionHandler.mockResolvedValue(successResponse);

    const { result, waitForNextUpdate } = renderHook(() =>
      useAction(mockActionHandler)
    );

    const formData = new FormData();
    formData.append('name', 'John');
    formData.append('age', '30');

    act(() => {
      result.current.executeForm(formData);
    });

    await waitForNextUpdate();

    expect(mockActionHandler).toHaveBeenCalledWith({ name: 'John', age: '30' });
    expect(result.current.data).toBe('Form Success');
    expect(result.current.ok).toBe(true);
  });

  it('should handle getFormError correctly', async () => {
    const errorResponse: ApiResponse<null> = {
      status: StatusCodes.BAD_REQUEST,
      errors: [
        { message: 'Name is required', path: 'name' },
        { message: 'Age must be a number', path: 'age' }
      ]
    };
    mockActionHandler.mockResolvedValue(errorResponse);

    const { result, waitForNextUpdate } = renderHook(() =>
      useAction(mockActionHandler)
    );

    act(() => {
      result.current.execute({ name: '', age: 'invalid' });
    });

    await waitForNextUpdate();

    expect(result.current.getFormError('name')).toBe('Name is required');
    expect(result.current.getFormError('age')).toBe('Age must be a number');
    expect(result.current.getFormError('email')).toBeUndefined();
  });
});
