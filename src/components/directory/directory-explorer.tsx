'use client';

import { useMemo, useState } from 'react';

type DirectoryEntry = {
  id: string;
  title: string;
  provider: string;
  url: string;
  price: string;
  status: string;
  description: string;
  tags: string[];
  searchBlob: string;
};

const directoryData: DirectoryEntry[] = [
  {
    id: 'coinapi-historical-prices',
    title: 'CoinAPI Historical Prices',
    provider: 'CoinAPI',
    url: 'https://coinapi.dev',
    price: '0.001 USDC per call',
    status: 'Live',
    description:
      'Millisecond-level historical spot prices for major assets, available via x402 micropayments that settle on Polygon.',
    tags: ['Historical Data', 'Market Data', 'Pricing', 'External Provider'],
  },
  {
    id: 'dapplooker-unified-token-intelligence',
    title: 'Unified Token Intelligence API',
    provider: 'DappLooker Data APIs',
    url: 'https://docs.dapplooker.com/data-apis-for-ai/api-endpoints#unified-token-intelligence-api',
    price: 'Usage-based',
    status: 'Live',
    description:
      'Aggregated token fundamentals, liquidity depth, and behavioral metrics unified across networks for downstream AI agents.',
    tags: ['Token Intelligence', 'Analytics', 'AI-ready'],
  },
  {
    id: 'dapplooker-token-directory',
    title: 'Token Directory',
    provider: 'DappLooker Data APIs',
    url: 'https://docs.dapplooker.com/data-apis-for-ai/api-endpoints#token-directory',
    price: 'Usage-based',
    status: 'Live',
    description:
      'Canonical metadata, contract addresses, and compliance-ready token profiles that help agents validate assets before transacting.',
    tags: ['Token Intelligence', 'Metadata', 'Discovery'],
  },
  {
    id: 'dapplooker-multi-interval-ta',
    title: 'Multi-Interval Technical Analysis',
    provider: 'DappLooker Data APIs',
    url: 'https://docs.dapplooker.com/data-apis-for-ai/api-endpoints#multi-interval-technical-analysis',
    price: 'Usage-based',
    status: 'Live',
    description:
      'Pre-computed indicators (RSI, MACD, volatility bands) across multiple timeframes to inform trading or hedging agents.',
    tags: ['Technical Analysis', 'Trading', 'Signals'],
  },
  {
    id: 'dapplooker-trending-tokens',
    title: 'Trending Tokens',
    provider: 'DappLooker Data APIs',
    url: 'https://docs.dapplooker.com/data-apis-for-ai/api-endpoints#trending-tokens',
    price: 'Usage-based',
    status: 'Live',
    description:
      'Surfacing velocity, volume, and sentiment spikes to help agents discover emerging Polygon assets in real time.',
    tags: ['Discovery', 'Token Intelligence', 'Sentiment'],
  },
  {
    id: 'dapplooker-hyperliquid-perp-trade',
    title: 'Hyperliquid Perp Trade Token Data',
    provider: 'DappLooker Data APIs',
    url: 'https://docs.dapplooker.com/data-apis-for-ai/api-endpoints#hyperliquid-perp-trade-token-data',
    price: 'Usage-based',
    status: 'Live',
    description:
      'Perpetual DEX order flow, funding rates, and open interest segmented by asset to guide leveraged strategies.',
    tags: ['Derivatives', 'Trading', 'Market Data'],
  },
  {
    id: 'dapplooker-staking-intelligence',
    title: 'Staking Intelligence',
    provider: 'DappLooker Data APIs',
    url: 'https://docs.dapplooker.com/data-apis-for-ai/api-endpoints#staking-intelligence',
    price: 'Usage-based',
    status: 'Live',
    description:
      'Validator health, delegator flows, and APY trends so agents can auto-route staking decisions.',
    tags: ['Staking', 'Yield', 'Analytics'],
  },
  {
    id: 'dapplooker-smart-money-trends',
    title: 'Smart Money Trends',
    provider: 'DappLooker Data APIs',
    url: 'https://docs.dapplooker.com/data-apis-for-ai/api-endpoints#smart-money-trends',
    price: 'Usage-based',
    status: 'Live',
    description:
      'Tracks institutional wallets, whales, and programmatic flows to help agents mirror or hedge influential actors.',
    tags: ['Smart Money', 'Behavioral Data', 'Analytics'],
  },
  {
    id: 'dapplooker-historical-market-data',
    title: 'Historical Market Data',
    provider: 'DappLooker Data APIs',
    url: 'https://docs.dapplooker.com/data-apis-for-ai/api-endpoints#historical-market-data',
    price: 'Usage-based',
    status: 'Live',
    description:
      'Comprehensive OHLCV, liquidity, and volume history for Polygon-native assets, normalized for agent training.',
    tags: ['Historical Data', 'Market Data', 'Backtesting'],
  },
  {
    id: 'dapplooker-mcp-nlp-market-intel',
    title: 'MCP / NLP driven Market Intelligence',
    provider: 'DappLooker Data APIs',
    url: 'https://docs.dapplooker.com/data-apis-for-ai/api-endpoints#mcp-nlp-driven-market-intelligence',
    price: 'Usage-based',
    status: 'Live',
    description:
      'Natural-language programmable market analytics that expose MCP-compliant responses for conversational agents.',
    tags: ['NLP', 'AI-ready', 'Market Intelligence'],
  },
  {
    id: 'dapplooker-personalized-trading-engine',
    title: 'Personalized Trading Engine',
    provider: 'DappLooker Data APIs',
    url: 'https://docs.dapplooker.com/data-apis-for-ai/api-endpoints#personalized-trading-engine',
    price: 'Usage-based',
    status: 'Live',
    description:
      'Rule-driven and ML-personalized execution signals that agents can tailor per wallet or portfolio objective.',
    tags: ['Trading', 'AI-ready', 'Automation'],
  },
  {
    id: 'dapplooker-acp-activity-engine',
    title: 'ACP Activity Engine',
    provider: 'DappLooker Data APIs',
    url: 'https://docs.dapplooker.com/data-apis-for-ai/api-endpoints#acp-activity-engine-coming-soon',
    price: 'N/A',
    status: 'Coming Soon',
    description:
      'Planned activity stream for ACP-compatible agent commerce events so builders can subscribe to on-chain intents.',
    tags: ['Roadmap', 'Automation', 'Activity Feeds'],
  },
].map((entry) => ({
  ...entry,
  searchBlob: [
    entry.title,
    entry.provider,
    entry.description,
    entry.price,
    entry.status,
    ...(entry.tags ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase(),
}));

const allTags = Array.from(
  new Set(directoryData.flatMap((entry) => entry.tags ?? [])),
).sort((a, b) => a.localeCompare(b));

const fuzzyContains = (text: string, needle: string) => {
  if (!needle) return true;

  let idx = 0;
  for (const char of text) {
    if (char === needle[idx]) {
      idx += 1;
      if (idx === needle.length) return true;
    }
  }

  return false;
};

export function DirectoryExplorer() {
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const tokens = normalized ? normalized.split(/\s+/) : [];

    return directoryData.filter((entry) => {
      const matchesQuery =
        tokens.length === 0 ||
        tokens.every((token) => fuzzyContains(entry.searchBlob, token));
      const matchesTags =
        activeTags.length === 0 ||
        activeTags.every((tag) => entry.tags.includes(tag));

      return matchesQuery && matchesTags;
    });
  }, [query, activeTags]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearFilters = () => {
    setQuery('');
    setActiveTags([]);
  };

  return (
    <div
      style={{
        border: '1px solid var(--fd-border)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginTop: '2rem',
        background: 'var(--fd-background)',
        boxShadow: '0 4px 20px rgb(15 23 42 / 6%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <label
            htmlFor="api-search"
            style={{ fontWeight: 600, color: 'var(--fd-muted-foreground)' }}
          >
            Search across providers, endpoints, tags, or pricing
          </label>
          <input
            id="api-search"
            type="search"
            placeholder={'Try "staking", "historical", or "AI"'}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{
              border: '1px solid var(--fd-border)',
              borderRadius: '999px',
              padding: '0.75rem 1.25rem',
              fontSize: '1rem',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          <strong style={{ fontSize: '0.9rem' }}>Filter by tag:</strong>
          {allTags.map((tag) => {
            const isActive = activeTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                style={{
                  border: `1px solid ${
                    isActive ? 'var(--fd-primary)' : 'var(--fd-border)'
                  }`,
                  backgroundColor: isActive
                    ? 'rgba(99, 102, 241, 0.12)'
                    : 'transparent',
                  color: isActive ? 'var(--fd-primary)' : 'inherit',
                  borderRadius: '999px',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
              >
                {tag}
              </button>
            );
          })}
          {(query || activeTags.length > 0) && (
            <button
              type="button"
              onClick={clearFilters}
              style={{
                marginLeft: 'auto',
                fontSize: '0.85rem',
                color: 'var(--fd-muted-foreground)',
                textDecoration: 'underline',
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          color: 'var(--fd-muted-foreground)',
          fontSize: '0.9rem',
        }}
      >
        <span>
          Showing{' '}
          <strong>
            {filteredEntries.length}/{directoryData.length}
          </strong>{' '}
          APIs
        </span>
        <span>
          Tags selected: <strong>{activeTags.length}</strong>
        </span>
      </div>

      {filteredEntries.length === 0 ? (
        <div
          style={{
            marginTop: '1.5rem',
            border: '1px dashed var(--fd-border)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            color: 'var(--fd-muted-foreground)',
          }}
        >
          <p style={{ marginBottom: '0.5rem' }}>
            No APIs match that search yet.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            style={{
              border: 'none',
              background: 'var(--fd-primary)',
              color: 'white',
              borderRadius: '999px',
              padding: '0.5rem 1.25rem',
              cursor: 'pointer',
            }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div
          style={{
            marginTop: '1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {filteredEntries.map((entry) => (
            <a
              key={entry.id}
              href={entry.url}
              style={{
                textDecoration: 'none',
                color: 'inherit',
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                style={{
                  border: '1px solid var(--fd-border)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  background:
                    'linear-gradient(180deg, rgba(15,23,42,0.02), rgba(15,23,42,0.05))',
                  transition: 'transform 160ms ease, box-shadow 160ms ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.85rem',
                    color: 'var(--fd-muted-foreground)',
                  }}
                >
                  <span>{entry.provider}</span>
                  <span
                    style={{
                      borderRadius: '999px',
                      padding: '0.15rem 0.65rem',
                      border: '1px solid var(--fd-border)',
                      fontSize: '0.75rem',
                    }}
                  >
                    {entry.status}
                  </span>
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      color: 'var(--fd-primary)',
                      fontSize: '1.1rem',
                    }}
                  >
                    {entry.title}
                  </h3>
                  <p
                    style={{
                      marginTop: '0.35rem',
                      marginBottom: 0,
                      color: 'var(--fd-foreground)',
                    }}
                  >
                    {entry.description}
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: 'var(--fd-muted-foreground)',
                  }}
                >
                  <span>Pricing</span>
                  <strong style={{ color: 'var(--fd-foreground)' }}>
                    {entry.price}
                  </strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.35rem',
                    marginTop: 'auto',
                  }}
                >
                  {entry.tags.map((tag) => (
                    <span
                      key={`${entry.id}-${tag}`}
                      style={{
                        borderRadius: '999px',
                        padding: '0.2rem 0.75rem',
                        backgroundColor: 'rgba(148, 163, 184, 0.2)',
                        fontSize: '0.75rem',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

