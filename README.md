<p align="center">
  <img src="icon.svg" alt="rbitcoin.space Logo" width="21%">
</p>

# rbitcoin.space on StartOS

> Everything not listed in this document should behave the same as upstream
> rbitcoin.space. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[rbitcoin.space](https://github.com/smolcars/rbitcoin-space) explores the chain and mempool supplied by rbitcoin.

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

## Image and Container Runtime

The unmodified upstream `ghcr.io/smolcars/rbitcoin-space` image supplies both the Rust server and built frontend for x86_64 and aarch64. The `explorer` subcontainer uses its entrypoint as uid/gid 65532. The package creates and assigns ownership of the writable data directory before launch. It listens on IPv6 and IPv4 through an IPv6 wildcard socket.

## Volume and Data Layout

The `data` volume is mounted at `/data`. It contains `mainnet.sqlite` and its journal files, plus `lightning/mainnet/` when Lightning is enabled. The `startos` volume contains package preferences in `store.json`.

The node's `main` volume is mounted read-only at `/mnt/rbitcoin`. Package JavaScript reads `datadir/rpc.cookie` through the mounted subcontainer rootfs. It passes the parsed credentials through environment variables; it never writes the cookie to an explorer volume or backup. Watching the directory-backed cookie read restarts the explorer when credentials change, including file replacement. The application user cannot traverse rbitcoin's owner-only data directory.

## File Models

`startos/store.json` is a loose JSON model containing `lightning` and `mcp`, both defaulting to false. The settings action updates it; upstream configuration is passed through the environment on every launch. Unknown JSON fields survive writes. The dependency cookie uses a read-only string file model and is never rewritten.

## Dependencies

The local `rbitcoin` service is required, with its RPC, Electrum, and Esplora health checks. The package resolves the `rpc`, `electrum`, and `esplora` hosts through their assigned plaintext bridge addresses, watching each separately. Missing bindings produce an actionable connection failure and heal when the bindings appear.

The dependency initializer creates recurring critical configuration tasks for rbitcoin's exported `apis` and `indexes` actions. Partial input requirements enable RPC, Electrum, Esplora, and `sh_index`, preserving unrelated settings. These tasks are satisfied by the current action input and reappear on configuration drift. They require user action; the package does not invoke node actions or restart the node automatically. The ordinary dependency declaration displays warnings, while critical configuration tasks gate explorer startup. The provider owns RPC credential generation.

## Network Access and Interfaces

The Explorer UI and Esplora-compatible API share HTTP port 8080 with StartOS TLS termination. WebSocket paths share that interface. The upstream explorer is unauthenticated and permits transaction broadcasting. Only publish it where that access is intended.

The package preserves Host and Origin at the proxy. StartOS replaces client-supplied forwarded headers and inserts `X-Forwarded-For`; the explorer trusts that header only from the bridge gateway returned by `sdk.getOsIp`. Per-client request and WebSocket quotas therefore use the forwarded client address. Visitors behind the same NAT or upstream tunnel may still share an address. Request logging records failures only and omits client addresses; Cloudflare analytics is disabled.

Lightning is outbound-only when enabled, using upstream public clearnet peers. Ark endpoints are unset. Node API calls remain on the server bridge.

## Installation and First-Run Flow

No explorer credential is generated or requested. Runtime reads the node's existing cookie. Missing APIs or credentials leave the explorer stopped with a connection failure. The existing node's address index must also be enabled for address pages. Data ownership is set before each launch, including after restore.

## Actions

Changing the Lightning preference restarts only the explorer. It is safe to repeat and preserves the SQLite history and existing Lightning identity. Enabling Lightning increases memory use and starts direct connections to public peers; disabling it retains the files for reuse.

The MCP preference controls the read-only `/mcp` endpoint on the Explorer interface. It defaults to disabled. Saving restarts the explorer; enabled clients use Streamable HTTP without authentication. MCP has no transaction-broadcast tool.

## Tasks

Two recurring cross-service tasks require rbitcoin's client APIs and address-history index. They point to the node's existing configuration actions and block the explorer while those requirements are unsatisfied. The node's own credential task handles missing RPC credentials.

## Health Checks

Daemon readiness confirms that the web port is listening. Separate ongoing checks verify RPC/Electrum connectivity, Esplora block data, explorer storage, and the address-history index. The Esplora check requires a successful response containing a valid block height. The other checks validate the mainnet state in `/readyz`, including responses with HTTP 503; HTTP 200 alone does not establish success.

Storage reports failures for an unopenable database, failed writes, a chain mismatch, or disabled storage. Its `waiting` state reports a known prerequisite wait for chain verification. An unknown address-index state waits for the node's check; `off` reports a failure directing the user to enable the index. Authentication and wrong-network errors are reported explicitly. Checks poll every 30 seconds when healthy and every five seconds while starting or failing. These checks do not establish that backfill is finished or the chain tip is current; synchronization remains the node's responsibility.

## Backups and Restore

Both owned volumes are backed up while the service is stopped. This preserves SQLite, observed history, Lightning identity and graph, and preferences. The node mount is excluded. Restoring requires the separate rbitcoin service; the restored explorer reads its current cookie and addresses instead of restoring old credentials. Removing the data volume loses observations that a later chain backfill cannot reconstruct, such as old mempool replacements.

## Limitations and Differences

This package serves mainnet only, using the local rbitcoin service. Remote nodes, test networks, and Ark configuration are not exposed. Esplora uses TCP, so upstream bulk routes restricted to a Unix socket are unavailable and very large address pages retain the node's cap. A pruned node cannot supply all historical blocks for backfill. Initial history loading can take time and shares node resources with other clients.

## Quick Reference for AI Consumers

```yaml
package_id: rbitcoin-space
image: ghcr.io/smolcars/rbitcoin-space
architectures: [x86_64, aarch64]
subcontainers: [explorer]
volumes:
  data: /data
  startos: package preferences
file_models:
  - startos/store.json
  - /mnt/rbitcoin/datadir/rpc.cookie (read-only dependency)
startos_managed_env_vars:
  - LISTEN_ADDR
  - WEB_DIR
  - DATA_DIR
  - MAINNET_RPC_HOST
  - MAINNET_RPC_PORT
  - MAINNET_RPC_USER
  - MAINNET_RPC_PASSWORD
  - MAINNET_ESPLORA_URL
  - MAINNET_ELECTRUM_ADDR
  - MAINNET_LIGHTNING_ENABLED
  - MCP_ENABLED
  - LOG_REQUESTS
  - LOG_CLIENT_ADDR
  - CLOUDFLARE_WEB_ANALYTICS
  - TRUSTED_PROXY_HEADER
  - TRUSTED_PROXIES
dependencies: [rbitcoin]
interfaces:
  ui: { type: ui, port: 8080 }
actions: [settings]
tasks:
  - { package: rbitcoin, action: apis, severity: critical }
  - { package: rbitcoin, action: indexes, severity: critical }
health_checks: [explorer, node-connection, esplora, storage, address-index]
```
