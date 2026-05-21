/** 
```
export default function Component({ param }) {
  const request = useQuery(async () => {
    const response = await getDataFromServer(param);
    return response.data;
  }, [param]);

  if (request.status === 'loading') {
    return <p>Loading...</p>;
  }

  if (request.status === 'error') {
    return <p>Error: {request.error.message}</p>;
  }

  return <p>Data: {request.data}</p>;
}
```
**/

import { useEffect, useRef, useState } from 'react';

type QueryState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: unknown };

export default function useQuery<T>(
  queryFn: () => Promise<T>,
  dependencies: React.DependencyList = [],
): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({
    status: 'loading',
  });

  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let isActive = true;

    setState({ status: 'loading' });

    queryFn()
      .then((data) => {
        if (!isActive || requestId !== requestIdRef.current) {
          return;
        }

        setState({
          status: 'success',
          data,
        });
      })
      .catch((error) => {
        if (!isActive || requestId !== requestIdRef.current) {
          return;
        }

        setState({
          status: 'error',
          error,
        });
      });

    return () => {
      isActive = false;
    };
  }, dependencies);

  return state;
}

```
import { renderHook, waitFor } from '@testing-library/react';

import useQuery from './use-query';

describe('useQuery', () => {
  test('return values', () => {
    const { result } = renderHook(() => useQuery(async () => true));

    expect(typeof result.current).toBe('object');
    expect(result.current).toHaveProperty('status');
  });

  test('loading state', () => {
    const { result } = renderHook(() => useQuery(async () => true));

    expect(result.current.status).toBe('loading');
  });

  test('success state', async () => {
    const { result } = renderHook(() => useQuery(async () => 10));

    await waitFor(() => {
      expect(result.current).toEqual({
        status: 'success',
        data: 10,
      });
    });
  });

  test('error state', async () => {
    const error = new Error('error');

    const { result } = renderHook(() =>
      useQuery(async () => {
        throw error;
      }),
    );

    await waitFor(() => {
      expect(result.current).toStrictEqual({
        status: 'error',
        error,
      });
    });
  });
});
```
