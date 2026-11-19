# rbitcoin.space

## Documentation

- [Upstream documentation](https://github.com/smolcars/rbitcoin-space/tree/master/docs) — explorer features, API, configuration, storage, and Lightning behavior.

## Getting set up

1. Use your local **rbitcoin** service as the mainnet node. Complete the required configuration prompts for **Client APIs** and **Indexes**. They enable **JSON-RPC**, **Electrum server**, **Esplora REST API**, and the **Address history index**. Applying these node settings can restart rbitcoin and build its index.
2. Generate RPC credentials in rbitcoin if you have not already done so. The explorer reads its RPC cookie automatically; you do not need to copy a password.
3. Let rbitcoin finish synchronization and indexing. A pruned node may lack older blocks needed for complete explorer history.
4. Open **Explorer**. It has no login. The initial block and mining history loads in the background; new data appears as the node supplies it.

## Using the explorer

The Explorer interface serves the mainnet website, live updates, and the Esplora-compatible API. Anyone who can reach it can browse indexed chain data and broadcast transactions. Publish that interface only to your intended audience.

Use **Explorer settings** to enable the Lightning graph. Lightning is disabled initially; enabling it uses additional memory and connects directly to public Lightning peers. It observes public gossip and holds no funds. If you publish the explorer through a tunnel to keep your home IP private, route its outbound traffic through that tunnel too; otherwise Lightning peers can see your home IP. If the tunnel is only for reachability, no routing change is needed for that reason.

To let AI clients query the explorer, enable **Read-only MCP server** in **Explorer settings**. Append `/mcp` to your Explorer address and select **Streamable HTTP** in the client. It has no login and cannot broadcast transactions. It is disabled initially; when enabled, anyone who can reach your Explorer address can query it.

### Ark explorers

In **Explorer settings**, select **Disabled**, **Public server**, or **Custom URL** separately for **Bark explorer** and **Arkade explorer**. Both start disabled. Public server uses Second’s `https://ark.second.tech` for Bark and `https://arkade.computer` for Arkade. Saving restarts the explorer; the **Ark** navigation then offers the enabled providers.

For a custom server, enter a compatible mainnet operator API endpoint. Bark needs a gRPC API over HTTP/2 and accepts only an HTTP(S) host and optional port; Arkade needs its public REST indexer and also accepts a base path. Credentials, query strings and fragments are not accepted. Private certificate authorities and authenticated endpoints are not configurable here.

Lookups cover the selected operator’s data. Arkade supports VTXO and address lookups; Bark supports VTXO lookups and supported exit-path verification but cannot establish unspent status. Arkade amounts and off-chain states are reported by its operator. Bitcoin transaction status comes from your local node. These settings do not create an Ark wallet or run an Ark operator.

The selected operator receives your lookup requests and sees your explorer’s outbound IP. If you publish the explorer through a tunnel for IP privacy, route its outbound Ark requests through that tunnel too. A provider outage is shown on its lookup page; the explorer’s existing health checks do not establish Ark connectivity. Check the selected URL and operator if Ark lookups fail.

## Backups

Explorer backups preserve its observed history, preferences, and any Lightning identity and graph. Keep the rbitcoin service and its credentials available separately.

Back up the explorer before updating to 0.4.0. To return to an earlier version,
restore a backup from before the update using the matching package version.

## Missing data or connection errors

Check rbitcoin's API health and synchronization first. Complete any required configuration prompts; they reappear if a needed API or the address-history index is disabled. Confirm that RPC credentials exist. If you replace the node's credentials, the explorer picks up its updated cookie automatically.

The explorer reports **Esplora API**, **Explorer storage**, and **Address-history index** separately from its node connection. For a storage failure, check the service logs and free disk space. A storage wait for chain verification can resolve once the node checks finish. For an Esplora failure, check rbitcoin's Esplora API health. An enabled address index does not mean synchronization or historical backfill has finished.

The package serves mainnet only. Ark pages require a provider selected in Explorer settings. Very large addresses remain subject to the node's address-history limits, and historical mining data depends on retained blocks. Preserve explorer backups to retain observations such as past mempool replacements.
