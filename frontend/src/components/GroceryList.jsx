import { useState } from 'react';
import { CornerPins } from './Pushpin.jsx';

// Plain-text rendering of the list, sized for a phone screen: short lines, ASCII
// checkboxes (survive any font/app you paste into), on-hand items kept in place
// so you can still verify the pantry while you shop.
function buildListText(items, saleItems, regularItems, estimatedTotal, taxRate, taxAmount) {
  const line = (item) => {
    const parts = [item.name];
    if (item.onHand) {
      parts.push('on hand');
    } else {
      if (item.quantityLabel) parts.push(item.quantityLabel);
      parts.push(`$${item.totalCost.toFixed(2)}`);
      if (item.saleStore) parts.push(`@ ${item.saleStore}`);
    }
    return `${item.onHand ? '[x]' : '[ ]'} ${parts.join(' · ')}`;
  };

  const out = [
    'SHOPPING LIST',
    `${items.length} items · ${items.filter(i => i.onHand).length} on hand · ${saleItems.length} deals`,
  ];

  if (saleItems.length) {
    out.push('', '* DEALS', ...saleItems.map(line));
    if (regularItems.length) out.push('', 'REGULAR PRICE', ...regularItems.map(line));
  } else {
    out.push('', ...regularItems.map(line));
  }

  out.push('', '----------------', `EST. TOTAL  ~$${estimatedTotal?.toFixed(2)}`);
  if (taxRate > 0) {
    out.push(`(incl. $${taxAmount.toFixed(2)} est. tax @ ${(taxRate * 100).toFixed(1)}%)`);
  }
  out.push('', 'Estimated from local averages + this week’s ads — register may vary a few dollars.');

  return out.join('\n');
}

