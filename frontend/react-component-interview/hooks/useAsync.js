import React, {useEffect, useState, useCallback, useRef} from "react";

function useAsync(asyncFunction) {
  const [state, setState] = React.useState({
    status: "idle",
    data: null,
    error: null,
  });

  const requestIdRef = React.useRef(0);
  const abortControllerRef = React.useRef(null);

  const execute = React.useCallback(
    async (...args) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const requestId = ++requestIdRef.current;

      setState({
        status: "loading",
        data: null,
        error: null,
      });

      try {
        const data = await asyncFunction(...args, controller.signal);

        // Ignore stale response
        if (requestId !== requestIdRef.current) {
          return;
        }

        setState({
          status: "success",
          data,
          error: null,
        });

        return data;
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        if (requestId !== requestIdRef.current) {
          return;
        }

        setState({
          status: "error",
          data: null,
          error,
        });

        throw error;
      }
    },
    [asyncFunction]
  );

  const reset = React.useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    requestIdRef.current += 1;

    setState({
      status: "idle",
      data: null,
      error: null,
    });
  }, []);

  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    isIdle: state.status === "idle",
    isLoading: state.status === "loading",
    isSuccess: state.status === "success",
    isError: state.status === "error",
  };
}