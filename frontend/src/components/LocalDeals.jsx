import { useState } from 'react';

export default function LocalDeals({ sales, zip, scrapedAt }) {
  const [expandedStores, setExpandedStores] = useState({});

  if (!sales || sales.length === 0) {
    return (
      <div style={{
        background: '#faf6ee',
        border: '1px solid #d4c9b0',
        borderRadius: 4,
        padding: '40px 28px',
        textAlign: 'center',
        borderLeft: '40px solid #f0e4d4',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 3px 5px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.3), 0 16px 30px rgba(0,0,0,0.2)',
      }}>
        <p style={{
          fontFamily: 'Pinyon Script, cursive',
          fontSize: 32,
          fontWeight: 400,
          color: '#3a2a18',
          marginBottom: 10,
        }}>
          No deals found
        </p>
        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 15,
          fontWeight: 600,
          color: '#8a7a66',
          lineHeight: 1.6,
        }}>
          Hit "↻ Find Me Deals!" to scrape live flyers for ZIP {zip}.
          <br />
          Deals are pulled from Walmart &amp; Hy-Vee weekly ads.
        </p>
      </div>
    );
  }

  const byStore = {};
  for (const item of sales) {
    const store = item.store || 'Other';
    if (!byStore[store]) byStore[store] = [];
    byStore[store].push(item);
  }

  const toggleStore = (store) => {
    setExpandedStores(prev => ({ ...prev, [store]: !prev[store] }));
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 20,
      }}>
        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--chalk)',
        }}>
          {sales.length} deals near ZIP {zip}
        </p>
        {scrapedAt && (
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--chalk-muted)',
          }}>
            updated {new Date(scrapedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(byStore).map(([store, items]) => {
          const isOpen = expandedStores[store] || false;
          return (
            <div key={store} style={{
              background: '#faf6ee',
              border: '1px solid #c4b8a0',
              borderTop: '1px solid rgba(255,255,255,0.4)',
              borderBottom: '2px solid rgba(160,140,100,0.5)',
              borderRadius: 6,
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 3px 5px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.3), 0 16px 30px rgba(0,0,0,0.18)',
              position: 'relative',
            }}>
              {/* Top tab */}
              <div
                onClick={() => toggleStore(store)}
                style={{
                  padding: '10px 18px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: 56,
                  cursor: 'pointer',
                  userSelect: 'none',
                  borderBottom: isOpen ? '1px solid #3a5a8a' : 'none',
                  background: 'linear-gradient(180deg, #fefcf6 0%, #f5efe4 50%, #ece4d4 100%)',
                }}
              >
                <h3 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#3a2a18',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                }}>
                  {store}
                  <span style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 18,
                    fontWeight: 700,
                    fontStyle: 'italic',
                    color: '#6b5a48',
                    letterSpacing: '0.05em',
                    textTransform: 'none',
                    marginLeft: 12,
                  }}>
                    {(() => {
                      const now = new Date();
                      const day = now.getDay();
                      const sun = new Date(now); sun.setDate(now.getDate() - day);
                      const sat = new Date(sun); sat.setDate(sun.getDate() + 6);
                      const fmt = (d) => `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;
                      return `${fmt(sun)} - ${fmt(sat)}`;
                    })()}
                  </span>
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 13,
                    fontWeight: 600,
                    fontStyle: 'italic',
                    color: '#9a8a72',
                  }}>
                    {items.length} deals
                  </span>
                  <span style={{
                    fontSize: 14,
                    color: '#9a8a72',
                    transition: 'transform 0.2s',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>
                    ▼
                  </span>
                </div>
              </div>
              {isOpen && (
                <div style={{ padding: '4px 18px 12px', background: '#faf6ee' }}>
                  {items.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      padding: '7px 0',
                      borderBottom: '1px solid #3a5a8a',
                      gap: 10,
                    }}>
                      <span style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#3a2a18',
                        flex: 1,
                      }}>
                        {item.name}
                      </span>
                      <span style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: 15,
                        fontWeight: 700,
                        fontStyle: 'italic',
                        color: '#6b8e3a',
                        whiteSpace: 'nowrap',
                      }}>
                        ${item.salePrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