export default function GroceryList({ items, estimatedTotal, taxRate = 0, taxAmount = 0 }) {
  const saleItems = items.filter(i => i.onSale);
  const regularItems = items.filter(i => !i.onSale);
  const [copyState, setCopyState] = useState('idle'); // idle | copied | failed

  async function copyList() {
    const text = buildListText(items, saleItems, regularItems, estimatedTotal, taxRate, taxAmount);
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      // Older browsers, or a non-secure origin, where the async clipboard is unavailable.
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      document.body.removeChild(ta);
    }
    setCopyState(ok ? 'copied' : 'failed');
    setTimeout(() => setCopyState('idle'), 2000);
  }

  return (
    <div className="grocery-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 20, alignItems: 'start' }}>

      {/* Item list */}
      <div style={{
        background: '#faf5e8',
        border: '1px solid #d4c9b0',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 3px 5px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.3), 0 16px 30px rgba(0,0,0,0.2)',
        borderLeft: '40px solid #f0e4d4',
        position: 'relative',
      }}>
        <CornerPins />
        <div style={{
          padding: '20px 26px 18px',
          borderBottom: '2px solid #c4b8a0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div>
            <h2 style={{
              fontFamily: 'Pinyon Script, cursive',
              fontSize: 34,
              fontWeight: 400,
              color: '#3a2a18',
            }}>
              Shopping List
            </h2>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13,
              fontWeight: 700,
              color: '#8a7a66',
              marginTop: 5,
              letterSpacing: '0.03em',
            }}>
              {items.length} items · {items.filter(i => i.onHand).length} on hand · {saleItems.length} deals
            </p>
          </div>
          <button
            onClick={copyList}
            aria-label="Copy shopping list to clipboard"
            style={{
              background: copyState === 'copied'
                ? 'linear-gradient(180deg, #cfe0bc 0%, #a8c48c 50%, #85a468 100%)'
                : copyState === 'failed'
                  ? 'linear-gradient(180deg, #e8c4b4 0%, #cf9c84 50%, #b07a60 100%)'
                  : 'linear-gradient(180deg, #f0e4c8 0%, #ddd0aa 20%, #c8b888 50%, #b0a070 80%, #9a8a5e 100%)',
              color: '#2a1a0e',
              fontFamily: 'Amatic SC, cursive',
              fontWeight: 700,
              padding: '7px 18px',
              fontSize: 20,
              lineHeight: 1.1,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              border: '1px solid rgba(140,120,70,0.6)',
              borderTop: '2px solid rgba(255,245,220,0.7)',
              borderBottom: '3px solid rgba(80,60,30,0.7)',
              borderRadius: 8,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {copyState === 'copied' ? '✓ Copied!' : copyState === 'failed' ? 'Copy Failed' : 'Copy List'}
          </button>
        </div>

        {saleItems.length > 0 && (
          <div style={{ padding: '16px 26px 0' }}>
            <p style={{
              fontFamily: 'Pinyon Script, cursive',
              fontSize: 22,
              fontWeight: 400,
              color: '#b8860b',
              marginBottom: 6,
            }}>
              ★ Deals
            </p>
            {saleItems.map((item, i) => <ItemRow key={i} item={item} />)}
          </div>
        )}

        <div style={{ padding: saleItems.length > 0 ? '16px 26px' : '16px 26px 0' }}>
          {saleItems.length > 0 && (
            <p style={{
              fontFamily: 'Pinyon Script, cursive',
              fontSize: 22,
              fontWeight: 400,
              color: '#6b5a48',
              marginBottom: 6,
            }}>
              Regular Price
            </p>
          )}
          {regularItems.map((item, i) => <ItemRow key={i} item={item} />)}
        </div>

        <div style={{
          margin: '0 26px 22px',
          padding: '14px 0 0',
          borderTop: '2px solid #c4b8a0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}>
          <span style={{
            fontFamily: 'Pinyon Script, cursive',
            fontSize: 24,
            fontWeight: 400,
            color: '#6b5a48',
          }}>
            Estimated Total
          </span>
          <span style={{
            fontFamily: 'Pinyon Script, cursive',
            fontSize: 34,
            fontWeight: 400,
            color: '#3a2a18',
            letterSpacing: '0.01em',
          }}>
            <span style={{ fontSize: '0.65em', opacity: 0.7 }}>~</span>${estimatedTotal?.toFixed(2)}
          </span>
        </div>
        {taxRate > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '0 26px 4px',
          }}>
            <span style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 13,
              fontWeight: 600,
              fontStyle: 'italic',
              color: '#9a8a72',
            }}>
              Includes ${taxAmount.toFixed(2)} est. tax ({(taxRate * 100).toFixed(1)}%)
            </span>
          </div>
        )}
        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 12,
          fontWeight: 600,
          fontStyle: 'italic',
          color: '#9a8a72',
          marginTop: 10,
          padding: '0 26px 14px',
          lineHeight: 1.4,
        }}>
          Prices are estimates from local averages and this week's ads — expect your register total to
          land within a few dollars. The savings come from <em>which</em> meals made the list, not the
          pennies: every pick is anchored to what's actually on sale near you.
        </p>
      </div>

      {/* Side summary — cutting board style */}
      <div style={{
        background: `
          url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='800' height='200'><filter id='w'><feTurbulence type='fractalNoise' baseFrequency='0.015 0.2' numOctaves='6' seed='5' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncR type='linear' slope='0.15' intercept='0'/><feFuncG type='linear' slope='0.12' intercept='0'/><feFuncB type='linear' slope='0.08' intercept='0'/><feFuncA type='linear' slope='0.35' intercept='0'/></feComponentTransfer></filter><rect width='800' height='200' filter='url(#w)'/></svg>`)}"),
          repeating-linear-gradient(0deg, rgba(120,80,35,0.12) 0px, transparent 1px, transparent 3px, rgba(100,65,25,0.06) 4px, transparent 5px, transparent 8px),
          repeating-linear-gradient(0deg, transparent 0px, transparent 14px, rgba(80,50,20,0.1) 15px, transparent 16px, transparent 35px, rgba(90,55,22,0.07) 36px, transparent 37px, transparent 60px),
          linear-gradient(90deg, #8a6238 0%, #96703e 8%, #a07848 20%, #946c3a 35%, #a57c4a 50%, #9a7242 65%, #a07848 80%, #8e6838 92%, #8a6238 100%)
        `.trim(),
        position: 'relative',
        border: '3px solid #6b4e2e',
        borderRadius: 8,
        padding: '22px 24px',
        boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.15), inset 0 -2px 6px rgba(0,0,0,0.22), 0 3px 5px rgba(0,0,0,0.38), 0 8px 16px rgba(0,0,0,0.32), 0 16px 30px rgba(0,0,0,0.2)',
      }}>
        <CornerPins />
        <h3 style={{
          fontFamily: 'Pinyon Script, cursive',
          fontSize: 30,
          fontWeight: 400,
          color: '#faf5e8',
          marginBottom: 3,
          textShadow: '2px 2px 0px rgba(60,35,10,0.8), 4px 4px 6px rgba(0,0,0,0.4)',
        }}>
          Budget Summary
        </h3>
        <p style={{
          fontFamily: 'Amatic SC, cursive', textTransform: 'uppercase',
          fontSize: 18,
          fontWeight: 700,
          color: 'rgba(250,245,232,0.9)',
          marginBottom: 22,
          textShadow: '1px 2px 3px rgba(0,0,0,0.5)',
        }}>
          Estimated weekly spend
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SummaryLine label="Groceries" value={`~$${estimatedTotal?.toFixed(2)}`} large />
          <SummaryLine label="On hand" value={items.filter(i => i.onHand).length} />
          <SummaryLine label="To buy" value={items.filter(i => !i.onHand).length} />
          <SummaryLine label="Deals" value={saleItems.filter(i => !i.onHand).length} />
        </div>

        <div style={{
          marginTop: 22,
          padding: '14px 16px',
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid rgba(250,245,232,0.15)',
          borderRadius: 8,
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 14,
          fontWeight: 600,
          color: 'rgba(250,245,232,0.9)',
          lineHeight: 1.7,
          textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
        }}>
          <strong style={{ color: '#eaa221', fontWeight: 700 }}>Tip:</strong>{' '}
          Hit "Change It Up!" button to spice up your recipe variety!
        </div>
      </div>
    </div>
  );
}

function ItemRow({ item }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid #3a5a8a',
      gap: 12,
      opacity: item.onHand ? 0.5 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
        <span style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 15,
          fontWeight: 600,
          color: item.onHand ? '#b0a898' : '#3a2a18',
          textDecoration: item.onHand ? 'line-through' : 'none',
        }}>
          {item.name}
        </span>
        {item.quantityLabel && !item.onHand && (
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            color: '#5a4a30',
            background: 'rgba(58, 42, 24, 0.12)',
            padding: '2px 7px',
            borderRadius: 4,
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
          }}>
            {item.quantityLabel}
          </span>
        )}
        {item.onHand && (
          <span style={{
            background: '#1a6b3a',
            color: '#f0e8da',
            fontSize: 11,
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: 4,
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.05em',
          }}>
            ON HAND
          </span>
        )}
        {item.onSale && !item.onHand && (
          <span style={{
            background: 'var(--sale)',
            color: '#1a1400',
            fontSize: 12,
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: 4,
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.05em',
          }}>
            ★ DEAL{item.saleStore ? ` @ ${item.saleStore}` : ''}
          </span>
        )}
      </div>
      <span style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontWeight: 700,
        fontSize: 16,
        color: item.onHand ? '#b0a898' : (item.onSale ? '#b8860b' : '#3a2a18'),
        whiteSpace: 'nowrap',
        textDecoration: item.onHand ? 'line-through' : 'none',
      }}>
        ${item.totalCost.toFixed(2)}
      </span>
    </div>
  );
}

function SummaryLine({ label, value, large }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{
        fontFamily: 'Amatic SC, cursive', textTransform: 'uppercase',
        fontSize: 21,
        fontWeight: 700,
        color: 'rgba(250,245,232,0.9)',
        textShadow: '1px 2px 3px rgba(0,0,0,0.5)',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: large ? 'Pinyon Script, cursive' : 'JetBrains Mono, monospace',
        fontSize: large ? 30 : 16,
        fontWeight: large ? 400 : 700,
        color: large ? '#eaa221' : '#faf5e8',
        letterSpacing: large ? '0.01em' : '0',
        textShadow: large ? '2px 2px 0px rgba(60,35,10,0.8), 4px 4px 6px rgba(0,0,0,0.4)' : '1px 1px 2px rgba(0,0,0,0.4)',
      }}>
        {value}
      </span>
    </div>
  );
}
