# Resilient Remote Module Host

## Goal

Implement `RemoteModuleHost` in `src/RemoteModuleHost.tsx`.

You are building the host-side boundary for a microfrontend that is loaded at runtime. The host owns loading and failure states and passes a small, typed contract to the remote module.

## Requirements

- Call `loadRemote()` when the host mounts.
- Show an accessible loading state while the remote is loading.
- Render the remote module's default component after it loads.
- Pass `tenantId` and `onNavigate` to the remote component.
- Show a user-visible error if loading fails.
- Provide a Retry button that makes a new call to `loadRemote()`.
- Clear the previous error when retrying.
- Ignore results from obsolete requests after the loader changes or the host unmounts.
- Keep the host/remote contract precisely typed.

## Discussion

Be ready to discuss how this boundary would integrate with Module Federation, versioned contracts, observability, and deployment rollback.

## Timebox

Aim for 35-40 minutes of implementation and 10 minutes of discussion.

## Commands

```sh
npm test
npm run dev
npm run typecheck
```
